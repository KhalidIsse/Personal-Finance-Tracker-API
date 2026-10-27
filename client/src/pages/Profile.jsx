import { useState } from "react";
import { CircleAlert, CircleCheck, Upload } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg({ text: "", error: false });
    try {
      const form = new FormData();
      form.append("picture", file);
      const d = await api("/upload/profile-picture", { method: "POST", form });
      setUser(d.user);
      setFile(null);
      e.target.reset();
      setMsg({ text: "Profile picture updated.", error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mx-auto max-w-[520px] mt-8">
      <CardHeader>
        <CardTitle className="text-lg">Profile</CardTitle>
        <CardDescription>Your account details and picture.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-[72px]">
          {user.profilePicture?.url && <AvatarImage src={user.profilePicture.url} alt="Your profile" />}
          <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="text-lg leading-none font-bold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge variant="secondary" className="capitalize">{user.role}</Badge>
        </div>
      </CardContent>
      <Separator />
      <form onSubmit={upload} className="flex flex-col gap-5">
        <CardContent className="grid gap-2">
          <Label htmlFor="picture">New profile picture</Label>
          <Input
            id="picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setFile(e.target.files[0] ?? null)}
          />
          <p className="text-sm text-muted-foreground">JPEG, PNG or WebP, up to 2 MB.</p>
          {msg.text && (
            <Alert variant={msg.error ? "destructive" : "success"}>
              {msg.error ? <CircleAlert /> : <CircleCheck />}
              <AlertDescription>{msg.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button disabled={!file || busy}>
            <Upload /> {busy ? "Uploading…" : "Upload picture"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
