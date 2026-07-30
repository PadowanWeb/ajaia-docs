export const EMPTY_DOC_CONTENT = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function plainTextToTipTapJson(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content = lines.map((line) => {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      const level = Math.min(heading[1].length, 3) as 1 | 2 | 3;
      return {
        type: "heading",
        attrs: { level },
        content: heading[2] ? [{ type: "text", text: heading[2] }] : [],
      };
    }

    if (/^[-*]\s+/.test(line)) {
      return {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.replace(/^[-*]\s+/, "") }],
              },
            ],
          },
        ],
      };
    }

    if (/^\d+\.\s+/.test(line)) {
      return {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: line.replace(/^\d+\.\s+/, "") }],
              },
            ],
          },
        ],
      };
    }

    return {
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    };
  });

  return JSON.stringify({
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  });
}

export function titleFromFilename(filename: string) {
  return filename.replace(/\.(txt|md)$/i, "").trim() || "Imported document";
}
