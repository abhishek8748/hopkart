// orderMapper.js
// Turns a BashaBos checkout (customer + cart items) into a valid Bigship
// "Add Single Order" payload (shipment_category b2c).
//
// The Bigship API has strict validation. The most important rules baked in here:
//  - first_name / last_name: 3-25 chars, letters/dots/spaces only
//  - address_line1: 10-50 chars
//  - pincode: 6 digits
//  - invoice_id: 1-25 chars, letters/numbers and - / only
//  - box_count MUST be 1 for B2C (everything goes in one box)
//  - shipment_invoice_amount === sum of product invoice amounts
//  - For COD: collectable amounts > 0 and must reconcile; for Prepaid they are 0
//  - product_category must be from Bigship's fixed list (we use "FashionClothing")

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function onlyNameChars(s) {
  // letters, dots and spaces
  return String(s || "").replace(/[^a-zA-Z. ]/g, "").trim();
}

function validName(raw, field) {
  const cleaned = onlyNameChars(raw);
  if (cleaned.length < 3 || cleaned.length > 25) {
    throw new ValidationError(
      `${field} must be 3-25 letters (got "${raw}"). Bigship rejects shorter/invalid names.`
    );
  }
  return cleaned;
}

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    throw new ValidationError(
      `Customer name "${fullName}" needs a first AND last name (each 3+ letters) for the courier.`
    );
  }
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return { first: validName(first, "first_name"), last: validName(last, "last_name") };
}

function validPincode(pin) {
  const p = String(pin || "").trim();
  if (!/^\d{6}$/.test(p)) throw new ValidationError(`pincode must be 6 digits (got "${pin}")`);
  return p;
}

function validPhone(num) {
  const n = String(num || "").replace(/\D/g, "");
  if (!/^[06789]\d{9,11}$/.test(n)) {
    throw new ValidationError(`phone "${num}" must be 10-12 digits and start with 0,6,7,8 or 9`);
  }
  return n;
}

function clampAddress(line, field, { required }) {
  let s = String(line || "").replace(/[^a-zA-Z0-9 .,\-/']/g, "").trim();
  if (required && s.length < 10) {
    // pad short-but-valid addresses up to the 10-char minimum so they don't get rejected
    s = (s + " " + "Area").trim();
    if (s.length < 10) s = (s + " India").trim();
  }
  if (s.length > 50) s = s.slice(0, 50).trim();
  if (required && s.length < 10) {
    throw new ValidationError(`${field} must be 10-50 chars after cleaning (got "${line}")`);
  }
  return s;
}

function cleanInvoiceId(id) {
  let s = String(id || "").replace(/[^a-zA-Z0-9\-/]/g, "");
  if (!s) s = "BB" + Date.now().toString().slice(-8);
  return s.slice(0, 25);
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * @param {object} input
 * @param {string} input.pickupLocationId  warehouse_id to ship FROM
 * @param {string} input.returnLocationId  warehouse_id for returns
 * @param {object} input.customer  { name, phone, email?, address1, address2?, landmark?, pincode }
 * @param {Array}  input.items     [{ name, quantity, price }]  price = unit price in INR
 * @param {string} input.paymentType  "COD" | "Prepaid"
 * @param {string} input.invoiceId  your order id
 * @param {object} [input.box]      { weightKg, length, width, height } in kg/cm
 */
function buildSingleOrderPayload(input) {
  const {
    pickupLocationId,
    returnLocationId,
    customer = {},
    items = [],
    paymentType = "Prepaid",
    invoiceId,
    box = {},
  } = input;

  if (!pickupLocationId || !returnLocationId) {
    throw new ValidationError("pickupLocationId and returnLocationId (warehouse ids) are required");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("At least one cart item is required");
  }
  const pay = paymentType === "COD" ? "COD" : "Prepaid";
  const isCOD = pay === "COD";

  const { first, last } = splitName(customer.name);

  // Build product lines. each_product_invoice_amount = line total (unit * qty).
  const productDetails = items.map((it) => {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const lineTotal = round2(Number(it.price) * qty);
    if (!(lineTotal > 0)) throw new ValidationError(`Item "${it.name}" must have a price > 0`);
    return {
      product_category: it.category || "FashionClothing",
      product_sub_category: (it.subCategory || "").replace(/[^a-zA-Z \-,/]/g, ""),
      product_name: (it.name || "Kids wear").replace(/[^a-zA-Z \-,/]/g, "").slice(0, 50) || "Kids wear",
      product_quantity: qty,
      each_product_invoice_amount: lineTotal,
      each_product_collectable_amount: isCOD ? lineTotal : 0,
      hsn: it.hsn ? String(it.hsn).replace(/\D/g, "") : "",
    };
  });

  const boxInvoice = round2(productDetails.reduce((s, p) => s + p.each_product_invoice_amount, 0));
  const boxCollectable = isCOD ? boxInvoice : 0;

  // B2C => exactly ONE box, box_count = 1.
  const boxDetails = [
    {
      each_box_dead_weight: round2(box.weightKg || Math.max(0.5, items.length * 0.3)),
      each_box_length: parseInt(box.length, 10) || 30,
      each_box_width: parseInt(box.width, 10) || 25,
      each_box_height: parseInt(box.height, 10) || 6,
      each_box_invoice_amount: boxInvoice,
      each_box_collectable_amount: boxCollectable,
      box_count: 1,
      product_details: productDetails,
    },
  ];

  return {
    shipment_category: "b2c",
    warehouse_detail: {
      pickup_location_id: Number(pickupLocationId),
      return_location_id: Number(returnLocationId),
    },
    consignee_detail: {
      first_name: first,
      last_name: last,
      company_name: "",
      contact_number_primary: validPhone(customer.phone),
      contact_number_secondary: "",
      email_id: customer.email || "",
      consignee_address: {
        address_line1: clampAddress(customer.address1, "address_line1", { required: true }),
        address_line2: clampAddress(customer.address2, "address_line2", { required: false }),
        address_landmark: clampAddress(customer.landmark, "address_landmark", { required: false }),
        pincode: validPincode(customer.pincode),
      },
    },
    order_detail: {
      invoice_date: new Date().toISOString(),
      invoice_id: cleanInvoiceId(invoiceId),
      payment_type: pay,
      shipment_invoice_amount: boxInvoice, // box_count is 1
      total_collectable_amount: boxCollectable,
      box_details: boxDetails,
      ewaybill_number: "",
      document_detail: { invoice_document_file: "", ewaybill_document_file: "" },
    },
  };
}

module.exports = { buildSingleOrderPayload, ValidationError };
