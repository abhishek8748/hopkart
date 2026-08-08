import { createContext, useContext, useEffect, useState } from "react";
import * as adminApi from "../services/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [username, setUsername] = useState(adminApi.getStoredUsername());
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminApi
      .me()
      .then((u) => setUsername(u))
      .finally(() => setChecking(false));
  }, []);

  const login = async (u, p) => {
    const name = await adminApi.login(u, p);
    setUsername(name);
  };
  const bootstrap = async (u, p) => {
    const name = await adminApi.bootstrap(u, p);
    setUsername(name);
  };
  const logout = () => {
    adminApi.logout();
    setUsername(null);
  };

  return (
    <AdminAuthContext.Provider value={{ username, checking, login, bootstrap, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
