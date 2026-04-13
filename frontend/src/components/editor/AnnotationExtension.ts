import { Mark, mergeAttributes } from "@tiptap/core";

export const AnnotationMark = Mark.create({
  name: "annotation",

  addAttributes() {
    return {
      annotation_id: { default: null },
      media_type: { default: "text" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-annotation-id]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-annotation-id": HTMLAttributes.annotation_id,
        class: `annotated-term media-type-${HTMLAttributes.media_type}`,
        style: "cursor:pointer;",
      }),
      0,
    ];
  },
});
