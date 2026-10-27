import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import { api, money } from "../api.js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Admin() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api("/admin/overview").then(setData).catch((e) => setError(e.message)); }, []);

  if (error) return (
    <Alert variant="destructive"><CircleAlert /><AlertDescription>{error}</AlertDescription></Alert>
  );
  if (!data) return <p className="p-12 text-center text-muted-foreground">Loading…</p>;

  const stats = [
    ["Users", data.totalUsers],
    ["New in 30 days", data.newUsersLast30Days],
    ["Transactions", data.totalTransactions],
    ["Total income", money(data.totalIncome)],
    ["Total expenses", money(data.totalExpense)],
  ];

  return (
    <div className="grid gap-5">
      <section>
        <h2 className="mb-3 text-lg font-bold">Platform overview</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
          {stats.map(([label, value]) => (
            <Card key={label} className="gap-1">
              <CardHeader><CardDescription>{label}</CardDescription></CardHeader>
              <CardContent><p className="text-2xl font-extrabold tracking-tight tabular-nums">{value}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader><CardTitle>Top spending categories</CardTitle></CardHeader>
        <CardContent>
          {!data.topSpendingCategories.length ? (
            <p className="text-muted-foreground">No expenses recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topSpendingCategories.map((c) => (
                  <TableRow key={c.category}>
                    <TableCell>{c.category}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{c.count}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums">{money(c.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
