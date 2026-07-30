"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardActions() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"create" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createDocument() {
    setBusy("create");
    setError(null);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled document" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Could not create document.");
        return;
      }
      router.push(`/documents/${data.document.id}`);
    } catch {
      setError("Could not create document.");
    } finally {
      setBusy(null);
    }
  }

  async function onImport(file: File) {
    setBusy("import");
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/documents/import", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Import failed.");
        return;
      }
      router.push(`/documents/${data.document.id}`);
    } catch {
      setError("Import failed.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={createDocument}
          disabled={busy !== null}
          className="rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:opacity-60"
        >
          {busy === "create" ? "Creating…" : "New document"}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy !== null}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy === "import" ? "Importing…" : "Import .txt / .md"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,text/plain,text/markdown"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onImport(file);
          }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Supported uploads: <strong>.txt</strong> and <strong>.md</strong> only (max 1 MB). Import creates a new
        editable document.
      </p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
