import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";

/**
 * One extension list shared by the editor and the public viewer, so what you write
 * is exactly what visitors see. (Link + Underline already ship inside StarterKit v3.)
 */
export function getExtensions(editable: boolean, placeholder?: string) {
  return [
    StarterKit.configure({
      link: {
        openOnClick: !editable,
        autolink: true,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
      },
    }),
    Image,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    ...(editable && placeholder ? [Placeholder.configure({ placeholder })] : []),
  ];
}
