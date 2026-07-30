import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { EMPTY_DOC_CONTENT } from "../src/lib/document";

const prisma = new PrismaClient();

const USERS = [
  { email: "alice@demo.com", name: "Alice Chen", password: "demo1234" },
  { email: "bob@demo.com", name: "Bob Okonkwo", password: "demo1234" },
  { email: "charlie@demo.com", name: "Charlie Sato", password: "demo1234" },
];

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Database already seeded (${existingUsers} users). Skipping.`);
    return;
  }

  const created = [];
  for (const user of USERS) {
    created.push(
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          passwordHash: await bcrypt.hash(user.password, 10),
        },
      }),
    );
  }

  const [alice, bob] = created;

  const welcome = await prisma.document.create({
    data: {
      title: "Welcome to Ajaia Docs",
      ownerId: alice.id,
      content: JSON.stringify({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a lightweight collaborative document editor. Try " },
              { type: "text", marks: [{ type: "bold" }], text: "bold" },
              { type: "text", text: ", " },
              { type: "text", marks: [{ type: "italic" }], text: "italic" },
              { type: "text", text: ", and " },
              { type: "text", marks: [{ type: "underline" }], text: "underline" },
              { type: "text", text: "." },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Create and rename documents" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Import .txt or .md files" }],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Share with teammates" }],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  });

  await prisma.documentShare.create({
    data: {
      documentId: welcome.id,
      userId: bob.id,
      role: "editor",
    },
  });

  await prisma.document.create({
    data: {
      title: "Alice private notes",
      ownerId: alice.id,
      content: EMPTY_DOC_CONTENT,
    },
  });

  console.log("Seeded users:");
  for (const user of USERS) {
    console.log(`  ${user.email} / ${user.password}`);
  }
  console.log(`Shared "${welcome.title}" from Alice with Bob (editor).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
