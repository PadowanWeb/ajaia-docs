import { describe, expect, it } from "vitest";
import { canRead, canShare, canWrite, resolveAccess } from "../src/lib/access";
import { plainTextToTipTapJson, titleFromFilename } from "../src/lib/document";

describe("document access", () => {
  it("gives owners full access", () => {
    const access = resolveAccess({ ownerId: "a", userId: "a" });
    expect(access).toBe("owner");
    expect(canRead(access)).toBe(true);
    expect(canWrite(access)).toBe(true);
    expect(canShare(access)).toBe(true);
  });

  it("allows editors to write but not share", () => {
    const access = resolveAccess({ ownerId: "a", userId: "b", shareRole: "editor" });
    expect(access).toBe("editor");
    expect(canWrite(access)).toBe(true);
    expect(canShare(access)).toBe(false);
  });

  it("allows viewers to read only", () => {
    const access = resolveAccess({ ownerId: "a", userId: "b", shareRole: "viewer" });
    expect(access).toBe("viewer");
    expect(canRead(access)).toBe(true);
    expect(canWrite(access)).toBe(false);
  });

  it("denies users without a share", () => {
    const access = resolveAccess({ ownerId: "a", userId: "c", shareRole: null });
    expect(access).toBe("none");
    expect(canRead(access)).toBe(false);
  });
});

describe("file import helpers", () => {
  it("derives a title from the filename", () => {
    expect(titleFromFilename("sprint-notes.md")).toBe("sprint-notes");
    expect(titleFromFilename("readme.txt")).toBe("readme");
  });

  it("converts markdown-ish text into TipTap JSON", () => {
    const json = JSON.parse(
      plainTextToTipTapJson("# Hello\n\n- one\n1. two\nplain"),
    );
    expect(json.type).toBe("doc");
    expect(json.content[0].type).toBe("heading");
    expect(json.content[0].attrs.level).toBe(1);
    expect(json.content.some((node: { type: string }) => node.type === "bulletList")).toBe(true);
    expect(json.content.some((node: { type: string }) => node.type === "orderedList")).toBe(true);
  });
});
