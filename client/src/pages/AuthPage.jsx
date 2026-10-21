import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth.jsx";

export default function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const isLogin = mode === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (isLogin ? login({ email: form.email, password: form.password }) : register(form));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-pitch">
        <h1>Ledgerline</h1>
        <p>Every dollar in, every dollar out, one line at a time.</p>
      </section>
      <form className="auth-form" onSubmit={submit}>
        <h2>{isLogin ? "Log in" : "Create your account"}</h2>
        {!isLogin && (
          <label>Name<input value={form.name} onChange={set("name")} required minLength={2} autoComplete="name" /></label>
        )}
        <label>Email<input type="email" value={form.email} onChange={set("email")} required autoComplete="email" /></label>
        <label>
          Password
          <input type="password" value={form.password} onChange={set("password")} required minLength={isLogin ? 1 : 8}
            autoComplete={isLogin ? "current-password" : "new-password"} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}</button>
        <p className="muted">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"}>{isLogin ? "Create an account" : "Log in"}</Link>
        </p>
      </form>
    </div>
  );
}
