// src/services/paymentApi.js
// Razorpay checkout from the frontend. The secret never touches this file —
// it only handles the public flow and lets the backend verify + ship.

const BASE = import.meta.env.VITE_SHIPPING_API_URL || "http://localhost:4000";

async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) throw new Error(json.message || `Request failed (${res.status})`);
  return json;
}

// Inject Razorpay's checkout.js once.
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay. Check your connection."));
    document.body.appendChild(s);
  });
}

/**
 * Pay with Razorpay, then verify + book shipping on the backend.
 *
 * @param {object} p
 * @param {number} p.amountInr   total to charge, in rupees
 * @param {string} p.receipt     your order id / invoice id
 * @param {object} p.customer    { name, phone, email, address1, address2, landmark, pincode }
 * @param {Array}  p.items       [{ name, quantity, price }]
 * @param {string} [p.preferredCourierId]
 * @returns {Promise<{verified:true, payment_id, shipment, shippingError}>}
 */
export async function payAndShip({ amountInr, receipt, customer, items, preferredCourierId }) {
  await loadRazorpay();

  // 1. Backend creates the Razorpay order (uses secret key).
  const order = await call("/api/payment/create-order", { amountInr, receipt });

  // 2. Open the Razorpay popup.
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id, // public key id
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "BashaBos Kids Wear",
      description: `Order ${receipt}`,
      prefill: { name: customer?.name, email: customer?.email, contact: customer?.phone },
      theme: { color: "#1a56db" },
      handler: async (resp) => {
        try {
          // 3. Backend verifies the signature AND books the shipment.
          const result = await call("/api/payment/verify", {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            order: { customer, items, invoiceId: receipt, preferredCourierId },
          });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      },
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.on("payment.failed", (e) => reject(new Error(e?.error?.description || "Payment failed")));
    rzp.open();
  });
}

// COD: no Razorpay — confirm + ship directly.
export function placeCodOrder({ customer, items, receipt, preferredCourierId }) {
  return call("/api/payment/cod-confirm", {
    customer,
    items,
    invoiceId: receipt,
    preferredCourierId,
  });
}

export default { payAndShip, placeCodOrder };
