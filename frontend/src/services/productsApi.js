// src/services/productsApi.js
// Product catalog — public reads + admin create/update/delete.

const BASE = import.meta.env.VITE_SHIPPING_API_URL || "http://localhost:4000";

// Uploaded product images live on the API server (e.g. /uploads/xyz.jpg) and
// need the API origin prefixed. Seed images (/products/xyz.jpg) already live
// in the frontend's own /public folder and must stay untouched.
function normalize(product) {
  return {
    ...product,
    images: (product.images || []).map((src) => (src.startsWith("/uploads/") ? `${BASE}${src}` : src)),
  };
}

export function denormalizeImage(src) {
  return src.startsWith(BASE) ? src.slice(BASE.length) : src;
}

function authHeaders() {
  const token = localStorage.getItem("bb_admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchProducts() {
  const res = await fetch(`${BASE}/api/products`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to load products");
  return json.products.map(normalize);
}

export async function fetchProduct(id) {
  const res = await fetch(`${BASE}/api/products/${id}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Product not found");
  return normalize(json.product);
}

export async function createProduct(formData) {
  const res = await fetch(`${BASE}/api/products`, { method: "POST", headers: authHeaders(), body: formData });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to create product");
  return normalize(json.product);
}

export async function updateProduct(id, formData) {
  const res = await fetch(`${BASE}/api/products/${id}`, { method: "PUT", headers: authHeaders(), body: formData });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to update product");
  return normalize(json.product);
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/api/products/${id}`, { method: "DELETE", headers: authHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) throw new Error(json.message || "Failed to delete product");
  return true;
}
