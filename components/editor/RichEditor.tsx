"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import { getExtensions } from "./extensions";
import { HIGHLIGHT_COLORS, TEXT_COLORS, loadRecentColors, normalizeHex, rememberColor } from "./colors";
import { uploadImage } from "@/lib/artwork";

export type EditorChange = { json: any; text: string };

type Props = {
  initialContent?: any;
  onChange?: (change: EditorChange) => void;
  minHeight?: number;
  placeholder?: string;
};

/* ---------- small UI helpers ---------- */

const tb = (on = false) =>
  `inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors disabled:pointer-events-none disabled:opacity-30 ${
    on ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
  }`;

const field =
  "w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700";

const smallBtn =
  "rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-800";

function Btn({ title, on, disabled, onClick, children }: { title: string; on?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={on}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the text selection while clicking
      onClick={onClick}
      className={tb(on)}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-1 hidden h-5 w-px bg-zinc-300 dark:bg-zinc-700 sm:inline-block" aria-hidden />;

function Popover({
  trigger, title, active, onOpen, width = "w-80", children,
}: {
  trigger: ReactNode; title: string; active?: boolean; onOpen?: () => void; width?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  // keep the panel inside the screen (important on phones)
  useLayoutEffect(() => {
    if (!open) { setShift(0); return; }
    const el = panel.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = r.left - shift;
    const right = r.right - shift;
    const vw = document.documentElement.clientWidth;
    let s = 0;
    if (right > vw - 8) s = vw - 8 - right;
    if (left + s < 8) s = 8 - left;
    if (s !== shift) setShift(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        title={title}
        aria-label={title}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => { if (!open) onOpen?.(); setOpen((o) => !o); }}
        className={tb(active || open)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panel}
          style={{ transform: `translateX(${shift}px)` }}
          className={`absolute left-0 top-full z-30 mt-2 ${width} max-w-[calc(100vw-1rem)] rounded-xl border border-zinc-300 bg-white p-3 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-900`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/* ---------- color panel (text color + highlight) ---------- */

function ColorPanel({
  title, palette, current, onPick, onPreview, onClear, clearLabel, close,
}: {
  title: string; palette: string[]; current: string | null;
  onPick: (c: string) => void; onPreview: (c: string) => void; onClear: () => void; clearLabel: string; close: () => void;
}) {
  const [recent, setRecent] = useState<string[]>([]);
  const [hex, setHex] = useState(normalizeHex(current) ?? "");
  useEffect(() => { setRecent(loadRecentColors()); }, []);

  const cur = normalizeHex(current);
  const pick = (c: string) => { onPick(c); setRecent(rememberColor(c)); setHex(c); close(); };

  const swatch = (c: string) => (
    <button
      key={c}
      type="button"
      title={c}
      aria-label={c}
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => pick(c)}
      style={{ backgroundColor: c }}
      className={`h-5 w-5 rounded border border-black/15 transition-transform hover:scale-125 dark:border-white/30 ${
        cur === c ? "ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-zinc-900" : ""
      }`}
    />
  );

  const valid = normalizeHex(hex);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{title}</p>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onClear(); close(); }} className="text-xs underline">
          {clearLabel}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-1">{palette.map(swatch)}</div>

      {recent.length > 0 && (
        <div>
          <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Recently used</p>
          <div className="flex flex-wrap gap-1">{recent.map(swatch)}</div>
        </div>
      )}

      <div>
        <p className="mb-1 text-xs text-zinc-500 dark:text-zinc-400">Custom color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Pick any color"
            value={valid ?? "#000000"}
            onChange={(e) => { setHex(e.target.value); onPreview(e.target.value); }}
            onBlur={(e) => setRecent(rememberColor(e.target.value))}
            className="h-9 w-12 cursor-pointer rounded border border-zinc-300 bg-transparent p-0.5 dark:border-zinc-700"
          />
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && valid) pick(valid); }}
            placeholder="#1a2b3c"
            maxLength={9}
            className={field}
          />
          <button type="button" disabled={!valid} onClick={() => valid && pick(valid)} className={smallBtn}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- link panel ---------- */

function normalizeUrl(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(v) || v.startsWith("/") || v.startsWith("#")) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return `https://${v}`;
}

function LinkPanel({ editor, close, href }: { editor: Editor; close: () => void; href: string }) {
  const [url, setUrl] = useState(href);

  function apply() {
    const link = normalizeUrl(url);
    if (!link) return;
    const { empty } = editor.state.selection;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: link }).run();
    } else if (empty) {
      editor.chain().focus().insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href: link } }] }).run();
    } else {
      editor.chain().focus().setLink({ href: link }).run();
    }
    close();
  }

  return (
    <div className="space-y-2">
      <p className="font-semibold">Link</p>
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
        placeholder="https://example.com"
        className={field}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!url.trim()} onClick={apply} className={smallBtn}>
          {href ? "Update link" : "Add link"}
        </button>
        {href && (
          <button
            type="button"
            onClick={() => { editor.chain().focus().extendMarkRange("link").unsetLink().run(); close(); }}
            className={`${smallBtn} text-red-600 dark:text-red-400`}
          >
            Remove link
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Select some text first, or just add the link to insert the URL as text.</p>
    </div>
  );
}

/* ---------- image panel ---------- */

function ImagePanel({ editor, close }: { editor: Editor; close: () => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      const src = await uploadImage(file);
      editor.chain().focus().setImage({ src, alt: alt.trim() || file.name }).run();
      close();
    } catch (e: any) {
      alert(e.message ?? String(e));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold">Insert image</p>
      <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Description / alt text (optional)" className={field} />
      <label className={`${smallBtn} block cursor-pointer text-center ${busy ? "opacity-50" : ""}`}>
        {busy ? "Uploading…" : "Upload from device"}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      <div className="flex gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste image URL" className={field} />
        <button
          type="button"
          disabled={!url.trim() || busy}
          onClick={() => { editor.chain().focus().setImage({ src: url.trim(), alt: alt.trim() }).run(); close(); }}
          className={smallBtn}
        >
          Insert
        </button>
      </div>
    </div>
  );
}

/* ---------- the editor ---------- */

export default function RichEditor({ initialContent, onChange, minHeight = 320, placeholder = "Start writing…" }: Props) {
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getExtensions(true, placeholder),
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: { attributes: { class: "outline-none", style: `min-height:${minHeight}px` } },
    onUpdate: ({ editor }) => onChangeRef.current?.({ json: editor.getJSON(), text: editor.getText() }),
  });

  const s = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      const text = editor.getText();
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        codeBlock: editor.isActive("codeBlock"),
        quote: editor.isActive("blockquote"),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        link: editor.isActive("link"),
        href: (editor.getAttributes("link").href as string | undefined) ?? "",
        block: editor.isActive("heading", { level: 1 }) ? "1" : editor.isActive("heading", { level: 2 }) ? "2" : editor.isActive("heading", { level: 3 }) ? "3" : "p",
        align: ((editor.getAttributes("heading").textAlign || editor.getAttributes("paragraph").textAlign || "left") as string),
        color: (editor.getAttributes("textStyle").color as string | undefined) ?? null,
        highlight: editor.isActive("highlight"),
        highlightColor: (editor.getAttributes("highlight").color as string | undefined) ?? null,
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        chars: text.length,
      };
    },
  });

  if (!editor || !s) {
    return <div className="rounded-xl border border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700" style={{ minHeight }}>Loading editor…</div>;
  }

  const c = () => editor.chain().focus();
  const textColor = normalizeHex(s.color);

  return (
    <div className="rounded-xl border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
        <Btn title="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => c().undo().run()}>↶</Btn>
        <Btn title="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => c().redo().run()}>↷</Btn>
        <Sep />

        <select
          aria-label="Text style"
          value={s.block}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "p") c().setParagraph().run();
            else c().setHeading({ level: Number(v) as 1 | 2 | 3 }).run();
          }}
          className="h-8 rounded-md border border-zinc-300 bg-transparent px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="p">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
        <Sep />

        <Btn title="Bold (Ctrl+B)" on={s.bold} onClick={() => c().toggleBold().run()}><b>B</b></Btn>
        <Btn title="Italic (Ctrl+I)" on={s.italic} onClick={() => c().toggleItalic().run()}><i className="font-serif">I</i></Btn>
        <Btn title="Underline (Ctrl+U)" on={s.underline} onClick={() => c().toggleUnderline().run()}><u>U</u></Btn>
        <Btn title="Strikethrough" on={s.strike} onClick={() => c().toggleStrike().run()}><s>S</s></Btn>

        <Popover
          title="Text color"
          trigger={
            <span className="flex flex-col items-center leading-none">
              <span className="font-bold">A</span>
              <span className="mt-0.5 h-1 w-4 rounded-sm" style={{ backgroundColor: textColor ?? "currentColor" }} />
            </span>
          }
        >
          {(close) => (
            <ColorPanel
              title="Text color"
              palette={TEXT_COLORS}
              current={s.color}
              onPick={(col) => c().setColor(col).run()}
              onPreview={(col) => editor.chain().setColor(col).run()}
              onClear={() => c().unsetColor().run()}
              clearLabel="Default color"
              close={close}
            />
          )}
        </Popover>

        <Popover
          title="Highlight color"
          active={s.highlight}
          trigger={
            <span className="flex flex-col items-center leading-none">
              <span className="text-xs font-bold">ab</span>
              <span className="mt-0.5 h-1 w-4 rounded-sm bg-yellow-300" style={s.highlightColor ? { backgroundColor: s.highlightColor } : undefined} />
            </span>
          }
        >
          {(close) => (
            <ColorPanel
              title="Highlight"
              palette={HIGHLIGHT_COLORS}
              current={s.highlightColor}
              onPick={(col) => c().setHighlight({ color: col }).run()}
              onPreview={(col) => editor.chain().setHighlight({ color: col }).run()}
              onClear={() => c().unsetHighlight().run()}
              clearLabel="Remove highlight"
              close={close}
            />
          )}
        </Popover>
        <Sep />

        <Btn title="Align left" on={s.align === "left"} onClick={() => c().setTextAlign("left").run()}>⇤</Btn>
        <Btn title="Align center" on={s.align === "center"} onClick={() => c().setTextAlign("center").run()}>↔</Btn>
        <Btn title="Align right" on={s.align === "right"} onClick={() => c().setTextAlign("right").run()}>⇥</Btn>
        <Sep />

        <Btn title="Bullet list" on={s.bullet} onClick={() => c().toggleBulletList().run()}>• List</Btn>
        <Btn title="Numbered list" on={s.ordered} onClick={() => c().toggleOrderedList().run()}>1. List</Btn>
        <Btn title="Quote" on={s.quote} onClick={() => c().toggleBlockquote().run()}>❝</Btn>
        <Sep />

        <Btn title="Inline code" on={s.code} onClick={() => c().toggleCode().run()}>{"</>"}</Btn>
        <Btn title="Code block" on={s.codeBlock} onClick={() => c().toggleCodeBlock().run()}>{"{ }"}</Btn>
        <Sep />

        <Popover title="Link" active={s.link} width="w-80" trigger="🔗">
          {(close) => <LinkPanel editor={editor} close={close} href={s.href} />}
        </Popover>
        <Popover title="Image" trigger="🖼">
          {(close) => <ImagePanel editor={editor} close={close} />}
        </Popover>
        <Btn title="Divider line" onClick={() => c().setHorizontalRule().run()}>―</Btn>
        <Btn title="Clear formatting" onClick={() => c().unsetAllMarks().clearNodes().run()}>⌫</Btn>
      </div>

      <EditorContent editor={editor} className="p-5 tiptap" />

      <div className="flex justify-between rounded-b-xl border-t border-zinc-300 px-4 py-2 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <span>{s.words} words · {s.chars} characters</span>
        <span className="hidden sm:inline">Tip: select text, then use the toolbar</span>
      </div>
    </div>
  );
}
