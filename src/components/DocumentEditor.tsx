"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./EditorToolbar";
import { SharePanel } from "./SharePanel";

type Share = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

type DocumentPayload = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string };
  shares: Share[];
  access: "owner" | "editor" | "viewer";
  canWrite: boolean;
  canShare: boolean;
};

export function DocumentEditor({ documentId }: { documentId: string }) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentPayload | null>(null);
  const [title, setTitle] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    editable: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[420px] px-6 py-5 focus:outline-none [&_ul]:list-disc [&_ol]:list-decimal",
      },
    },
    onUpdate: () => {
      setSaveState("idle");
    },
  });

  const loadDocument = useCallback(async () => {
    setLoadError(null);
    const response = await fetch(`/api/documents/${documentId}`);
    const data = await response.json();
    if (!response.ok) {
      setLoadError(data.error || "Failed to load document.");
      return;
    }
    const document = data.document as DocumentPayload;
    setDoc(document);
    setTitle(document.title);
    if (editor) {
      editor.commands.setContent(JSON.parse(document.content));
      editor.setEditable(document.canWrite);
    }
  }, [documentId, editor]);

  useEffect(() => {
    if (editor) {
      void loadDocument();
    }
  }, [editor, loadDocument]);

  async function save(overrides?: { title?: string; content?: string }) {
    if (!doc?.canWrite) return;
    setSaveState("saving");
    setSaveError(null);
    try {
      const content = overrides?.content ?? JSON.stringify(editor?.getJSON() ?? {});
      const nextTitle = overrides?.title ?? title;
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveState("error");
        setSaveError(data.error || "Save failed.");
        return;
      }
      setDoc((current) =>
        current
          ? {
              ...current,
              title: data.document.title,
              content: data.document.content,
              updatedAt: data.document.updatedAt,
            }
          : current,
      );
      setSaveState("saved");
    } catch {
      setSaveState("error");
      setSaveError("Save failed.");
    }
  }

  useEffect(() => {
    if (!editor || !doc?.canWrite) return;
    const handle = window.setTimeout(() => {
      void save();
    }, 1200);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.state.doc, title, doc?.canWrite]);

  async function deleteDocument() {
    if (!doc || doc.access !== "owner") return;
    if (!window.confirm("Delete this document permanently?")) return;
    const response = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/");
      router.refresh();
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="font-medium">{loadError}</p>
        <Link href="/" className="mt-3 inline-block text-sm underline">
          Back to documents
        </Link>
      </div>
    );
  }

  if (!doc || !editor) {
    return <p className="text-sm text-slate-500">Loading document…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm text-teal-800 hover:underline">
          ← All documents
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              doc.access === "owner" ? "bg-teal-50 text-teal-800" : "bg-amber-50 text-amber-800"
            }`}
          >
            {doc.access === "owner" ? "Owned by you" : `Shared · ${doc.access}`}
          </span>
          <span className="text-slate-500">
            {saveState === "saving"
              ? "Saving…"
              : saveState === "saved"
                ? "Saved"
                : saveState === "error"
                  ? "Save error"
                  : doc.canWrite
                    ? "Edits autosave"
                    : "View only"}
          </span>
          {doc.canWrite ? (
            <button
              type="button"
              onClick={() => void save()}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50"
            >
              Save now
            </button>
          ) : null}
          {doc.access === "owner" ? (
            <button
              type="button"
              onClick={() => void deleteDocument()}
              className="rounded-md border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <input
        value={title}
        disabled={!doc.canWrite}
        onChange={(event) => {
          setTitle(event.target.value);
          setSaveState("idle");
        }}
        onBlur={() => {
          if (title.trim() && title !== doc.title) {
            void save({ title: title.trim() });
          }
        }}
        className="w-full border-0 bg-transparent text-3xl font-semibold text-slate-900 outline-none placeholder:text-slate-300 disabled:opacity-70"
        placeholder="Untitled document"
      />
      <p className="text-xs text-slate-500">
        Owner: {doc.owner.name} ({doc.owner.email})
      </p>

      {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <EditorToolbar editor={editor} readOnly={!doc.canWrite} />
        <EditorContent editor={editor} />
      </div>

      {doc.canShare ? (
        <SharePanel
          documentId={documentId}
          shares={doc.shares}
          onChanged={() => void loadDocument()}
        />
      ) : null}
    </div>
  );
}
