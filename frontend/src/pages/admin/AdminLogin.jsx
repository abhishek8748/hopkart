import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import * as adminApi from "../../services/adminApi";

export default function AdminLogin() {
  const { username, checking, login, bootstrap } = useAdminAuth();
  const [hasAdmin, setHasAdmin] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adminApi
      .status()
      .then(setHasAdmin)
      .catch(() => setHasAdmin(true));
  }, []);

  if (!checking && username) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (hasAdmin) await login(form.username, form.password);
      else await bootstrap(form.username, form.password);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  if (hasAdmin === null) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bb-gray-light)",
        padding: 20,
      }}
    >
      <form
        onSubmit={submit}
        style={{ background: "#fff", padding: 32, borderRadius: 8, width: 340, boxShadow: "var(--bb-shadow-modal)" }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, color: "var(--bb-navy)" }}>BashaBos Admin</h1>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
          {hasAdmin ? "Sign in to manage products." : "No admin account yet — create one to get started."}
        </p>

        {err && (
          <p
            style={{
              background: "var(--bb-red-light)",
              color: "var(--bb-red-dark)",
              padding: "8px 10px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            {err}
          </p>
        )}

        <label style={lbl}>Username</label>
        <input
          required
          autoFocus
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          style={inp}
        />

        <label style={lbl}>Password</label>
        <input
          required
          type="password"
          minLength={hasAdmin ? undefined : 8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={inp}
        />
        {!hasAdmin && <p style={{ fontSize: 11, color: "#999", marginTop: 5 }}>At least 8 characters.</p>}

        <button disabled={busy} style={btn}>
          {busy ? "Please wait…" : hasAdmin ? "Log in" : "Create admin account"}
        </button>
      </form>
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 5, marginTop: 14 };
const inp = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--bb-border)",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
};
const btn = {
  width: "100%",
  marginTop: 22,
  padding: "11px",
  background: "var(--bb-blue)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  fontWeight: 800,
  fontSize: 14,
  cursor: "pointer",
};
