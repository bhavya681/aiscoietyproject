import {
  createLibrary,
  createParser,
  defineComponent,
  generateSystemPrompt,
  type ElementNode,
} from "@openuidev/lang-core";

import {
  buildOpenUIComponents,
  OPENUI_COMPONENT_GROUPS,
} from "./catalog";

/**
 * Server-side OpenUI runtime.
 *
 * Only the schemas and generated prompt signatures are needed here; no React
 * component is imported into the API route. `component: null` is intentional:
 * lang-core stores the renderer opaquely and never inspects it.
 */
const { definitions } = buildOpenUIComponents((spec) =>
  defineComponent({
    name: spec.name,
    description: spec.description,
    props: spec.props,
    component: null,
  })
);

export const openuiLibrary = createLibrary({
  root: "Answer",
  components: definitions,
  componentGroups: OPENUI_COMPONENT_GROUPS,
});

const parser = createParser(openuiLibrary.toJSONSchema(), openuiLibrary.root);

export const OPENUI_SYSTEM_PROMPT = generateSystemPrompt({
  library: openuiLibrary.toSpec(),
  promptOptions: {
    preamble:
      "You are the response composer for SocietyAI, a residential society assistant. " +
      "Turn the answer and the real tool data into a compact, professional OpenUI Lang interface. " +
      "Reply with OpenUI Lang only: no markdown, no JSON, no code fences and no prose outside a component.",
    additionalRules: [
      "Every response must define root = Answer([...]).",
      "Put the direct answer in the first TextBlock. Support it with StatGrid, Table, KeyValueList, Callout or Card only when those add real structure.",
      "Use the real values returned by tools. Never invent amounts, dates, statuses, invoice numbers or payments.",
      "Never show raw tool JSON, internal field names or database ids. Translate them into short human labels.",
      "Format Indian rupee amounts as ₹4,000 and dates as dd MMM yyyy when possible.",
      "If the society knowledge base has no answer, the TextBlock must say exactly: The information is not available in the society knowledge base.",
      "When a payment has only been proposed, explain that the resident must confirm and that no money has moved yet. The app renders the confirm controls; never output buttons.",
      "Keep tables to at most eight rows. Summarize the rest in a TextBlock.",
      "Use Artifact when the resident asks for a receipt, invoice, notice, letter or code snippet. Put the complete real content in the artifact, not a summary.",
      "Use Approval only for approval or request states. Payment confirmations are rendered by the app as a separate confirm card, so never invent approval buttons or claim a payment is approved before the resident confirms.",
      "Use Timeline for a sequence of events such as payment progress or maintenance history.",
      "Do not use component names that are not listed below.",
    ],
    examples: [
      [
        "root = Answer([intro, stats, note])",
        'intro = TextBlock("You have **₹8,000** pending across 2 maintenance cycles.")',
        "stats = StatGrid([total, monthly])",
        'total = Stat("Total pending", "₹8,000", "2 unpaid cycles", "warning")',
        'monthly = Stat("Monthly amount", "₹4,000", "Standard tariff", "default")',
        'note = Callout("The next due date is 10 Apr 2026. Ask me to pay and I will request your confirmation first.", "Next step", "info")',
      ].join("\n"),
      [
        "root = Answer([intro, history])",
        'intro = TextBlock("Here are your last 3 maintenance records.")',
        'history = Table(["Due date", "Amount", "Status"], [["01 Mar 2026", "₹4,000", "Paid"], ["01 Feb 2026", "₹4,000", "Paid"], ["01 Jan 2026", "₹4,000", "Paid"]], "Payment history")',
      ].join("\n"),
      [
        "root = Answer([intro, invoice])",
        'intro = TextBlock("Here is your next unpaid invoice.")',
        'invoice = KeyValueList([number, amount, due], "Invoice details")',
        'number = KeyValueItem("Invoice number", "INV-2026-014")',
        'amount = KeyValueItem("Amount", "₹4,000", "warning")',
        'due = KeyValueItem("Due date", "10 Apr 2026")',
      ].join("\n"),
      [
        "root = Answer([intro, receipt])",
        'intro = TextBlock("Here is your payment receipt.")',
        'receipt = Artifact("Payment receipt", "receipt", "SOCIETYAI RESIDENCY\\nPayment receipt\\n\\nResident: Asha Rao\\nInvoice: INV-2026-014\\nAmount: ₹4,000\\nMethod: UPI\\nTransaction: TXN-884201\\nDate: 06 Apr 2026", "Receipt for the March 2026 maintenance cycle.")',
      ].join("\n"),
      [
        "root = Answer([intro, progress])",
        'intro = TextBlock("Your maintenance request is moving through approval.")',
        'progress = Timeline([raised, reviewed, resolved], "Request progress")',
        'raised = TimelineItem("Request raised", "Complaint logged by the resident.", "01 Apr 2026", "info")',
        'reviewed = TimelineItem("Under review", "The society admin is checking the request.", "02 Apr 2026", "warning")',
        'resolved = TimelineItem("Resolution pending", "No completion date has been recorded yet.", "Pending", "muted")',
      ].join("\n"),
      [
        "root = Answer([intro, approval])",
        'intro = TextBlock("This request is waiting for approval.")',
        'approval = Approval("Maintenance request", "Raised for flat B-402 by the resident.", "₹4,000", "pending", "MR-2026-018", "An admin will review it shortly.")',
      ].join("\n"),
    ],
    toolCalls: false,
    bindings: false,
    builtinFunctions: false,
    inlineMode: false,
  },
});

const STATEMENT_START = /^[A-Za-z_$][\w$]*\s*=/;
const QUOTED_TEXT = /TextBlock\(\s*("(?:[^"\\]|\\.)*")/g;

function salvageTextBlocks(source: string): string {
  const parts: string[] = [];
  let match: RegExpExecArray | null;

  QUOTED_TEXT.lastIndex = 0;

  while ((match = QUOTED_TEXT.exec(source)) !== null) {
    try {
      parts.push(JSON.parse(match[1]));
    } catch {
      // Ignore malformed fragments and keep whatever else validates.
    }
  }

  return parts.join("\n").trim();
}

/**
 * Models occasionally wrap their output in a fence or add a prose preamble.
 * Keep only assignment lines so the parser sees a clean program.
 */
export function normalizeOpenUISource(raw: string): string {
  let text = raw.trim();

  const fenced = text.match(
    /```(?:openui(?:-lang)?|text|txt)?\s*\n?([\s\S]*?)```/i
  );

  if (fenced?.[1]) {
    text = fenced[1].trim();
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && STATEMENT_START.test(line))
    .join("\n");
}

/** Builds a valid answer when the model replies with plain prose or fails. */
export function buildTextAnswerUI(text: string): string {
  const safe =
    text.trim() ||
    "I could not produce an answer right now. Please try again in a moment.";

  return [
    "root = Answer([message])",
    `message = TextBlock(${JSON.stringify(safe)})`,
  ].join("\n");
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function push(parts: string[], value: unknown) {
  const text = asText(value);

  if (text) {
    parts.push(text);
  }
}

/**
 * Extracts a readable plain-text summary from the parsed UI tree. This is what
 * gets sent back as conversation history so the model never has to read its own
 * OpenUI Lang.
 */
function extractText(node: unknown, parts: string[]): void {
  if (node == null) {
    return;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => extractText(child, parts));
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  const element = node as Partial<ElementNode> & {
    props?: Record<string, unknown>;
  };

  if (element.type !== "element") {
    return;
  }

  const props = element.props ?? {};

  switch (element.typeName) {
    case "TextBlock":
      push(parts, props.text);
      break;

    case "Callout": {
      const title = asText(props.title);
      const text = asText(props.text);

      if (title && text) {
        parts.push(`${title}: ${text}`);
      } else {
        push(parts, text || title);
      }
      break;
    }

    case "Stat":
      parts.push(
        [props.label, props.value, props.hint]
          .map(asText)
          .filter(Boolean)
          .join(" — ")
      );
      break;

    case "KeyValueItem":
      parts.push(`${asText(props.label)}: ${asText(props.value)}`);
      break;

    case "Card":
      push(parts, props.title);
      push(parts, props.description);
      extractText(props.children, parts);
      break;

    case "StatGrid":
    case "KeyValueList":
      extractText(props.items, parts);
      push(parts, props.title);
      break;

    case "Table": {
      push(parts, props.title);

      const columns = Array.isArray(props.columns) ? props.columns : [];
      const rows = Array.isArray(props.rows) ? props.rows : [];

      if (columns.length > 0) {
        parts.push(columns.map(asText).join(" | "));
      }

      rows.forEach((row) => {
        if (Array.isArray(row)) {
          parts.push(row.map(asText).join(" | "));
        }
      });
      break;
    }

    case "Artifact":
      push(parts, props.title);
      push(parts, props.description);
      push(parts, props.content);
      break;

    case "Approval":
      parts.push(
        [props.title, props.description, props.amount, props.status, props.reference, props.note]
          .map(asText)
          .filter(Boolean)
          .join(" — ")
      );
      break;

    case "TimelineItem":
      parts.push(
        [props.date, props.title, props.description]
          .map(asText)
          .filter(Boolean)
          .join(" — ")
      );
      break;

    case "Timeline":
      push(parts, props.title);
      extractText(props.items, parts);
      break;

    case "Answer":
      extractText(props.children, parts);
      break;

    default:
      extractText(props.children, parts);
      break;
  }
}

export type ParsedAssistantUI = {
  /** Valid OpenUI Lang that the client renderer can draw. */
  ui: string;
  /** Plain-text summary used for conversation history. */
  message: string;
};

/**
 * Validates the model's OpenUI Lang. When the response is not a renderable
 * program, it is wrapped in a TextBlock so the user still gets a clean answer.
 */
export function parseOpenUIAssistantAnswer(raw: string): ParsedAssistantUI {
  const normalized = normalizeOpenUISource(raw);

  if (normalized) {
    const result = parser.parse(normalized);

    if (result.root) {
      const parts: string[] = [];
      extractText(result.root, parts);

      return {
        ui: normalized,
        message:
          parts.filter(Boolean).join("\n").trim() ||
          "I have prepared the latest details from your society account.",
      };
    }

    const salvaged = salvageTextBlocks(normalized);

    if (salvaged) {
      return { ui: buildTextAnswerUI(salvaged), message: salvaged };
    }
  }

  const fallback =
    raw.trim() ||
    "I could not produce an answer right now. Please try again in a moment.";

  return {
    ui: buildTextAnswerUI(fallback),
    message: fallback,
  };
}
