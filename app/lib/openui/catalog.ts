import { z } from "zod/v4";
import type { $ZodShape, $ZodType } from "zod/v4/core";

/**
 * Shared OpenUI component catalog.
 *
 * The backend uses this to generate the OpenUI Lang system prompt and to
 * validate model output. The frontend uses the exact same schemas to build the
 * React renderer, so the model can only compose components the UI can draw.
 */

export const toneSchema = z.enum([
  "default",
  "info",
  "success",
  "warning",
  "danger",
  "muted",
]);

export const artifactKindSchema = z.enum([
  "document",
  "receipt",
  "invoice",
  "notice",
  "code",
]);

export const approvalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "info",
]);

export type OpenUITone = z.infer<typeof toneSchema>;
export type ArtifactKind = z.infer<typeof artifactKindSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;

type ComponentRef = { ref: $ZodType };

export type ComponentSpec = {
  name: string;
  description: string;
  props: (refs: Record<string, ComponentRef>) => z.ZodObject<$ZodShape>;
};

const toneDescription =
  "Visual tone: default, info, success, warning, danger or muted.";

export const OPENUI_COMPONENTS: ComponentSpec[] = [
  {
    name: "TextBlock",
    description:
      "A paragraph of conversational text. Use it for the main answer, explanations and policy details. Supports **bold** and `code` inline formatting.",
    props: () =>
      z.object({
        text: z.string().describe("The text to display. Keep it concise."),
        tone: toneSchema.optional().describe(toneDescription),
      }),
  },
  {
    name: "Callout",
    description:
      "A highlighted notice for next steps, warnings, confirmations or important policy notes.",
    props: () =>
      z.object({
        text: z.string().describe("The notice body."),
        title: z.string().optional().describe("Optional short heading."),
        tone: toneSchema.optional().describe(toneDescription),
      }),
  },
  {
    name: "Stat",
    description:
      "A single metric tile. Only use inside StatGrid, never as the response root.",
    props: () =>
      z.object({
        label: z.string().describe("Metric label, for example Total pending."),
        value: z.string().describe("Formatted metric value, for example ₹8,000."),
        hint: z.string().optional().describe("Optional secondary detail."),
        tone: toneSchema.optional().describe(toneDescription),
      }),
  },
  {
    name: "StatGrid",
    description:
      "A responsive grid of one to four metric tiles for balances, amounts and totals.",
    props: (refs) =>
      z.object({
        items: z.array(refs.Stat.ref).describe("Metric tiles."),
      }),
  },
  {
    name: "KeyValueItem",
    description:
      "One label and value row. Only use inside KeyValueList, never as the response root.",
    props: () =>
      z.object({
        label: z.string().describe("Field label."),
        value: z.string().describe("Field value."),
        tone: toneSchema.optional().describe(toneDescription),
      }),
  },
  {
    name: "KeyValueList",
    description:
      "A compact definition list for invoice details, profile fields or payment information.",
    props: (refs) =>
      z.object({
        items: z.array(refs.KeyValueItem.ref).describe("Label and value rows."),
        title: z.string().optional().describe("Optional card title."),
      }),
  },
  {
    name: "Table",
    description:
      "A responsive data table for payment history and maintenance records. Use at most eight rows and keep cells short.",
    props: () =>
      z.object({
        columns: z.array(z.string()).describe("Column headings."),
        rows: z
          .array(z.array(z.string()))
          .describe("Row cells, in the same order as the columns."),
        title: z.string().optional().describe("Optional table title."),
      }),
  },
  {
    name: "Artifact",
    description:
      "A ChatGPT-style artifact panel for a generated document, receipt, invoice, notice or code snippet. Use it when the resident asks to see, create or save a document. The content is copyable and downloadable.",
    props: () =>
      z.object({
        title: z.string().describe("Artifact title."),
        kind: artifactKindSchema
          .optional()
          .describe(
            "Artifact type: document, receipt, invoice, notice or code."
          ),
        content: z
          .string()
          .describe("The full artifact text. Use real data, never placeholders."),
        description: z
          .string()
          .optional()
          .describe("Optional one-line description."),
        language: z
          .string()
          .optional()
          .describe("Optional code language when kind is code."),
      }),
  },
  {
    name: "Approval",
    description:
      "A status card for an approval, request or authorisation decision. Use it to show a pending, approved or rejected state with a reference and amount.",
    props: () =>
      z.object({
        title: z.string().describe("What is being approved."),
        description: z.string().describe("Short explanation of the request."),
        amount: z
          .string()
          .optional()
          .describe("Optional formatted amount, for example ₹4,000."),
        status: approvalStatusSchema
          .optional()
          .describe("Approval state. Defaults to pending."),
        reference: z
          .string()
          .optional()
          .describe("Optional reference number or record id."),
        note: z
          .string()
          .optional()
          .describe("Optional note shown under the approval."),
      }),
  },
  {
    name: "TimelineItem",
    description:
      "One event in a Timeline. Only use inside Timeline, never as the response root.",
    props: () =>
      z.object({
        title: z.string().describe("Event title."),
        description: z.string().optional().describe("Optional event detail."),
        date: z.string().optional().describe("Optional date label."),
        tone: toneSchema.optional().describe(toneDescription),
      }),
  },
  {
    name: "Timeline",
    description:
      "A vertical timeline for a sequence of events such as maintenance history, payment progress or request tracking.",
    props: (refs) =>
      z.object({
        items: z.array(refs.TimelineItem.ref).describe("Timeline events."),
        title: z.string().optional().describe("Optional timeline title."),
      }),
  },
  {
    name: "Card",
    description:
      "A bordered section that groups related blocks under an optional title. Prefer plain Answer children unless grouping helps.",
    props: (refs) =>
      z.object({
        children: z
          .array(
            z.union([
              refs.TextBlock.ref,
              refs.Callout.ref,
              refs.StatGrid.ref,
              refs.KeyValueList.ref,
              refs.Table.ref,
              refs.Artifact.ref,
              refs.Approval.ref,
              refs.Timeline.ref,
            ])
          )
          .describe("Content blocks inside the card."),
        title: z.string().optional().describe("Optional section title."),
        description: z
          .string()
          .optional()
          .describe("Optional one-line subtitle."),
      }),
  },
  {
    name: "Answer",
    description:
      "The root container for every reply. Holds the conversational answer and any supporting cards, metrics or tables.",
    props: (refs) =>
      z.object({
        children: z
          .array(
            z.union([
              refs.TextBlock.ref,
              refs.Callout.ref,
              refs.StatGrid.ref,
              refs.KeyValueList.ref,
              refs.Table.ref,
              refs.Artifact.ref,
              refs.Approval.ref,
              refs.Timeline.ref,
              refs.Card.ref,
            ])
          )
          .describe("The response blocks, in display order."),
      }),
  },
];

export const OPENUI_COMPONENT_GROUPS = [
  {
    name: "Text & feedback",
    components: ["TextBlock", "Callout"],
    notes: [
      "Always start every response with one TextBlock that gives the direct answer.",
      "Use Callout for a next step, warning or confirmation notice.",
    ],
  },
  {
    name: "Data",
    components: ["StatGrid", "Stat", "KeyValueList", "KeyValueItem", "Table"],
    notes: [
      "Use StatGrid only for one to four headline numbers.",
      "Only use Stat inside StatGrid and KeyValueItem inside KeyValueList.",
      "Keep tables to at most eight rows and summarize the rest in a TextBlock.",
    ],
  },
  {
    name: "Rich content",
    components: ["Artifact", "Approval", "Timeline", "TimelineItem"],
    notes: [
      "Use Artifact only when the resident asks for a document, receipt, invoice, notice or code snippet. Put the complete text in content.",
      "Use Approval to show an approval or request state. For payment confirmations, the app renders its own confirm controls, so do not output Approval to execute a payment.",
      "Only use TimelineItem inside Timeline. Keep timelines to at most six events.",
    ],
  },
  {
    name: "Layout",
    components: ["Answer", "Card"],
    notes: [
      "Every program must define root = Answer([...]).",
      "Use Card only when grouping several related blocks makes the answer easier to scan.",
    ],
  },
];

/**
 * Builds component definitions in dependency order. The callback decides which
 * runtime is used: React components on the client, opaque definitions on the
 * server (the server only needs the schemas and prompt signatures).
 */
export function buildOpenUIComponents<T extends ComponentRef>(
  define: (spec: {
    name: string;
    description: string;
    props: z.ZodObject<$ZodShape>;
  }) => T
): { definitions: T[]; refs: Record<string, T> } {
  const refs: Record<string, T> = {};
  const definitions: T[] = [];

  for (const spec of OPENUI_COMPONENTS) {
    const definition = define({
      name: spec.name,
      description: spec.description,
      props: spec.props(refs),
    });

    refs[spec.name] = definition;
    definitions.push(definition);
  }

  return { definitions, refs };
}
