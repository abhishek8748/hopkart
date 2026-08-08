// auth.js — password hashing + JWT sessions for the admin panel.

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "dev-insecure-secret-change-me";
if (!process.env.ADMIN_JWT_SECRET) {
  console.warn(
    "⚠️  ADMIN_JWT_SECRET is not set — using an insecure default. Set it in server/.env before deploying."
  );
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: "Missing token" });
  try {
    req.admin = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired session, please log in again" });
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAdmin };
