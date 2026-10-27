import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, Pencil, Trash2 } from "lucide-react";
import { api, money } from "../api.js";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ title: "", amount: "", type: "expense", category: "", date: today() });

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState(null);
  const [txs, setTxs] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(emptyForm());
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
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
  const setValue = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

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

  const confirmDelete = async () => {
    const id = deleteId;
    setDeleteId(null);
    try { await api(`/transactions/${id}`, { method: "DELETE" }); load(); } catch (e) { setError(e.message); }
  };

  const inc = summary?.totalIncome || 0;
  const exp = summary?.totalExpense || 0;
  const incShare = inc + exp ? (inc / (inc + exp)) * 100 : 50;
  const maxCat = Math.max(1, ...(summary?.byCategory.map((c) => c.total) || [1]));
  const balance = summary?.balance || 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      {/* Balance */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Balance</CardTitle>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month" className="w-auto" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className={cn("text-[clamp(2.6rem,7vw,4.2rem)] leading-none font-extrabold tracking-tighter tabular-nums", balance < 0 && "text-spend")}>
            {money(balance)}
          </p>
          <Progress
            value={incShare}
            className="h-2.5 bg-spend"
            indicatorClassName="bg-gain"
            aria-label={`Income ${money(inc)}, expenses ${money(exp)}`}
          />
          <div className="flex justify-between text-sm">
            <span><b className="text-gain">{money(inc)}</b> in</span>
            <span><b className="text-spend">{money(exp)}</b> out</span>
          </div>
        </CardContent>
      </Card>

      {/* Add / edit */}
      <Card>
        <form onSubmit={submit} className="flex flex-col gap-5">
          <CardHeader>
            <CardTitle className="text-lg">{editing ? "Edit transaction" : "Add transaction"}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={form.type} onValueChange={setValue("type")}>
              <TabsList aria-label="Type">
                <TabsTrigger value="expense">Expense</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={set("title")} required maxLength={100} placeholder="Groceries" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" step="0.01" min="0.01" value={form.amount} onChange={set("amount")} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={form.date} onChange={set("date")} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={form.category} onValueChange={setValue("category")}>
                <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                <SelectContent>
                  {options.map((c) => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {error && (
              <Alert variant="destructive"><CircleAlert /><AlertDescription>{error}</AlertDescription></Alert>
            )}
          </CardContent>
          <CardFooter className="gap-3">
            <Button>{editing ? "Save changes" : "Add transaction"}</Button>
            {editing && (
              <Button type="button" variant="outline" onClick={() => { setEditing(null); setForm(emptyForm()); }}>
                Cancel
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* By category */}
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-lg">Where it went</CardTitle></CardHeader>
        <CardContent>
          {!summary?.byCategory.length ? (
            <p className="text-muted-foreground">No activity this month. Add your first transaction to see it here.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {summary.byCategory.map((c) => (
                <li key={c.category + c.type} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.category}</span>
                    <b className={cn("tabular-nums", c.type === "income" && "text-gain")}>{money(c.total)}</b>
                  </div>
                  <Progress value={(c.total / maxCat) * 100} indicatorClassName={c.type === "income" ? "bg-gain" : "bg-spend"} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Transactions</CardTitle>
          <CardDescription>Up to 100 for the selected month.</CardDescription>
        </CardHeader>
        <CardContent>
          {!txs.length ? (
            <p className="text-muted-foreground">Nothing recorded for this month yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right"><span className="sr-text-right w-[80px]">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell>{new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" })}</TableCell>
                    <TableCell>{t.title}</TableCell>
                    <TableCell><Badge variant={t.type === "income" ? "gain" : "secondary"}>{t.category}</Badge></TableCell>
                    <TableCell className={cn("text-right font-bold tabular-nums", t.type === "income" ? "text-gain" : "text-spend")}>
                      {t.type === "income" ? "+" : "−"}{money(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${t.title}`} onClick={() => startEdit(t)}>
                        <Pencil />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${t.title}`} className="text-spend hover:text-spend" onClick={() => setDeleteId(t._id)}>
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
