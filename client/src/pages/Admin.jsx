import { useEffect, useState } from "react";
import { api, money } from "../api.js";

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api("/admin/overview").then(setData).catch((e) => setError(e.message)); }, []);

  if (error) return <p className="error" role="alert">{error}</p>;
  if (!data) return <p className="muted center">Loading…</p>;

  const stats = [
    ["Users", data.totalUsers],
    ["New in 30 days", data.newUsersLast30Days],
    ["Transactions", data.totalTransactions],
    ["Total income", money(data.totalIncome)],
    ["Total expenses", money(data.totalExpense)],
  ];
  return (
    <div className="grid">
      <section className="panel wide">
        <h2>Platform overview</h2>
        <dl className="stats">
          {stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </section>
      <section className="panel wide">
        <h2>Top spending categories</h2>
        {!data.topSpendingCategories.length ? <p className="muted">No expenses recorded yet.</p> : (
          <table>
            <thead><tr><th>Category</th><th className="num">Transactions</th><th className="num">Total</th></tr></thead>
            <tbody>{data.topSpendingCategories.map((c) => (
              <tr key={c.category}><td>{c.category}</td><td className="num">{c.count}</td><td className="num">{money(c.total)}</td></tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </div>
  );
}
