// server.js  (Express)
// Safe API surface for the BashaBos frontend. Holds all secrets server-side.
//
//   React app ──► this backend ──► Razorpay (payments) + Bigship (shipping)
//
// Flow: create-order ─► Razorpay popup (frontend) ─► verify (here) ─► ship ─► track

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bigship = require("./bigshipClient");
const { buildSingleOrderPayload, ValidationError } = require("./orderMapper");
const razorpay = require("./razorpayClient");

const app = express();

// Capture the raw body (needed to verify Razorpay webhook signatures).
app.use(express.json({ limit: "5mb", verify: (req, _res, buf) => (req.rawBody = buf) }));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: allowedOrigins }));

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

// Shared helper: create + manifest a Bigship shipment from order data.
async function fulfill({ preferredCourierId, ...rest }) {
  const payload = buildSingleOrderPayload({
    ...rest,
    pickupLocationId: rest.pickupLocationId || PICKUP,
    returnLocationId: rest.returnLocationId || RETURN,
  });
  const addRes = await bigship.addSingleOrder(payload);
  const systemOrderId = bigship.parseSystemOrderId(addRes);
  if (!systemOrderId) return { manifested: false, message: "Could not read system_order_id", raw: addRes };

  const ratesRes = await bigship.getShippingRates(systemOrderId, "B2C");
  const couriers = ratesRes.data || [];
  if (!couriers.length) {
    return { manifested: false, system_order_id: systemOrderId, message: "No serviceable courier; manifest later." };
  }
  const chosen =
    couriers.find((c) => c.courier_id === Number(preferredCourierId)) ||
    [...couriers].sort((a, b) => a.total_shipping_charges - b.total_shipping_charges)[0];

  await bigship.manifestSingleOrder(systemOrderId, chosen.courier_id);
  const awbRes = await bigship.getShipmentData(1, systemOrderId);

  return {
    manifested: true,
    system_order_id: systemOrderId,
    courier: { id: chosen.courier_id, name: chosen.courier_name, charge: chosen.total_shipping_charges },
    awb: awbRes.data?.master_awb || null,
    lr_number: awbRes.data?.lr_number || null,
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

// =========================== SHIPPING (Bigship) ============================

app.get(
  "/api/shipping/warehouses",
  h(async (req, res) =>
    res.json(await bigship.getWarehouseList(Number(req.query.page) || 1, Number(req.query.size) || 50))
  )
);

app.get("/api/shipping/wallet", h(async (req, res) => res.json(await bigship.getWalletBalance())));

app.post(
  "/api/shipping/calculate",
  h(async (req, res) => {
    const b = req.body || {};
    res.json(
      await bigship.calculateRates({
        shipment_category: "B2C",
        payment_type: b.paymentType === "COD" ? "COD" : "Prepaid",
        pickup_pincode: Number(b.pickupPincode),
        destination_pincode: Number(b.destinationPincode),
        shipment_invoice_amount: Number(b.invoiceAmount),
        risk_type: "",
        box_details: [
          {
            each_box_dead_weight: Number(b.weightKg) || 0.5,
            each_box_length: Number(b.length) || 30,
            each_box_width: Number(b.width) || 25,
            each_box_height: Number(b.height) || 6,
            box_count: 1,
          },
        ],
      })
    );
  })
);

// Create + ship directly (used by COD path or manual fulfillment).
app.post(
  "/api/shipping/fulfill",
  h(async (req, res) => res.json({ success: true, ...(await fulfill(req.body || {})) }))
);

app.get(
  "/api/shipping/orders/:id/rates",
  h(async (req, res) => res.json(await bigship.getShippingRates(req.params.id, "B2C")))
);
app.post(
  "/api/shipping/orders/:id/manifest",
  h(async (req, res) =>
    res.json(await bigship.manifestSingleOrder(req.params.id, Number(req.body.courierId)))
  )
);
app.get(
  "/api/shipping/orders/:id/label",
  h(async (req, res) => res.json(await bigship.getShipmentData(Number(req.query.type) || 2, req.params.id)))
);
app.get(
  "/api/shipping/track",
  h(async (req, res) => res.json(await bigship.track(req.query.type || "awb", req.query.id)))
);
app.post(
  "/api/shipping/cancel",
  h(async (req, res) => res.json(await bigship.cancelAwb(req.body.awbs || [])))
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`BashaBos API (payments + shipping) on http://localhost:${PORT}`));
