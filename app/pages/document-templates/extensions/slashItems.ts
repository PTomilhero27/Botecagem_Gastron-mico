"use client";

import type { Editor } from "@tiptap/react";
import type { Range } from "@tiptap/core";

export type SlashItem = {
    id: string;
    title: string;
    description?: string;
    keywords?: string[];
    run: (ctx: { editor: Editor; range: Range }) => void;
};

export const slashItems: SlashItem[] = [
    {
        id: "date",
        title: "Data",
        description: "Insere a data de hoje",
        keywords: ["hoje", "date", "data"],
        run: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent("{{DATA_LONGA}}")
                .run();
        },
    },
];
