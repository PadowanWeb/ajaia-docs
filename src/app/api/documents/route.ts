import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthError, requireUser } from "@/lib/auth";
import { EMPTY_DOC_CONTENT } from "@/lib/document";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();

    const owned = await prisma.document.findMany({
      where: { ownerId: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const shared = await prisma.document.findMany({
      where: {
        shares: { some: { userId: user.id } },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: {
          where: { userId: user.id },
          select: { role: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      owned: owned.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
        owner: doc.owner,
        access: "owner" as const,
        shareCount: doc.shares.length,
      })),
      shared: shared.map((doc) => ({
        id: doc.id,
        title: doc.title,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
        owner: doc.owner,
        access: (doc.shares[0]?.role === "viewer" ? "viewer" : "editor") as "viewer" | "editor",
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to list documents." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const json = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid document payload." }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title: parsed.data.title?.trim() || "Untitled document",
        content: EMPTY_DOC_CONTENT,
        ownerId: user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to create document." }, { status: 500 });
  }
}
