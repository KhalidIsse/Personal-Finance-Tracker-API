import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "./auth.jsx";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-12 text-center text-muted-foreground">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function NavItem({ to, end, children }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }))}
    >
      {children}
    </NavLink>
  );
}

function Shell({ children }) {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-[1080px] items-center gap-3 px-4 py-3 sm:px-6">
          <span className="mr-auto text-xl font-extrabold tracking-tight">Ledgerline</span>
          <nav className="flex gap-1">
            <NavItem to="/" end>Ledger</NavItem>
            <NavItem to="/profile">Profile</NavItem>
            {user.role === "admin" && <NavItem to="/admin">Admin</NavItem>}
          </nav>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut /> Log out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] p-4 sm:p-6">{children}</main>
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
