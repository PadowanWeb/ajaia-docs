import { NextResponse } from "next/server";
import { z } from "zod";
import { canRead, canWrite, getDocumentAccess } from "@/lib/access";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);
    if (!canRead(access)) {
      return NextResponse.json({ error: "Document not found or access denied." }, { status: 404 });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        content: document.content,
        updatedAt: document.updatedAt,
        createdAt: document.createdAt,
        owner: document.owner,
        shares: document.shares.map((share) => ({
          id: share.id,
          role: share.role,
          user: share.user,
        })),
        access,
        canWrite: canWrite(access),
        canShare: access === "owner",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to load document." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);
    if (!canWrite(access)) {
      return NextResponse.json({ error: "You do not have permission to edit this document." }, { status: 403 });
    }

    const json = await request.json();
    const parsed = updateSchema.safeParse(json);
    if (!parsed.success || (!parsed.data.title && !parsed.data.content)) {
      return NextResponse.json({ error: "Provide a title and/or content to update." }, { status: 400 });
    }

    if (parsed.data.content) {
      try {
        const parsedContent = JSON.parse(parsed.data.content);
        if (!parsedContent || parsedContent.type !== "doc") {
          return NextResponse.json({ error: "Invalid document content." }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid document content JSON." }, { status: 400 });
      }
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(parsed.data.title ? { title: parsed.data.title } : {}),
        ...(parsed.data.content ? { content: parsed.data.content } : {}),
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);
    if (access !== "owner") {
      return NextResponse.json({ error: "Only the owner can delete this document." }, { status: 403 });
    }

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to delete document." }, { status: 500 });
  }
}
