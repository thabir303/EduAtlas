import type { BodyNode, InlineNode, MarkType } from "./types";

type TiptapMark = {
  type?: string;
  attrs?: {
    annotation_id?: string;
  };
};

type TiptapTextNode = {
  type?: string;
  text?: string;
  marks?: TiptapMark[];
};

type TiptapParagraphNode = {
  type?: string;
  content?: TiptapTextNode[];
};

type TiptapDoc = {
  content?: TiptapParagraphNode[];
};

export function tiptapToBodyNodes(tiptapDoc: unknown): BodyNode[] {
  const doc: TiptapDoc = typeof tiptapDoc === "object" && tiptapDoc !== null ? (tiptapDoc as TiptapDoc) : {};
  const nodes: BodyNode[] = [];

  for (const node of doc.content || []) {
    if (node.type !== "paragraph") {
      continue;
    }

    const inlineNodes: InlineNode[] = [];

    for (const child of node.content || []) {
      if (child.type !== "text") {
        continue;
      }
      const text = typeof child.text === "string" ? child.text : "";
      if (!text) {
        continue;
      }

      const marks: string[] = (child.marks || [])
        .map((mark) => mark.type)
        .filter((mark): mark is string => typeof mark === "string");

      const annotationMark = (child.marks || []).find((mark) => mark.type === "annotation");
      const annotationId = annotationMark?.attrs?.annotation_id;

      if (annotationId) {
        inlineNodes.push({
          type: "annotated",
          text,
          annotation_id: annotationId,
        });
      } else {
        const validMarks = marks.filter(
          (m): m is MarkType => ["bold", "italic", "underline", "highlight"].includes(m),
        );

        inlineNodes.push({
          type: "text",
          text,
          marks: validMarks.length > 0 ? validMarks : undefined,
        });
      }
    }

    nodes.push({ type: "paragraph", content: inlineNodes });
  }

  return nodes;
}

export function bodyNodesToTiptap(bodyNodes: BodyNode[]): Record<string, unknown> {
  return {
    type: "doc",
    content: bodyNodes.map((node) => ({
      type: "paragraph",
      content: node.content.map((inline) => {
        if (inline.type === "annotated") {
          return {
            type: "text",
            text: inline.text,
            marks: [{ type: "annotation", attrs: { annotation_id: inline.annotation_id } }],
          };
        }

        return {
          type: "text",
          text: inline.text,
          marks: (inline.marks || []).map((m) => ({ type: m })),
        };
      }),
    })),
  };
}
