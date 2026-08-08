// One-time migration: copy the existing static frontend catalog into
// server/data/products.json so it becomes the live, admin-editable source.
const path = require("path");
const { pathToFileURL } = require("url");
const db = require("../src/db");

async function main() {
  const existing = db.getProducts();
  if (existing.length) {
    console.log(`server/data/products.json already has ${existing.length} products — skipping seed.`);
    return;
  }
  const dataFile = path.join(__dirname, "../../frontend/src/data/products.js");
  const mod = await import(pathToFileURL(dataFile).href);
  db.saveProducts(mod.products);
  console.log(`Seeded ${mod.products.length} products into server/data/products.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
