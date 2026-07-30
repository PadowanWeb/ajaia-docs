import Link from "next/link";

export const metadata = {
  title: "Walkthrough — Ajaia Docs",
  description: "3–5 minute product walkthrough for the Ajaia assessment",
};

export default function WalkthroughPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">Ajaia Docs</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">Product walkthrough</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Public ~4 minute demo for reviewers. No login required.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
        <video
          className="aspect-video w-full"
          controls
          preload="metadata"
          playsInline
          src="/walkthrough/Ajaia-Docs-Walkthrough.mp4"
        >
          <a className="text-teal-300 underline" href="/walkthrough/Ajaia-Docs-Walkthrough.mp4">
            Download the MP4
          </a>
        </video>
      </div>

      <p className="mt-6 text-sm text-slate-600">
        <Link href="/login" className="font-medium text-teal-800 hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </main>
  );
}
