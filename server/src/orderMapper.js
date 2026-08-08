// orderMapper.js
// Turns a BashaBos checkout (customer + cart items) into a Bigship Direct
// "Create Order" payload for segment_type "domestic_b2c" (single-package
// D2C order — one box per order, which matches how this store sells).

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
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

function cleanInvoiceId(id) {
  let s = String(id || "").replace(/[^a-zA-Z0-9\-/]/g, "");
  if (!s) s = "BB" + Date.now().toString().slice(-8);
  return s.slice(0, 25);
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

// MasterOrderDate must be UTC, format Y-m-d H:i:s.
function utcDateTime() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

// Bigship Direct's domestic product categories aren't enumerated in their docs
// (unlike the older API's fixed category list) — set BIGSHIP_PRODUCT_CATEGORY_ID
// once you've confirmed the right id with Bigship (e.g. via their dashboard's
// "Book Order" form, which shows the category dropdown).
const DEFAULT_CATEGORY_ID = process.env.BIGSHIP_PRODUCT_CATEGORY_ID || "1";

/**
 * @param {object} input
 * @param {number} input.pickupLocationId   warehouse id to ship FROM
 * @param {number} input.returnLocationId   warehouse id for returns
 * @param {number} input.paymentModeId      resolved via bigship.getPaymentModes()
 * @param {string} input.paymentType        "COD" | "Prepaid" (drives collectableAmount)
 * @param {object} input.customer  { name, phone, email?, address1, address2?, landmark?, city, state, pincode }
 * @param {Array}  input.items     [{ name, quantity, price, hsn?, categoryId? }]
 * @param {string} input.invoiceId your order id
 * @param {object} [input.box]     { weightKg, length, width, height } in kg/cm
 */
function buildCreateOrderPayload(input) {
  const {
    pickupLocationId,
    returnLocationId,
    paymentModeId,
    paymentType = "Prepaid",
    customer = {},
    items = [],
    invoiceId,
    box = {},
  } = input;

  if (!pickupLocationId || !returnLocationId) {
    throw new ValidationError("pickupLocationId and returnLocationId (warehouse ids) are required");
  }
  if (!paymentModeId) {
    throw new ValidationError("paymentModeId is required (resolve it via bigship.getPaymentModes())");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("At least one cart item is required");
  }
  if (!String(customer.name || "").trim()) {
    throw new ValidationError("Customer name is required");
  }

  const isCOD = paymentType === "COD";

  const products = items.map((it) => {
    const qty = Math.max(1, parseInt(it.quantity, 10) || 1);
    const lineTotal = round2(Number(it.price) * qty);
    if (!(lineTotal > 0)) throw new ValidationError(`Item "${it.name}" must have a price > 0`);
    return {
      productName: (it.name || "Kids wear").slice(0, 80),
      hsn: it.hsn ? String(it.hsn).replace(/\D/g, "") : "",
      qty: String(qty),
      amount: String(lineTotal),
      totalAmount: lineTotal,
      collectableAmount: isCOD ? lineTotal : 0,
      categoryId: it.categoryId || DEFAULT_CATEGORY_ID,
    };
  });

  const invoiceAmount = round2(products.reduce((s, p) => s + p.totalAmount, 0));

  return {
    segment_type: "domestic_b2c",
    MasterOrderPickUpLocation: Number(pickupLocationId),
    MasterOrderReturnLocation: Number(returnLocationId),
    MasterOrderDate: utcDateTime(),
    MasterOrderPaymentMode: Number(paymentModeId),
    OrderInvoiceNo: cleanInvoiceId(invoiceId),
    MasterOrderInvoiceAmount: invoiceAmount,
    MasterOrderShippingEmail: customer.email || "",
    MasterOrderShippingName: String(customer.name).trim().slice(0, 80),
    MasterOrderShippingMobileNo: validPhone(customer.phone),
    MasterOrderShippingAddress: String(customer.address1 || "").trim().slice(0, 100) || "Address",
    MasterOrderShippingAddress2: String(customer.address2 || "").trim().slice(0, 100),
    MasterOrderShippingLandmark: String(customer.landmark || "").trim().slice(0, 60),
    MasterOrderShippingZipCode: validPincode(customer.pincode),
    MasterOrderShippingCountry: "India",
    MasterOrderShippingState: String(customer.state || "").trim(),
    MasterOrderShippingCity: String(customer.city || "").trim(),
    totalNumOfBoxes: 1,
    boxes: [
      {
        weight_unit: "kg",
        dimension_unit: "cm",
        noOfBoxes: 1,
        dimensions: [
          {
            length: parseInt(box.length, 10) || 30,
            breadth: parseInt(box.width, 10) || 25,
            height: parseInt(box.height, 10) || 6,
            weight: round2(box.weightKg || Math.max(0.5, items.length * 0.3)),
          },
        ],
        products,
      },
    ],
  };
}

module.exports = { buildCreateOrderPayload, ValidationError };
