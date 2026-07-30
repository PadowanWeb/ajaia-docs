import { DocumentEditor } from "@/components/DocumentEditor";
import { LogoutButton } from "@/components/LogoutButton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function DocumentPage({ params }: Props) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
      <div className="mb-4 flex justify-end">
        <LogoutButton />
      </div>
      <DocumentEditor documentId={id} />
    </main>
  );
}
