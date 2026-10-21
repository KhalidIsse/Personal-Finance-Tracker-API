import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

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
      setMsg({ text: "Profile picture updated.", error: false });
    } catch (err) {
      setMsg({ text: err.message, error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="panel narrow">
      <h2>Profile</h2>
      <div className="row profile">
        {user.profilePicture?.url ? <img src={user.profilePicture.url} alt="Your profile" className="avatar" /> : <div className="avatar empty">{user.name[0]}</div>}
        <div>
          <p className="name">{user.name}</p>
          <p className="muted">{user.email} · {user.role}</p>
        </div>
      </div>
      <form onSubmit={upload}>
        <label>
          New profile picture (JPEG, PNG or WebP, up to 2 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0])} />
        </label>
        {msg.text && <p className={msg.error ? "error" : "ok"} role="status">{msg.text}</p>}
        <button className="primary" disabled={!file || busy}>{busy ? "Uploading…" : "Upload picture"}</button>
      </form>
    </div>
  );
}
