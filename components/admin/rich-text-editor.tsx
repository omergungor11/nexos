"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Link as LinkIcon,
  Unlink,
  Minus,
  Smile,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Native emoji picker helper — there's no web API to open the OS picker, so
// we focus the editor and show a toast with the platform shortcut.
// ---------------------------------------------------------------------------
function openNativeEmojiPickerHint() {
  if (typeof navigator === "undefined") return;
  const platform = (navigator.platform || "").toLowerCase();
  const ua = (navigator.userAgent || "").toLowerCase();
  const isMac = platform.includes("mac") || ua.includes("mac");
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = ua.includes("android");
  const shortcut = isMac
    ? "⌘ + ⌃ + Boşluk (veya fn tuşu)"
    : isIOS || isAndroid
    ? "Klavyedeki 😊 simgesine dokunun"
    : "Win + . (nokta)";
  toast.message("Emoji klavyesini aç", {
    description: shortcut,
    duration: 4000,
  });
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={[
        "inline-flex size-8 items-center justify-center rounded-md text-sm transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:opacity-40 disabled:pointer-events-none",
        active ? "bg-primary/10 text-primary" : "text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <div className="mx-1 h-6 w-px bg-border" />;
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ editor }: { editor: Editor }) {
  const handleLinkToggle = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link URL", prev ?? "https://");
    if (input === null) return; // cancelled
    if (input === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: input }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 p-1">
      <ToolbarButton
        title="Kalın (Ctrl+B)"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="İtalik (Ctrl+I)"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Üstü Çizili"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
      >
        <Strikethrough className="size-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        title="Başlık 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Başlık 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="size-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        title="Madde İşaretli Liste"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Numaralı Liste"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Alıntı"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Yatay Çizgi"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="size-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        title={editor.isActive("link") ? "Linki Değiştir" : "Link Ekle"}
        onClick={handleLinkToggle}
        active={editor.isActive("link")}
      >
        <LinkIcon className="size-4" />
      </ToolbarButton>
      {editor.isActive("link") && (
        <ToolbarButton
          title="Linki Kaldır"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className="size-4" />
        </ToolbarButton>
      )}

      <Separator />

      <ToolbarButton
        title="Geri Al (Ctrl+Z)"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="size-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Yinele (Ctrl+Y)"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="size-4" />
      </ToolbarButton>

      <Separator />

      <ToolbarButton
        title="Emoji klavyesini aç (sistem)"
        onClick={() => {
          editor.chain().focus().run();
          openNativeEmojiPickerHint();
        }}
      >
        <Smile className="size-4" />
      </ToolbarButton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------

/**
 * Normalises a saved description into HTML the editor can understand.
 * Older records were stored as plain text with `\n` separators; feeding
 * that directly to TipTap collapses every line into a single paragraph.
 * When the incoming value has no HTML tags, split on blank lines (or
 * single newlines as a fallback) and wrap each chunk in `<p>`.
 */
function normalizeInitialContent(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/<[a-z]/i.test(trimmed)) return trimmed; // already HTML

  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const parts = trimmed.split(/\n{2,}/);
  if (parts.length === 1) {
    // Single paragraph with inline `\n` → convert to <br/>.
    return `<p>${escape(parts[0]).replace(/\n/g, "<br/>")}</p>`;
  }
  return parts
    .map(
      (p) => `<p>${escape(p).replace(/\n/g, "<br/>")}</p>`,
    )
    .join("");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Yazınız...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    // Required in React 19 / Next 16 strict mode to avoid hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
          class: "text-primary underline",
        },
      }),
    ],
    content: normalizeInitialContent(value || ""),
    editorProps: {
      attributes: {
        class: "rte-content min-h-[160px] p-3 text-sm focus:outline-none",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // TipTap returns "<p></p>" for empty content — normalize to "".
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external changes (e.g. reset on form reload) without remounting.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = normalizeInitialContent(value || "");
    const normalizedCurrent = current === "<p></p>" ? "" : current;
    if (normalizedCurrent !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded-md border bg-muted/20" />
    );
  }

  return (
    <div className={["overflow-hidden rounded-md border bg-background", className ?? ""].join(" ")}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
