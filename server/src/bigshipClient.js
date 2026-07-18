// bigshipClient.js
// Thin wrapper around the Bigship Domestic Outbound API.
// Handles login + token caching (token is valid ~12h) and exposes
// one method per endpoint we actually use. Node 18+ (global fetch).

const BASE_URL = process.env.BIGSHIP_BASE_URL || "https://api.bigship.in/";

// In-memory token cache. Good enough for a single-instance server.
// For multi-instance, move this to Redis/DB.
let cachedToken = null;
let tokenExpiresAt = 0; // epoch ms

// Bigship says tokens last 12h. We refresh after 11h to be safe.
const TOKEN_TTL_MS = 11 * 60 * 60 * 1000;

function url(endpoint) {
  // Base URL ends with "/", endpoints in the docs start without one.
  return BASE_URL.replace(/\/$/, "") + "/" + endpoint.replace(/^\//, "");
}

// A Bigship "error" is success:false in a 200 body, OR a real HTTP error.
class BigshipError extends Error {
  constructor(message, responseCode, raw) {
    super(message || "Bigship request failed");
    this.name = "BigshipError";
    this.responseCode = responseCode;
    this.raw = raw;
  }
}

async function login() {
  const body = {
    user_name: process.env.BIGSHIP_USER_NAME,
    password: process.env.BIGSHIP_PASSWORD,
    access_key: process.env.BIGSHIP_ACCESS_KEY,
  };

  if (!body.user_name || !body.password || !body.access_key) {
    throw new BigshipError(
      "Missing Bigship credentials. Set BIGSHIP_USER_NAME, BIGSHIP_PASSWORD and BIGSHIP_ACCESS_KEY in .env",
      0
    );
  }

  const res = await fetch(url("api/login/user"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!json || !json.success || !json.data?.token) {
    throw new BigshipError(
      json?.message || "Login failed",
      json?.responseCode ?? res.status,
      json
    );
  }

  cachedToken = json.data.token;
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS;
  return cachedToken;
}

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  return login();
}

// Core request helper. Adds bearer token, retries once on a 401/expired token.
async function request(method, endpoint, { query, body, _retried } = {}) {
  const token = await getToken();

  let fullUrl = url(endpoint);
  if (query && Object.keys(query).length) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== "")
    ).toString();
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + qs;
  }

  const res = await fetch(fullUrl, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Rate limit
  if (res.status === 429) {
    throw new BigshipError("Bigship rate limit hit (100 req/min). Try again shortly.", 429);
  }

  const json = await res.json().catch(() => null);

  // Token expired mid-flight -> refresh once and retry.
  const looksUnauthorized =
    res.status === 401 || json?.responseCode === 401 || json?.message === "Unauthorized";
  if (looksUnauthorized && !_retried) {
    cachedToken = null;
    return request(method, endpoint, { query, body, _retried: true });
  }

  if (!json) {
    throw new BigshipError(`Bigship returned non-JSON (HTTP ${res.status})`, res.status);
  }

  // Most endpoints flag failures with success:false even on HTTP 200.
  if (json.success === false) {
    throw new BigshipError(json.message, json.responseCode, json);
  }

  return json;
}

// ---- Endpoint methods (numbered per the API doc) --------------------------

// 2. Payment categories (COD / Prepaid / ToPay)
function getPaymentCategory(shipmentCategory = "b2c") {
  return request("GET", "api/payment/category", { query: { shipment_category: shipmentCategory } });
}

// 3. Courier list
function getCourierList(shipmentCategory = "b2c") {
  return request("GET", "api/courier/get/all", { query: { shipment_category: shipmentCategory } });
}

// 4. Wallet balance
function getWalletBalance() {
  return request("GET", "api/Wallet/balance/get");
}

// 5. Add warehouse (one-time setup)
function addWarehouse(payload) {
  return request("POST", "api/warehouse/add", { body: payload });
}

// 18. List existing warehouses (to find your warehouse_id / pickup_location_id)
function getWarehouseList(pageIndex = 1, pageSize = 50) {
  return request("GET", "api/warehouse/get/list", {
    query: { page_index: pageIndex, page_size: pageSize },
  });
}

// 6. Add single order (B2C). Returns the full json; system_order_id is parsed by the caller.
function addSingleOrder(payload) {
  return request("POST", "api/order/add/single", { body: payload });
}

// 11. Serviceable courier rates for an existing order
function getShippingRates(systemOrderId, shipmentCategory = "B2C", riskType) {
  return request("GET", "api/order/shipping/rates", {
    query: { shipment_category: shipmentCategory, system_order_id: systemOrderId, risk_type: riskType },
  });
}

// 7. Manifest single order -> schedules pickup with chosen courier
function manifestSingleOrder(systemOrderId, courierId) {
  return request("POST", "api/order/manifest/single", {
    body: { system_order_id: systemOrderId, courier_id: courierId },
  });
}

// 8. Get AWB(1) / Label(2) / Manifest(3)
function getShipmentData(shipmentDataId, systemOrderId) {
  return request("POST", "api/shipment/data", {
    query: { shipment_data_id: shipmentDataId, system_order_id: systemOrderId },
  });
}

// 9. Cancel AWB(s)
function cancelAwb(awbs) {
  return request("PUT", "api/order/cancel", { body: awbs });
}

// 15. Calculate rates (no order needed - good for showing cost at checkout)
function calculateRates(payload) {
  return request("POST", "api/calculator", { body: payload });
}

// 16. Track by AWB or LRN
function track(trackingType, trackingId) {
  return request("GET", "api/tracking", {
    query: { tracking_type: trackingType, tracking_id: trackingId },
  });
}

// Helper: the add-order response puts the id inside a sentence:
// "system_order_id is 1000252960"
function parseSystemOrderId(addOrderResponse) {
  const data = addOrderResponse?.data;
  if (!data) return null;
  const match = String(data).match(/(\d{6,})/);
  return match ? match[1] : null;
}

module.exports = {
  BigshipError,
  login,
  getToken,
  getPaymentCategory,
  getCourierList,
  getWalletBalance,
  addWarehouse,
  getWarehouseList,
  addSingleOrder,
  getShippingRates,
  manifestSingleOrder,
  getShipmentData,
  cancelAwb,
  calculateRates,
  track,
  parseSystemOrderId,
};
