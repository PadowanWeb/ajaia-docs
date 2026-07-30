import { LoginForm } from "@/components/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">Ajaia Docs</p>
          <h1 className="text-3xl font-semibold text-slate-900">Sign in to collaborate</h1>
          <p className="text-sm text-slate-600">
            Lightweight document editing with import and sharing. Use the seeded demo accounts below.
          </p>
        </div>
        <a
          href="/walkthrough"
          className="flex w-full items-center justify-center rounded-xl border border-teal-700 bg-teal-800 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-900"
        >
          Watch presentation video (no login)
        </a>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
