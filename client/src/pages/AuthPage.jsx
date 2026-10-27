import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { useAuth } from "../auth.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="grid min-h-screen md:grid-cols-2">
      <section className="flex min-h-[180px] flex-col justify-end gap-3 bg-foreground p-6 text-background md:p-12">
        <h1 className="text-[clamp(3rem,8vw,6rem)] leading-[0.95] font-extrabold tracking-tighter">Ledgerline</h1>
        <p className="max-w-[22ch] text-lg text-background/70">Every dollar in, every dollar out, one line at a time.</p>
      </section>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <form onSubmit={submit} className="flex flex-col gap-5">
            <CardHeader>
              <CardTitle className="text-2xl">{isLogin ? "Log in" : "Create your account"}</CardTitle>
              <CardDescription>
                {isLogin ? "Welcome back. Enter your details to continue." : "Start tracking your money in a minute."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={set("name")} required minLength={2} autoComplete="name" />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={set("password")}
                  required
                  minLength={isLogin ? 1 : 8}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <CircleAlert />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button className="w-full" disabled={busy}>
                {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isLogin ? "New here? " : "Already have an account? "}
                <Link className="font-medium text-primary underline-offset-4 hover:underline" to={isLogin ? "/register" : "/login"}>
                  {isLogin ? "Create an account" : "Log in"}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
