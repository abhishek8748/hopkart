// src/hooks/useProducts.js
// Shared, cached fetch of the live product catalog for storefront pages.

import { useEffect, useState } from "react";
import { fetchProducts } from "../services/productsApi";

let cache = null;
let inflight = null;

export function useProducts() {
  const [products, setProducts] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) {
      setProducts(cache);
      setLoading(false);
      return;
    }
    if (!inflight) inflight = fetchProducts().then((list) => (cache = list));
    inflight.then((list) => setProducts(list)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return { products, loading };
}

// Call after admin create/update/delete so the storefront refetches next mount.
export function invalidateProductsCache() {
  cache = null;
  inflight = null;
}
