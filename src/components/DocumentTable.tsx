"use client";

import Link from "next/link";

export type DocListItem = {
  id: string;
  title: string;
  updatedAt: string;
  owner: { name: string; email: string };
  access: "owner" | "editor" | "viewer";
  shareCount?: number;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DocumentTable({
  title,
  empty,
  documents,
  showOwner,
}: {
  title: string;
  empty: string;
  documents: DocListItem[];
  showOwner?: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">{documents.length}</span>
      </div>
      {documents.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`/documents/${doc.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">{doc.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Updated {formatDate(doc.updatedAt)}
                    {showOwner ? ` · Owned by ${doc.owner.name}` : null}
                    {doc.access === "owner" && typeof doc.shareCount === "number"
                      ? ` · Shared with ${doc.shareCount}`
                      : null}
                    {doc.access !== "owner" ? ` · ${doc.access}` : null}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    doc.access === "owner"
                      ? "bg-teal-50 text-teal-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  {doc.access === "owner" ? "Owned" : "Shared"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
