import { useCallback, useEffect, useMemo, useState } from "react";
import { api, money } from "../api.js";

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", amount: "", type: "expense", category: "", date: today() });

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [txs, setTxs] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        api(`/transactions/monthly-summary?month=${month}`),
        api(`/transactions?month=${month}&limit=100`),
      ]);
      setSummary(s);
      setTxs(t.data);
    } catch (e) {
      setError(e.message);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { api("/categories").then((d) => setCats(d.data)).catch((e) => setError(e.message)); }, []);

  const options = useMemo(() => cats.filter((c) => c.type === form.type), [cats, form.type]);
  useEffect(() => {
    if (options.length && !options.some((c) => c.name === form.category)) setForm((f) => ({ ...f, category: options[0].name }));
  }, [options, form.category]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const body = { ...form, amount: Number(form.amount) };
    try {
      await api(editing ? `/transactions/${editing}` : "/transactions", { method: editing ? "PUT" : "POST", body });
      setForm(emptyForm());
      setEditing(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (t) => {
    setEditing(t._id);
    setForm({ title: t.title, amount: String(t.amount), type: t.type, category: t.category, date: t.date.slice(0, 10) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try { await api(`/transactions/${id}`, { method: "DELETE" }); load(); } catch (e) { setError(e.message); }
  };

  const inc = summary?.totalIncome || 0;
  const exp = summary?.totalExpense || 0;
  const incShare = inc + exp ? (inc / (inc + exp)) * 100 : 50;
  const maxCat = Math.max(1, ...(summary?.byCategory.map((c) => c.total) || [1]));

  return (
    <div className="grid">
      <section className="panel balance">
        <div className="row between">
          <h2>Balance</h2>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month" />
        </div>
        <p className={`figure ${(summary?.balance || 0) < 0 ? "neg" : ""}`}>{money(summary?.balance)}</p>
        <div className="split" role="img" aria-label={`Income ${money(inc)}, expenses ${money(exp)}`}>
          <span style={{ width: `${incShare}%` }} />
        </div>
        <div className="row between small">
          <span><b className="pos">{money(inc)}</b> in</span>
          <span><b className="neg">{money(exp)}</b> out</span>
        </div>
      </section>

      <form className="panel" onSubmit={submit}>
        <h2>{editing ? "Edit transaction" : "Add transaction"}</h2>
        <div className="seg" role="radiogroup" aria-label="Type">
          {["expense", "income"].map((t) => (
            <label key={t} className={form.type === t ? "on" : ""}>
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={set("type")} />
              {t === "expense" ? "Expense" : "Income"}
            </label>
          ))}
        </div>
        <label>Title<input value={form.title} onChange={set("title")} required maxLength={100} placeholder="Groceries" /></label>
        <div className="row">
          <label>Amount<input type="number" step="0.01" min="0.01" value={form.amount} onChange={set("amount")} required /></label>
          <label>Date<input type="date" value={form.date} onChange={set("date")} required /></label>
        </div>
        <label>
          Category
          <select value={form.category} onChange={set("category")}>
            {options.map((c) => <option key={c._id}>{c.name}</option>)}
          </select>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="row">
          <button className="primary">{editing ? "Save changes" : "Add transaction"}</button>
          {editing && <button type="button" className="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); }}>Cancel</button>}
        </div>
      </form>

      <section className="panel">
        <h2>Where it went</h2>
        {!summary?.byCategory.length ? (
          <p className="muted">No activity this month. Add your first transaction to see it here.</p>
        ) : (
          <ul className="cats">
            {summary.byCategory.map((c) => (
              <li key={c.category + c.type}>
                <div className="row between"><span>{c.category}</span><b className={c.type === "income" ? "pos" : ""}>{money(c.total)}</b></div>
                <div className="meter"><span className={c.type} style={{ width: `${(c.total / maxCat) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel wide">
        <h2>Transactions</h2>
        {!txs.length ? <p className="muted">Nothing recorded for this month yet.</p> : (
          <table>
            <thead><tr><th>Date</th><th>Title</th><th>Category</th><th className="num">Amount</th><th /></tr></thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t._id}>
                  <td>{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td className={`num ${t.type === "income" ? "pos" : "neg"}`}>{t.type === "income" ? "+" : "−"}{money(t.amount)}</td>
                  <td className="actions">
                    <button className="link" onClick={() => startEdit(t)}>Edit</button>
                    <button className="link danger" onClick={() => remove(t._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
