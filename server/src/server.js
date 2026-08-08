// server.js  (Express)
// Safe API surface for the BashaBos frontend. Holds all secrets server-side.
//
//   React app ──► this backend ──► Razorpay (payments) + Bigship (shipping)
//
// Flow: create-order ─► Razorpay popup (frontend) ─► verify (here) ─► ship ─► track

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const bigship = require("./bigshipClient");
const { buildCreateOrderPayload, ValidationError } = require("./orderMapper");
const razorpay = require("./razorpayClient");
const db = require("./db");
const { hashPassword, verifyPassword, signToken, requireAdmin } = require("./auth");
const { upload, UPLOAD_DIR } = require("./uploads");

const app = express();

// Capture the raw body (needed to verify Razorpay webhook signatures).
app.use(express.json({ limit: "5mb", verify: (req, _res, buf) => (req.rawBody = buf) }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));
app.use("/uploads", express.static(UPLOAD_DIR));

const PICKUP = process.env.BIGSHIP_PICKUP_LOCATION_ID;
const RETURN = process.env.BIGSHIP_RETURN_LOCATION_ID || PICKUP;

const h = (fn) => (req, res) =>
  fn(req, res).catch((err) => {
    const status =
      err instanceof ValidationError
        ? 400
        : err.name === "PaymentError"
        ? err.status
        : err.responseCode === 429
        ? 429
        : 502;
    res.status(status).json({ success: false, message: err.message, code: err.responseCode });
  });

// Payment mode + risk type ids rarely change — resolve once per process instead
// of guessing numeric ids (the API docs don't guarantee they're stable across accounts).
let paymentModesCache = null;
async function resolvePaymentModeId(paymentType) {
  if (!paymentModesCache) {
    const res = await bigship.getPaymentModes("domestic_b2c");
    paymentModesCache = res.data || [];
  }
  const wanted = paymentType === "COD" ? "cod" : "prepaid";
  const match = paymentModesCache.find((m) => String(m.paymentModeName).toLowerCase() === wanted);
  if (!match) throw new Error(`Bigship account has no "${paymentType}" payment mode configured`);
  return Number(match.paymentModeId);
}

let riskTypeIdCache = null;
async function resolveRiskTypeId() {
  if (riskTypeIdCache) return riskTypeIdCache;
  try {
    const res = await bigship.getRiskTypes();
    const ownerRisk = (res.data || []).find((r) => r.slug === "owner-risk");
    riskTypeIdCache = ownerRisk ? Number(ownerRisk.riskTypeId) : 2;
  } catch {
    riskTypeIdCache = 2; // Owner Risk, per the docs' fixed list
  }
  return riskTypeIdCache;
}

// Shared helper: create + place a real Bigship order from checkout data.
// This is what makes the order show up on the Bigship dashboard.
async function fulfill({ preferredCourierId, paymentType = "Prepaid", ...rest }) {
  if (!PICKUP) {
    return { manifested: false, message: "BIGSHIP_PICKUP_LOCATION_ID is not set in server/.env" };
  }

  const paymentModeId = await resolvePaymentModeId(paymentType);
  const payload = buildCreateOrderPayload({
    ...rest,
    paymentType,
    paymentModeId,
    pickupLocationId: rest.pickupLocationId || PICKUP,
    returnLocationId: rest.returnLocationId || RETURN,
  });

  const createRes = await bigship.createOrder(payload);
  const customOrderId = createRes.data?.CustomGlobalOrderId;
  if (!customOrderId) return { manifested: false, message: "Could not read CustomGlobalOrderId", raw: createRes };

  const ratesRes = await bigship.getCourierRates(customOrderId);
  const couriers = ratesRes.data?.calculatedRates || [];
  if (!couriers.length) {
    return { manifested: false, custom_order_id: customOrderId, message: "No serviceable courier for this address." };
  }
  const chosen =
    couriers.find((c) => Number(c.courierId) === Number(preferredCourierId)) ||
    [...couriers].sort((a, b) => Number(a.total ?? a.total_freight) - Number(b.total ?? b.total_freight))[0];

  const riskTypeId = await resolveRiskTypeId();
  const placeRes = await bigship.placeOrder({ masterCustomOrderId: customOrderId, courierId: chosen.courierId, riskTypeId });

  return {
    manifested: true,
    custom_order_id: customOrderId,
    courier: { id: chosen.courierId, name: chosen.courierName, charge: chosen.total ?? chosen.total_freight },
    reference_number: placeRes.data?.reference_number || null,
    awb: placeRes.data?.awb_assigned || null,
  };
}

// =========================== PAYMENTS (Razorpay) ===========================

// 1. Create a Razorpay order. Call this when the customer clicks "Pay".
// body: { amountInr, receipt? }  ->  { order_id, amount, currency, key_id }
app.post(
  "/api/payment/create-order",
  h(async (req, res) => {
    const { amountInr, receipt } = req.body || {};
    const order = await razorpay.createOrder({ amountInr, receipt });
    res.json({ success: true, ...order });
  })
);

// 2. Verify payment AND book the shipment in one step.
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order:{customer,items,invoiceId,box?,preferredCourierId} }
app.post(
  "/api/payment/verify",
  h(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = req.body || {};

    const ok = razorpay.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    if (!ok) {
      return res.status(400).json({ success: false, verified: false, message: "Invalid payment signature" });
    }

    // Payment is genuine. Try to book shipping; never fail the payment if shipping errors.
    let shipment = null;
    let shippingError = null;
    try {
      shipment = await fulfill({ ...order, paymentType: "Prepaid" });
    } catch (err) {
      shippingError = err.message;
    }

    res.json({ success: true, verified: true, payment_id: razorpay_payment_id, shipment, shippingError });
  })
);

// 3. Optional webhook — Razorpay calls this so you capture payments even if the
//    customer closes the tab. Configure URL + secret in the Razorpay dashboard.
app.post(
  "/api/payment/webhook",
  h(async (req, res) => {
    const valid = razorpay.verifyWebhookSignature(req.rawBody, req.headers["x-razorpay-signature"]);
    if (!valid) return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    const event = req.body?.event;
    // TODO: persist event (payment.captured / order.paid) to your DB and reconcile.
    console.log("Razorpay webhook:", event);
    res.json({ success: true });
  })
);

// COD: no Razorpay step — confirm the order and ship directly.
// body: { customer, items, invoiceId, box?, preferredCourierId? }
app.post(
  "/api/payment/cod-confirm",
  h(async (req, res) => {
    const shipment = await fulfill({ ...req.body, paymentType: "COD" });
    res.json({ success: true, shipment });
  })
);

// ============================ ADMIN AUTH ====================================

// Whether an admin account already exists — the admin UI uses this to decide
// between showing "log in" or a first-run "create admin account" form.
app.get(
  "/api/admin/status",
  h(async (req, res) => res.json({ success: true, hasAdmin: db.getAdmins().length > 0 }))
);

// One-time setup: create the first admin account. Refuses once one exists.
app.post(
  "/api/admin/bootstrap",
  h(async (req, res) => {
    const { username, password } = req.body || {};
    if (db.getAdmins().length > 0) {
      return res.status(409).json({ success: false, message: "Admin already exists. Please log in." });
    }
    if (!username || !password || password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Username and a password (min 8 characters) are required" });
    }
    const passwordHash = await hashPassword(password);
    db.createAdmin({ username, passwordHash, createdAt: new Date().toISOString() });
    const token = signToken({ username });
    res.json({ success: true, token, username });
  })
);

app.post(
  "/api/admin/login",
  h(async (req, res) => {
    const { username, password } = req.body || {};
    const admin = db.findAdmin(username);
    const ok = admin && (await verifyPassword(password || "", admin.passwordHash));
    if (!ok) return res.status(401).json({ success: false, message: "Invalid username or password" });
    const token = signToken({ username: admin.username });
    res.json({ success: true, token, username: admin.username });
  })
);

app.get(
  "/api/admin/me",
  requireAdmin,
  h(async (req, res) => res.json({ success: true, username: req.admin.username }))
);

// =============================== PRODUCTS ===================================

function parseProductFields(body, uploadedImages) {
  const num = (v) => (v === undefined || v === "" ? undefined : Number(v));
  const arr = (v) => {
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };
  return {
    name: body.name,
    brand: body.brand || "BashaBos",
    category: body.category,
    sub: body.sub,
    price: num(body.price),
    mrp: num(body.mrp),
    color: body.color,
    hex: body.hex || "#cccccc",
    ageRange: body.ageRange,
    fabric: body.fabric,
    fit: body.fit,
    print: body.print,
    care: body.care,
    desc: body.desc,
    highlights: arr(body.highlights),
    sizes: arr(body.sizes),
    images: [...arr(body.existingImages), ...uploadedImages],
    rating: num(body.rating) ?? 0,
    reviews: num(body.reviews) ?? 0,
    sold: num(body.sold) ?? 0,
    isNew: body.isNew === "true" || body.isNew === true,
  };
}

// Public — storefront reads.
app.get(
  "/api/products",
  h(async (req, res) => res.json({ success: true, products: db.getProducts() }))
);
app.get(
  "/api/products/:id",
  h(async (req, res) => {
    const product = db.getProduct(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  })
);

// Admin only — create/update/delete.
app.post(
  "/api/products",
  requireAdmin,
  upload.array("images", 6),
  h(async (req, res) => {
    const body = req.body || {};
    if (!body.name || !body.price || !body.mrp) {
      return res.status(400).json({ success: false, message: "name, price and mrp are required" });
    }
    const uploadedImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const product = db.createProduct(parseProductFields(body, uploadedImages));
    res.json({ success: true, product });
  })
);

app.put(
  "/api/products/:id",
  requireAdmin,
  upload.array("images", 6),
  h(async (req, res) => {
    const body = req.body || {};
    const uploadedImages = (req.files || []).map((f) => `/uploads/${f.filename}`);
    const updated = db.updateProduct(req.params.id, parseProductFields(body, uploadedImages));
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product: updated });
  })
);

app.delete(
  "/api/products/:id",
  requireAdmin,
  h(async (req, res) => {
    const removed = db.deleteProduct(req.params.id);
    if (!removed) return res.status(404).json({ success: false, message: "Product not found" });
    for (const img of removed.images || []) {
      if (img.startsWith("/uploads/")) {
        fs.unlink(path.join(UPLOAD_DIR, path.basename(img)), () => {});
      }
    }
    res.json({ success: true });
  })
);

// =========================== SHIPPING (Bigship) ============================

// One-time setup helper: run this to find your warehouse id(s) for
// BIGSHIP_PICKUP_LOCATION_ID / BIGSHIP_RETURN_LOCATION_ID in .env.
app.get(
  "/api/shipping/warehouses",
  h(async (req, res) =>
    res.json(
      await bigship.getWarehouseList({
        page: Number(req.query.page) || 1,
        perPage: Number(req.query.perPage) || 10,
        segmentType: req.query.segmentType || "domestic_b2c",
      })
    )
  )
);

app.get("/api/shipping/wallet", h(async (req, res) => res.json(await bigship.getProfile())));

// Pre-order cost estimate — good for showing shipping cost on the checkout page.
app.post(
  "/api/shipping/calculate",
  h(async (req, res) => {
    const b = req.body || {};
    const paymentModeId = await resolvePaymentModeId(b.paymentType === "COD" ? "COD" : "Prepaid");
    const riskTypeId = await resolveRiskTypeId();
    res.json(
      await bigship.rateCalculator({
        segment_type: "domestic_b2c",
        sourcePincode: Number(b.pickupPincode),
        destPincode: Number(b.destinationPincode),
        invoiceValue: Number(b.invoiceAmount),
        paymentModeId,
        riskTypeId,
        boxes: [
          {
            no_of_box: "1",
            box_length: String(Number(b.length) || 30),
            box_width: String(Number(b.width) || 25),
            box_height: String(Number(b.height) || 6),
            box_dead_weight: String(Number(b.weightKg) || 0.5),
          },
        ],
      })
    );
  })
);

// Create + place a real order directly (used by the COD path or manual fulfillment).
app.post(
  "/api/shipping/fulfill",
  h(async (req, res) => res.json({ success: true, ...(await fulfill(req.body || {})) }))
);

app.get(
  "/api/shipping/orders/:id/rates",
  h(async (req, res) => res.json(await bigship.getCourierRates(req.params.id)))
);
app.post(
  "/api/shipping/orders/:id/manifest",
  h(async (req, res) => {
    const riskTypeId = await resolveRiskTypeId();
    res.json(
      await bigship.placeOrder({ masterCustomOrderId: req.params.id, courierId: Number(req.body.courierId), riskTypeId })
    );
  })
);
app.get(
  "/api/shipping/orders/:id/label",
  h(async (req, res) => res.json(await bigship.downloadDocument(req.params.id, req.query.type || "label")))
);
app.get(
  "/api/shipping/track",
  h(async (req, res) => res.json(await bigship.trackOrder(req.query.id)))
);
app.post(
  "/api/shipping/cancel",
  h(async (req, res) => res.json(await bigship.cancelOrder(req.body.customOrderId)))
);

// Catches multer upload errors (bad file type, too large) as clean JSON.
app.use((err, req, res, next) => {
  if (err && (err.name === "MulterError" || /image files are allowed/.test(err.message || ""))) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BashaBos API (payments + shipping) on http://localhost:${PORT}`));
