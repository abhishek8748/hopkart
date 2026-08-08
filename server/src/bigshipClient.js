// bigshipClient.js
// Thin wrapper around the Bigship Direct "Unified Outbound API"
// (https://api.bigship.direct/) — this is the account/dashboard at
// app.bigship.direct, NOT the older api.bigship.in Domestic API.
// Handles login + token caching and exposes one method per endpoint used.
// Node 18+ (global fetch + FormData).

const BASE_URL = process.env.BIGSHIP_BASE_URL || "https://api.bigship.direct/";

// In-memory token cache. Good enough for a single-instance server.
let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

function url(endpoint) {
  return BASE_URL.replace(/\/$/, "") + "/" + endpoint.replace(/^\//, "");
}

class BigshipError extends Error {
  constructor(message, statusCode, raw) {
    super(message || "Bigship request failed");
    this.name = "BigshipError";
    this.statusCode = statusCode;
    this.raw = raw;
  }
}

async function login() {
  const body = {
    username: process.env.BIGSHIP_USER_NAME,
    password: process.env.BIGSHIP_PASSWORD,
    access_key: process.env.BIGSHIP_ACCESS_KEY,
  };

  if (!body.username || !body.password || !body.access_key) {
    throw new BigshipError(
      "Missing Bigship credentials. Set BIGSHIP_USER_NAME, BIGSHIP_PASSWORD and BIGSHIP_ACCESS_KEY in server/.env",
      0
    );
  }

  const res = await fetch(url("api/outbound/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!json || json.status !== true || !json.data?.token) {
    throw new BigshipError(json?.message || "Bigship login failed", json?.status_code ?? res.status, json);
  }

  cachedToken = json.data.token;
  const expiresAt = json.data.tokenExpiringAt ? Date.parse(json.data.tokenExpiringAt) : NaN;
  // Refresh 10 min before real expiry; fall back to 6h if the API didn't return a usable date.
  tokenExpiresAt = Number.isFinite(expiresAt) ? expiresAt - 10 * 60 * 1000 : Date.now() + 6 * 60 * 60 * 1000;
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  return login();
}

// Core request helper. Adds bearer token, retries once on a 401/expired token.
// GET endpoints send params as a query string (fetch can't attach a body to GET);
// this API's backend reads request params regardless of HTTP verb, so that works.
async function request(method, endpoint, { query, body, form, _retried } = {}) {
  const token = await getToken();

  let fullUrl = url(endpoint);
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    if (qs) fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }

  const headers = { Authorization: `Bearer ${token}` };
  let fetchBody;
  if (form) {
    fetchBody = form; // FormData - fetch sets the multipart boundary itself
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, { method, headers, body: fetchBody });

  if (res.status === 429) {
    throw new BigshipError("Bigship rate limit hit (100 req/min). Try again shortly.", 429);
  }

  const json = await res.json().catch(() => null);

  const looksUnauthorized = res.status === 401 || json?.status_code === 401;
  if (looksUnauthorized && !_retried) {
    cachedToken = null;
    return request(method, endpoint, { query, body, form, _retried: true });
  }

  if (!json) {
    throw new BigshipError(`Bigship returned non-JSON (HTTP ${res.status})`, res.status);
  }

  if (json.status === false) {
    const firstFieldError = json.errors && Object.values(json.errors)[0]?.[0];
    throw new BigshipError(firstFieldError || json.message, json.status_code, json);
  }

  return json;
}

// ---- Endpoint methods -------------------------------------------------

function getProfile() {
  return request("GET", "api/outbound/profile");
}

function getWarehouseList({ page = 1, perPage = 10, segmentType = "domestic_b2c", status, filterType, filterValue } = {}) {
  return request("GET", "api/outbound/get-warehouse-list", {
    query: { page, perPage, segment_type: segmentType, status, filter_type: filterType, filter_value: filterValue },
  });
}

function saveWarehouse(payload) {
  return request("POST", "api/outbound/save-warehouse-data", { body: payload });
}

function getPaymentModes(segmentType = "domestic_b2c") {
  return request("GET", "api/outbound/get-payment-mode", { query: { segment_type: segmentType } });
}

function getRiskTypes() {
  return request("GET", "api/outbound/domestic/risk-types");
}

// Pre-order cost estimate (no order needed) — good for showing cost at checkout.
function rateCalculator(payload) {
  return request("POST", "api/outbound/user-rate-calculator", { body: payload });
}

// Draft order — returns CustomGlobalOrderId.
function createOrder(payload) {
  return request("POST", "api/outbound/create-order", { body: payload });
}

// Serviceable couriers + real cost for a draft order (must run before place-order).
function getCourierRates(masterCustomOrderId) {
  return request("POST", "api/outbound/courier-wise-shipment-cost", {
    body: { MasterCustomOrderId: masterCustomOrderId },
  });
}

// Confirms the order with a chosen courier — this is what makes it appear
// on the Bigship dashboard as a real, billable shipment.
function placeOrder({ masterCustomOrderId, courierId, riskTypeId }) {
  const form = new FormData();
  form.append("MasterCustomOrderId", String(masterCustomOrderId));
  form.append("courierId", String(courierId));
  if (riskTypeId !== undefined) form.append("riskTypeId", String(riskTypeId));
  return request("POST", "api/outbound/place-order", { form });
}

function cancelOrder(customGlobalOrderId) {
  return request("POST", "api/outbound/cancel-order", { body: { CustomGlobalOrderId: customGlobalOrderId } });
}

function trackOrder(customGlobalOrderId) {
  return request("GET", "api/outbound/track-order", { query: { CustomGlobalOrderId: customGlobalOrderId } });
}

function getOrderDetails(masterCustomOrderId) {
  return request("GET", "api/outbound/order-shipment-details", {
    query: { MasterCustomOrderId: masterCustomOrderId },
  });
}

function downloadDocument(customGlobalOrderId, documentType) {
  return request("GET", "api/outbound/download-shipment-documents", {
    query: { CustomGlobalOrderId: customGlobalOrderId, document_type: documentType },
  });
}

module.exports = {
  BigshipError,
  login,
  getToken,
  getProfile,
  getWarehouseList,
  saveWarehouse,
  getPaymentModes,
  getRiskTypes,
  rateCalculator,
  createOrder,
  getCourierRates,
  placeOrder,
  cancelOrder,
  trackOrder,
  getOrderDetails,
  downloadDocument,
};
