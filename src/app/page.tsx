import { DashboardActions } from "@/components/DashboardActions";
import { DocumentTable } from "@/components/DocumentTable";
import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const owned = await prisma.document.findMany({
    where: { ownerId: user.id },
    include: {
      owner: { select: { name: true, email: true } },
      shares: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const shared = await prisma.document.findMany({
    where: { shares: { some: { userId: user.id } } },
    include: {
      owner: { select: { name: true, email: true } },
      shares: { where: { userId: user.id }, select: { role: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">Ajaia Docs</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Your documents</h1>
          <p className="mt-1 text-sm text-slate-600">
            Signed in as <span className="font-medium text-slate-800">{user.name}</span> ({user.email})
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <DashboardActions />
      </div>

      <div className="space-y-10">
        <DocumentTable
          title="Owned by you"
          empty="No owned documents yet. Create one or import a file."
          documents={owned.map((doc) => ({
            id: doc.id,
            title: doc.title,
            updatedAt: doc.updatedAt.toISOString(),
            owner: doc.owner,
            access: "owner" as const,
            shareCount: doc.shares.length,
          }))}
        />
        <DocumentTable
          title="Shared with you"
          empty="Nothing shared with you yet. Ask Alice to share a doc, or log in as Bob."
          showOwner
          documents={shared.map((doc) => ({
            id: doc.id,
            title: doc.title,
            updatedAt: doc.updatedAt.toISOString(),
            owner: doc.owner,
            access: (doc.shares[0]?.role === "viewer" ? "viewer" : "editor") as "editor" | "viewer",
          }))}
        />
      </div>
    </main>
  );
}
