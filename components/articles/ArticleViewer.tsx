"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { getExtensions } from "@/components/editor/extensions";

/** Read-only renderer for any Tiptap JSON (articles and artwork descriptions). */
export default function ArticleViewer({ content, className = "" }: { content: any; className?: string }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: getExtensions(false),
    content,
  });

  if (!editor) return null;
  return <div className={`tiptap ${className}`}><EditorContent editor={editor} /></div>;
}
