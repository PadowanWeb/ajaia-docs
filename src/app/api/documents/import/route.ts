import { NextResponse } from "next/server";
import { AuthError, requireUser } from "@/lib/auth";
import { plainTextToTipTapJson, titleFromFilename } from "@/lib/document";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 1_000_000;
const ALLOWED = new Set(["text/plain", "text/markdown", "application/octet-stream", ""]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a .txt or .md file to import." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is too large. Maximum size is 1 MB." }, { status: 400 });
    }

    const name = file.name || "import.txt";
    if (!/\.(txt|md)$/i.test(name)) {
      return NextResponse.json(
        { error: "Unsupported file type. Only .txt and .md files are supported." },
        { status: 400 },
      );
    }

    if (!ALLOWED.has(file.type)) {
      // Some browsers send empty or octet-stream for .md — still allow by extension.
    }

    const text = await file.text();
    const document = await prisma.document.create({
      data: {
        title: titleFromFilename(name),
        content: plainTextToTipTapJson(text),
        ownerId: user.id,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to import file." }, { status: 500 });
  }
}
