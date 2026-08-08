import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminLayout() {
  const { username, logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bb-gray-light)" }}>
      <header
        style={{
          background: "var(--bb-navy)",
          color: "#fff",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/admin" style={{ color: "#fff", fontWeight: 900, fontSize: 17, textDecoration: "none" }}>
          BashaBos Admin
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13 }}>
          <span style={{ opacity: 0.8 }}>{username}</span>
          <button
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              border: "none",
              padding: "7px 14px",
              borderRadius: 5,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Log out
          </button>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
        <Outlet />
      </main>
    </div>
  );
}
