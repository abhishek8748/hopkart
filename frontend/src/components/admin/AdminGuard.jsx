import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

export default function AdminGuard({ children }) {
  const { username, checking } = useAdminAuth();
  if (checking) return <div style={{ padding: 60, textAlign: "center", color: "#888" }}>Loading…</div>;
  if (!username) return <Navigate to="/admin/login" replace />;
  return children;
}
