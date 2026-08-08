// db.js — tiny JSON-file storage for products + admin accounts.
// No separate database server needed; good fit for a single-instance admin panel.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ADMINS_FILE = path.join(DATA_DIR, "admins.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJSON(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =============================== Products ===============================

function getProducts() {
  return readJSON(PRODUCTS_FILE, []);
}

function saveProducts(list) {
  writeJSON(PRODUCTS_FILE, list);
}

function getProduct(id) {
  return getProducts().find((p) => p.id === Number(id)) || null;
}

function createProduct(data) {
  const list = getProducts();
  const nextId = list.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const product = { ...data, id: nextId };
  list.push(product);
  saveProducts(list);
  return product;
}

function updateProduct(id, patch) {
  const list = getProducts();
  const idx = list.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, id: list[idx].id };
  saveProducts(list);
  return list[idx];
}

function deleteProduct(id) {
  const list = getProducts();
  const idx = list.findIndex((p) => p.id === Number(id));
  if (idx === -1) return null;
  const [removed] = list.splice(idx, 1);
  saveProducts(list);
  return removed;
}

// ================================ Admins ==================================

function getAdmins() {
  return readJSON(ADMINS_FILE, []);
}

function saveAdmins(list) {
  writeJSON(ADMINS_FILE, list);
}

function findAdmin(username) {
  if (!username) return null;
  return getAdmins().find((a) => a.username.toLowerCase() === String(username).toLowerCase()) || null;
}

function createAdmin(admin) {
  const list = getAdmins();
  list.push(admin);
  saveAdmins(list);
  return admin;
}

module.exports = {
  getProducts,
  saveProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdmins,
  findAdmin,
  createAdmin,
};
