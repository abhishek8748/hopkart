// razorpayClient.js
// Handles the two things that MUST happen server-side with Razorpay:
//   1. Creating an order (uses the secret key)
//   2. Verifying the payment signature (proves the payment is real)
// Uses Node's built-in crypto + fetch (Node 18+) — no extra SDK needed.

const crypto = require("crypto");

const RZP_BASE = "https://api.razorpay.com/v1";

function creds() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env");
  }
  return { key_id, key_secret };
}

class PaymentError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "PaymentError";
    this.status = status || 502;
  }
}

// Create a Razorpay order. amountInr is in rupees; Razorpay wants paise (integers).
async function createOrder({ amountInr, currency = "INR", receipt, notes }) {
  const { key_id, key_secret } = creds();
  const amount = Math.round(Number(amountInr) * 100);
  // Razorpay minimum chargeable amount is 100 paise (₹1.00).
  if (!Number.isFinite(amount) || amount < 100) {
    throw new PaymentError("amount must be at least 100 paise (₹1.00)", 400);
  }

  const auth = Buffer.from(`${key_id}:${key_secret}`).toString("base64");
  const res = await fetch(`${RZP_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({
      amount,
      currency,
      receipt: String(receipt || `bb_${Date.now()}`).slice(0, 40),
      notes: notes || {},
    }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.id) {
    throw new PaymentError(json?.error?.description || "Failed to create Razorpay order", res.status);
  }
  // Return only what the frontend needs (key_id is public; secret never leaves the server).
  return { order_id: json.id, amount: json.amount, currency: json.currency, key_id };
}

// Verify the signature Razorpay returns after checkout.
// signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const { key_secret } = creds();
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;

  const expected = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Constant-time compare to avoid timing attacks.
  const a = Buffer.from(expected);
  const b = Buffer.from(String(razorpay_signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Verify a webhook payload using the webhook secret + raw request body.
function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signatureHeader));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { createOrder, verifyPaymentSignature, verifyWebhookSignature, PaymentError };
