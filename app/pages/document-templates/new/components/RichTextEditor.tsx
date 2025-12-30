"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Undo2, Redo2 } from "lucide-react";

import { SlashCommand } from "../../extensions/slashCommand";

function Btn({
    active,
    disabled,
    onClick,
    children,
    title,
}: {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            disabled={disabled}
            className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-lg border",
                active
                    ? "border-orange-300 bg-orange-50 text-orange-600"
                    : "border-zinc-200 bg-white text-zinc-700",
                disabled ? "opacity-50" : "hover:bg-zinc-50",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = "Digite aqui…",
}: {
    value: string; // HTML
    onChange: (html: string) => void;
    placeholder?: string;
}) {
    const editor = useEditor({
        immediatelyRender: false, // SSR
        extensions: [
            StarterKit.configure({ heading: false }),
            Placeholder.configure({ placeholder }),
            SlashCommand,
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class:
                    "tiptap prose prose-sm max-w-none focus:outline-none min-h-[52px] px-3 py-2",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const next = value || "";
        const current = editor.getHTML();

        if (next !== current) {
            editor.commands.setContent(next, { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 p-2">
                <Btn
                    title="Negrito"
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={16} />
                </Btn>

                <Btn
                    title="Itálico"
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={16} />
                </Btn>

                <div className="mx-1 h-6 w-px bg-zinc-200" />

                <Btn
                    title="Lista (pontos)"
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={16} />
                </Btn>

                <Btn
                    title="Lista (numerada)"
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={16} />
                </Btn>

                <div className="mx-1 h-6 w-px bg-zinc-200" />

                <Btn
                    title="Desfazer"
                    disabled={!editor.can().chain().focus().undo().run()}
                    onClick={() => editor.chain().focus().undo().run()}
                >
                    <Undo2 size={16} />
                </Btn>

                <Btn
                    title="Refazer"
                    disabled={!editor.can().chain().focus().redo().run()}
                    onClick={() => editor.chain().focus().redo().run()}
                >
                    <Redo2 size={16} />
                </Btn>
            </div>

            <div className="p-2">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
