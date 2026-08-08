// src/services/shippingApi.js
// Frontend helper that calls YOUR backend (never Bigship directly).
// Set VITE_SHIPPING_API_URL in your .env, e.g.
//   VITE_SHIPPING_API_URL=http://localhost:4000   (dev)
//   VITE_SHIPPING_API_URL=https://api.your-domain.com   (prod)

const BASE = import.meta.env.VITE_SHIPPING_API_URL || "http://localhost:4000";

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Shipping request failed (${res.status})`);
  }
  return json;
}

// Show shipping options/cost on the checkout page before ordering.
export function calculateShipping({
  paymentType,
  pickupPincode,
  destinationPincode,
  invoiceAmount,
  weightKg,
}) {
  return call("/api/shipping/calculate", {
    method: "POST",
    body: JSON.stringify({
      paymentType,
      pickupPincode,
      destinationPincode,
      invoiceAmount,
      weightKg,
    }),
  });
}

// Create + ship the order in one call. Call this AFTER payment succeeds
// (Razorpay) or right after a COD order is confirmed.
//
// customer: { name, phone, email, address1, address2, landmark, pincode }
// items:    [{ name, quantity, price, category?, hsn? }]
// paymentType: "Prepaid" | "COD"
export function fulfillOrder({ customer, items, paymentType, invoiceId, box, preferredCourierId }) {
  return call("/api/shipping/fulfill", {
    method: "POST",
    body: JSON.stringify({ customer, items, paymentType, invoiceId, box, preferredCourierId }),
  });
}

// Track a shipment by its AWB (or LRN).
export function trackShipment(awb, type = "awb") {
  return call(`/api/shipping/track?type=${type}&id=${encodeURIComponent(awb)}`);
}

// Download the shipping label PDF (type: 1=AWB, 2=label, 3=manifest).
export function getLabel(systemOrderId, type = 2) {
  return call(`/api/shipping/orders/${systemOrderId}/label?type=${type}`);
}

export default { calculateShipping, fulfillOrder, trackShipment, getLabel };
