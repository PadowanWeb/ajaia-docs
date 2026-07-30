"use client";

import { FormEvent, useEffect, useState } from "react";

type Share = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type UserOption = { id: string; name: string; email: string };

export function SharePanel({
  documentId,
  shares,
  onChanged,
}: {
  documentId: string;
  shares: Share[];
  onChanged: () => void;
}) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.users)) setUsers(data.users);
      })
      .catch(() => undefined);
  }, []);

  async function share(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not share.");
        return;
      }
      setEmail("");
      onChanged();
    } catch {
      setError("Could not share.");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userId: string) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not revoke access.");
        return;
      }
      onChanged();
    } catch {
      setError("Could not revoke access.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Sharing</h2>
      <p className="mt-1 text-sm text-slate-500">
        Grant access to another seeded user. Editors can edit; viewers can only read.
      </p>

      <form onSubmit={share} className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1 space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="share-email">
            User email
          </label>
          <input
            id="share-email"
            list="share-users"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="bob@demo.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-teal-700/30 focus:ring-2"
            required
          />
          <datalist id="share-users">
            {users.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name}
              </option>
            ))}
          </datalist>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600" htmlFor="share-role">
            Role
          </label>
          <select
            id="share-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "editor" | "viewer")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
        >
          Share
        </button>
      </form>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <ul className="mt-4 divide-y divide-slate-100">
        {shares.length === 0 ? (
          <li className="py-2 text-sm text-slate-500">Not shared with anyone yet.</li>
        ) : (
          shares.map((shareItem) => (
            <li key={shareItem.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-800">{shareItem.user.name}</p>
                <p className="text-xs text-slate-500">
                  {shareItem.user.email} · {shareItem.role}
                </p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => void revoke(shareItem.user.id)}
                className="text-xs text-red-700 hover:underline disabled:opacity-50"
              >
                Revoke
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
