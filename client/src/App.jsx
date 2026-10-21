import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="bar">
        <span className="brand">Ledgerline</span>
        <nav>
          <NavLink to="/" end>Ledger</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user.role === "admin" && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <button className="ghost" onClick={logout}>Log out</button>
      </header>
      <main>{children}</main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />
      <Route path="/" element={<Protected><Shell><Dashboard /></Shell></Protected>} />
      <Route path="/profile" element={<Protected><Shell><Profile /></Shell></Protected>} />
      <Route path="/admin" element={<Protected role="admin"><Shell><Admin /></Shell></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
