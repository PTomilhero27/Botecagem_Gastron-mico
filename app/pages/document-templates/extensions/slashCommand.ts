"use client";

import { Extension } from "@tiptap/core";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import "tippy.js/dist/tippy.css";

import { slashItems, type SlashItem } from "./slashItems";
import { SlashMenu, type SlashMenuRef } from "./SlashMenu";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    const editor = this.editor;

    const plugin = Suggestion<SlashItem>({
      editor,
      char: "/",
      startOfLine: false,
      allowSpaces: false,

      items: ({ query }) => {
        const q = (query || "").toLowerCase().trim();
        return slashItems
          .filter((it) => {
            if (!q) return true;
            const hay = [it.title, it.description ?? "", ...(it.keywords ?? [])]
              .join(" ")
              .toLowerCase();
            return hay.includes(q);
          })
          .slice(0, 8);
      },

      command: ({ editor, range, props }) => {
        props.run({ editor, range });
      },

      render: () => {
        let component: ReactRenderer<SlashMenuRef> | null = null;
        let popup: TippyInstance | null = null;

        return {
          onStart: (props) => {
            component = new ReactRenderer(SlashMenu, {
              editor: props.editor,
              props: {
                items: props.items,
                editor: props.editor,
                range: props.range,
                command: (item: SlashItem) => props.command(item),
              },
            });

            popup = tippy("body", {
              getReferenceClientRect: props.clientRect as any,
              appendTo: () => document.body,
              content: (component as any).element,
              showOnCreate: true,
              interactive: true,
              trigger: "manual",
              placement: "bottom-start",
            })[0] as any;
          },

          onUpdate: (props) => {
            component?.updateProps({
              items: props.items,
              editor: props.editor,
              range: props.range,
              command: (item: SlashItem) => props.command(item),
            });

            popup?.setProps({
              getReferenceClientRect: props.clientRect as any,
            });
          },

          onKeyDown: (props) => {
            const handled = component?.ref?.onKeyDown(props.event) ?? false;
            if (props.event.key === "Escape") {
              popup?.hide();
              return true;
            }
            return handled;
          },

          onExit: () => {
            popup?.destroy();
            component?.destroy();
            popup = null;
            component = null;
          },
        };
      },
    } as SuggestionOptions<SlashItem>);

    return [plugin];
  },
});
