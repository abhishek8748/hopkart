import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProducts, deleteProduct } from "../../services/productsApi";
import { invalidateProductsCache } from "../../hooks/useProducts";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    fetchProducts()
      .then(setProducts)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      invalidateProductsCache();
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 900, color: "#222" }}>Products ({products.length})</h1>
        <Link
          to="/admin/products/new"
          style={{
            background: "var(--bb-blue)",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 6,
            fontWeight: 800,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          + Add Product
        </Link>
      </div>

      {err && <p style={{ color: "var(--bb-red)", fontWeight: 700, marginBottom: 16 }}>{err}</p>}

      {loading ? (
        <p style={{ color: "#888" }}>Loading…</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "var(--bb-shadow-card)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bb-gray-light)", textAlign: "left" }}>
                {["Image", "Name", "Category", "Price", "Sold", "", ""].map((head, i) => (
                  <th key={i} style={{ padding: "10px 14px", fontWeight: 800, color: "#555" }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid var(--bb-border)" }}>
                  <td style={{ padding: "10px 14px" }}>
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        style={{ width: 40, height: 50, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: "10px 14px", color: "#666" }}>
                    {p.category} / {p.sub}
                  </td>
                  <td style={{ padding: "10px 14px" }}>₹{p.price}</td>
                  <td style={{ padding: "10px 14px" }}>{p.sold ?? 0}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <Link to={`/admin/products/${p.id}/edit`} style={{ color: "var(--bb-blue)", fontWeight: 700 }}>
                      Edit
                    </Link>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      style={{ color: "var(--bb-red)", fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={7} style={{ padding: 20, textAlign: "center", color: "#999" }}>
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
