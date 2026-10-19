/** Plain text (old artwork descriptions) -> Tiptap document */
export function textToDoc(text: string) {
  const lines = text.replace(/\r/g, "").split("\n");
  return {
    type: "doc",
    content: lines.map((l) => (l.trim() ? { type: "paragraph", content: [{ type: "text", text: l }] } : { type: "paragraph" })),
  };
}

/** true if the Tiptap document has any text, image or divider */
export function docHasContent(node: any): boolean {
  if (!node) return false;
  if (node.type === "text") return !!String(node.text ?? "").trim();
  if (node.type === "image" || node.type === "horizontalRule") return true;
  return Array.isArray(node.content) && node.content.some(docHasContent);
}
