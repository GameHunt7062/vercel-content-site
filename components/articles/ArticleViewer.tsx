"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";

export default function ArticleViewer({ content }: { content: any }) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [StarterKit, Link, Image, Highlight, TextStyle, Color],
    content,
  });

  if (!editor) return null;
  return <div className="tiptap"><EditorContent editor={editor} /></div>;
}