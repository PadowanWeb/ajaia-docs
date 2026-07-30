import { NextResponse } from "next/server";
import { z } from "zod";
import { canShare, getDocumentAccess } from "@/lib/access";
import { AuthError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const shareSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]).default("editor"),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);
    if (!canShare(access)) {
      return NextResponse.json({ error: "Only the owner can share this document." }, { status: 403 });
    }

    const json = await request.json();
    const parsed = shareSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Provide a valid email and role." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });
    if (!target) {
      return NextResponse.json(
        { error: "No user found with that email. Try alice@demo.com, bob@demo.com, or charlie@demo.com." },
        { status: 404 },
      );
    }
    if (target.id === user.id) {
      return NextResponse.json({ error: "You already own this document." }, { status: 400 });
    }

    const share = await prisma.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: target.id,
        },
      },
      create: {
        documentId: id,
        userId: target.id,
        role: parsed.data.role,
      },
      update: {
        role: parsed.data.role,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      share: {
        id: share.id,
        role: share.role,
        user: share.user,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to share document." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const access = await getDocumentAccess(id, user.id);
    if (!canShare(access)) {
      return NextResponse.json({ error: "Only the owner can manage sharing." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    await prisma.documentShare.deleteMany({
      where: { documentId: id, userId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to revoke share." }, { status: 500 });
  }
}
