"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style"; 
import { useState } from "react";

type Props = {
  initialContent?: any;
  onSave: (content: any) => Promise<void>;
};

export default function ArticleEditor({ initialContent, onSave }: Props) {
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Highlight,
      TextStyle,
      Color,
    ],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
  });

  if (!editor) return <div>Loading editor...</div>;

  async function save() {
    setSaving(true);
    try { await onSave(editor.getJSON()); }
    finally { setSaving(false); }
  }

  const btn = "px-2 py-1 rounded border text-sm hover:bg-zinc-100";

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap gap-2 p-3 border-b">
        <button className={btn} onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleCode().run()}>Code</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>
        <button className={btn} onClick={() => editor.chain().focus().setColor("#ef4444").run()}>Red</button>
        <button className={btn} onClick={() => editor.chain().focus().setColor("#00a884").run()}>Green</button>
        <button className={btn} onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
        <button className={btn} onClick={() => {
          const url = window.prompt("URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>Link</button>
      </div>

      <EditorContent editor={editor} className="min-h-[500px] p-6 tiptap" />

      <div className="border-t p-3 flex justify-end">
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-lg bg-black text-white">
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
