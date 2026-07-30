import { prisma } from "./prisma";

export type AccessLevel = "none" | "viewer" | "editor" | "owner";

export async function getDocumentAccess(documentId: string, userId: string): Promise<AccessLevel> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      shares: {
        where: { userId },
        take: 1,
      },
    },
  });

  if (!document) return "none";
  if (document.ownerId === userId) return "owner";

  const share = document.shares[0];
  if (!share) return "none";
  if (share.role === "editor") return "editor";
  return "viewer";
}

export function canRead(access: AccessLevel) {
  return access !== "none";
}

export function canWrite(access: AccessLevel) {
  return access === "owner" || access === "editor";
}

export function canShare(access: AccessLevel) {
  return access === "owner";
}

/** Pure helper used by unit tests — mirrors share decision logic. */
export function resolveAccess(params: {
  ownerId: string;
  userId: string;
  shareRole?: "viewer" | "editor" | null;
}): AccessLevel {
  if (params.ownerId === params.userId) return "owner";
  if (params.shareRole === "editor") return "editor";
  if (params.shareRole === "viewer") return "viewer";
  return "none";
}
