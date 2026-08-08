import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  fetchProduct,
  createProduct,
  updateProduct,
  denormalizeImage,
} from "../../services/productsApi";
import { invalidateProductsCache } from "../../hooks/useProducts";

const EMPTY = {
  name: "", brand: "BashaBos", category: "boys", sub: "coord-set",
  price: "", mrp: "", color: "", hex: "#cccccc", ageRange: "",
  fabric: "", fit: "", print: "", care: "", desc: "",
  highlights: "", sizes: "", isNew: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    fetchProduct(id)
      .then((p) => {
        setForm({
          name: p.name || "", brand: p.brand || "BashaBos", category: p.category || "boys",
          sub: p.sub || "coord-set", price: p.price ?? "", mrp: p.mrp ?? "",
          color: p.color || "", hex: p.hex || "#cccccc", ageRange: p.ageRange || "",
          fabric: p.fabric || "", fit: p.fit || "", print: p.print || "", care: p.care || "",
          desc: p.desc || "", highlights: (p.highlights || []).join(", "),
          sizes: (p.sizes || []).join(", "), isNew: !!p.isNew,
        });
        setExistingImages(p.images || []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const addFiles = (e) => {
    setNewFiles([...newFiles, ...Array.from(e.target.files || [])]);
    e.target.value = "";
  };
  const removeNewFile = (i) => setNewFiles(newFiles.filter((_, idx) => idx !== i));
  const removeExistingImage = (i) => setExistingImages(existingImages.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("existingImages", JSON.stringify(existingImages.map(denormalizeImage)));
      newFiles.forEach((file) => fd.append("images", file));

      if (isEdit) await updateProduct(id, fd);
      else await createProduct(fd);
      invalidateProductsCache();
      navigate("/admin");
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p style={{ color: "#888" }}>Loading…</p>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <Link to="/admin" style={{ color: "var(--bb-blue)", fontWeight: 700, fontSize: 13 }}>
          ← Back
        </Link>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 900, color: "#222", marginBottom: 20 }}>
        {isEdit ? "Edit Product" : "Add Product"}
      </h1>

      {err && (
        <p style={{ background: "var(--bb-red-light)", color: "var(--bb-red-dark)", padding: "10px 12px", borderRadius: 6, fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
          {err}
        </p>
      )}

      <form onSubmit={submit} style={{ background: "#fff", borderRadius: 8, padding: 24, boxShadow: "var(--bb-shadow-card)" }}>
        <Row>
          <Field label="Name" required><input required style={inp} value={form.name} onChange={set("name")} /></Field>
          <Field label="Brand"><input style={inp} value={form.brand} onChange={set("brand")} /></Field>
        </Row>

        <Row>
          <Field label="Category">
            <select style={inp} value={form.category} onChange={set("category")}>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="unisex">Unisex</option>
            </select>
          </Field>
          <Field label="Type">
            <select style={inp} value={form.sub} onChange={set("sub")}>
              <option value="coord-set">Co-ord Set</option>
              <option value="tshirt">T-Shirt</option>
              <option value="polo">Polo</option>
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Price (₹)" required><input required type="number" min="0" style={inp} value={form.price} onChange={set("price")} /></Field>
          <Field label="MRP (₹)" required><input required type="number" min="0" style={inp} value={form.mrp} onChange={set("mrp")} /></Field>
        </Row>

        <Row>
          <Field label="Colour name"><input style={inp} value={form.color} onChange={set("color")} placeholder="e.g. Mint Green" /></Field>
          <Field label="Colour swatch">
            <input type="color" value={form.hex} onChange={set("hex")} style={{ ...inp, padding: 4, height: 40, cursor: "pointer" }} />
          </Field>
        </Row>

        <Row>
          <Field label="Age range"><input style={inp} value={form.ageRange} onChange={set("ageRange")} placeholder="e.g. 3–10 Yrs" /></Field>
          <Field label="Fabric"><input style={inp} value={form.fabric} onChange={set("fabric")} placeholder="e.g. Cotton, TENCEL™" /></Field>
        </Row>

        <Row>
          <Field label="Fit"><input style={inp} value={form.fit} onChange={set("fit")} placeholder="e.g. Regular Fit" /></Field>
          <Field label="Print"><input style={inp} value={form.print} onChange={set("print")} placeholder="e.g. All-Over Puff Print" /></Field>
        </Row>

        <Field label="Sizes (comma separated)">
          <input style={inp} value={form.sizes} onChange={set("sizes")} placeholder="3Y, 4Y, 5Y, 6Y" />
        </Field>

        <Field label="Highlights (comma separated)">
          <input style={inp} value={form.highlights} onChange={set("highlights")} placeholder="100% Cotton, Puff Print, Regular Fit" />
        </Field>

        <Field label="Care instructions">
          <input style={inp} value={form.care} onChange={set("care")} placeholder="Machine wash cold · Do not bleach" />
        </Field>

        <Field label="Description">
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} value={form.desc} onChange={set("desc")} />
        </Field>

        <label style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 18px", fontSize: 13, fontWeight: 700, color: "#444", cursor: "pointer" }}>
          <input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
          Mark as "New Arrival"
        </label>

        {/* IMAGES */}
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Images</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            {existingImages.map((src, i) => (
              <Thumb key={src} src={src} onRemove={() => removeExistingImage(i)} />
            ))}
            {newFiles.map((file, i) => (
              <Thumb key={i} src={URL.createObjectURL(file)} onRemove={() => removeNewFile(i)} />
            ))}
            <label style={addBox}>
              + Add
              <input type="file" accept="image/*" multiple onChange={addFiles} style={{ display: "none" }} />
            </label>
          </div>
        </div>

        <button disabled={busy} style={btn}>
          {busy ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </form>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>{children}</div>;
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={lbl}>
        {label} {required && <span style={{ color: "var(--bb-red)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Thumb({ src, onRemove }) {
  return (
    <div style={{ position: "relative", width: 76, height: 96 }}>
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, border: "1px solid var(--bb-border)" }} />
      <button
        type="button"
        onClick={onRemove}
        style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: "var(--bb-red)", color: "#fff", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <X size={11} />
      </button>
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5 };
const inp = { width: "100%", padding: "10px 12px", border: "1.5px solid var(--bb-border)", borderRadius: 6, fontSize: 14, fontFamily: "inherit" };
const btn = { padding: "12px 28px", background: "var(--bb-blue)", color: "#fff", border: "none", borderRadius: 6, fontWeight: 800, fontSize: 14, cursor: "pointer" };
const addBox = { width: 76, height: 96, border: "1.5px dashed var(--bb-border-dark)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#888", cursor: "pointer" };
