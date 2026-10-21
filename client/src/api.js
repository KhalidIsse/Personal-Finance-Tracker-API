const BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => (t ? localStorage.setItem("token", t) : localStorage.removeItem("token"));

export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: form ?? (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new Error("Can't reach the server. If it was idle, give it 30 seconds to wake up and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.details?.map((d) => `${d.field}: ${d.message}`).join(", ");
    const err = new Error(detail || data.message || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

export const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
