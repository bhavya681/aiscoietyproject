"use client";

import { useState } from "react";
import {
  createLibrary,
  defineComponent,
  type ComponentRenderer,
  type ComponentRenderProps,
} from "@openuidev/react-lang";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Copy,
  Check,
  Download,
  FileText,
  Info,
  Receipt,
  ScrollText,
  ShieldCheck,
  ShieldX,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import RichText from "@/app/components/ai/RichText";
import {
  buildOpenUIComponents,
  type ApprovalStatus,
  type ArtifactKind,
  type OpenUITone,
} from "./catalog";

type ViewProps = ComponentRenderProps<Record<string, unknown>>;

const TONE_TEXT: Record<OpenUITone, string> = {
  default: "text-foreground",
  info: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
  muted: "text-muted-foreground",
};

const TONE_DOT: Record<OpenUITone, string> = {
  default: "bg-foreground/40",
  info: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  muted: "bg-muted-foreground/40",
};

const CALLOUT_TONE: Record<
  OpenUITone,
  { wrapper: string; icon: LucideIcon }
> = {
  default: {
    wrapper: "border-border/80 bg-muted/30",
    icon: Info,
  },
  info: {
    wrapper: "border-primary/25 bg-primary/5",
    icon: Info,
  },
  success: {
    wrapper: "border-emerald-500/25 bg-emerald-500/5",
    icon: CheckCircle2,
  },
  warning: {
    wrapper: "border-amber-500/30 bg-amber-500/5",
    icon: AlertTriangle,
  },
  danger: {
    wrapper: "border-destructive/25 bg-destructive/5",
    icon: XCircle,
  },
  muted: {
    wrapper: "border-border/70 bg-muted/20",
    icon: Info,
  },
};

const ARTIFACT_KINDS: Record<
  ArtifactKind,
  { label: string; icon: LucideIcon }
> = {
  document: { label: "Document", icon: FileText },
  receipt: { label: "Receipt", icon: Receipt },
  invoice: { label: "Invoice", icon: Receipt },
  notice: { label: "Notice", icon: ScrollText },
  code: { label: "Code", icon: Code2 },
};

const APPROVAL_STATUS: Record<
  ApprovalStatus,
  { label: string; tone: OpenUITone; icon: LucideIcon; wrapper: string }
> = {
  pending: {
    label: "Pending",
    tone: "warning",
    icon: Clock3,
    wrapper: "border-amber-500/30 bg-amber-500/[0.07]",
  },
  approved: {
    label: "Approved",
    tone: "success",
    icon: ShieldCheck,
    wrapper: "border-emerald-500/25 bg-emerald-500/[0.06]",
  },
  rejected: {
    label: "Rejected",
    tone: "danger",
    icon: ShieldX,
    wrapper: "border-destructive/25 bg-destructive/[0.06]",
  },
  info: {
    label: "For review",
    tone: "info",
    icon: Info,
    wrapper: "border-primary/25 bg-primary/[0.05]",
  },
};

const STATUS_TONE: Array<{ match: RegExp; tone: OpenUITone }> = [
  { match: /paid|clear|settled|success|active/i, tone: "success" },
  { match: /overdue|failed|rejected|error/i, tone: "danger" },
  { match: /pending|due|unpaid|warning/i, tone: "warning" },
  { match: /info|note/i, tone: "info" },
];

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asTone(value: unknown): OpenUITone {
  return typeof value === "string" && value in TONE_TEXT
    ? (value as OpenUITone)
    : "default";
}

function asArtifactKind(value: unknown): ArtifactKind {
  return typeof value === "string" && value in ARTIFACT_KINDS
    ? (value as ArtifactKind)
    : "document";
}

function asApprovalStatus(value: unknown): ApprovalStatus {
  return typeof value === "string" && value in APPROVAL_STATUS
    ? (value as ApprovalStatus)
    : "pending";
}

function valueTone(value: string, explicit?: OpenUITone): OpenUITone {
  if (explicit) {
    return explicit;
  }

  return STATUS_TONE.find(({ match }) => match.test(value))?.tone ?? "default";
}

function StatusValue({
  value,
  tone,
}: {
  value: string;
  tone?: OpenUITone;
}) {
  return <span className={TONE_TEXT[valueTone(value, tone)]}>{value}</span>;
}

function TextBlockView({ props }: ViewProps) {
  return (
    <RichText
      text={asString(props.text)}
      className={TONE_TEXT[asTone(props.tone)]}
    />
  );
}

function CalloutView({ props }: ViewProps) {
  const tone = asTone(props.tone);
  const config = CALLOUT_TONE[tone];
  const Icon = config.icon;
  const title = asString(props.title);

  return (
    <div className={`rounded-xl border p-3.5 sm:p-4 ${config.wrapper}`}>
      <div className="flex gap-2.5">
        <Icon
          className={`mt-0.5 h-4 w-4 shrink-0 ${TONE_TEXT[tone]}`}
          aria-hidden
        />

        <div className="min-w-0 space-y-0.5">
          {title && (
            <p className={`text-xs font-semibold ${TONE_TEXT[tone]}`}>
              {title}
            </p>
          )}
          <p className="text-[13px] leading-relaxed text-foreground/90">
            {asString(props.text)}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatView({ props }: ViewProps) {
  const hint = asString(props.hint);

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5">
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {asString(props.label)}
      </p>
      <p
        className={`mt-1 text-lg font-bold tracking-tight sm:text-xl ${
          TONE_TEXT[asTone(props.tone)]
        }`}
      >
        {asString(props.value)}
      </p>
      {hint && (
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function StatGridView({ props, renderNode }: ViewProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 lg:grid-cols-4">
      {renderNode(props.items)}
    </div>
  );
}

function KeyValueItemView({ props }: ViewProps) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">
        {asString(props.label)}
      </span>
      <span className="text-right text-xs font-semibold text-foreground">
        <StatusValue
          value={asString(props.value)}
          tone={
            typeof props.tone === "string"
              ? asTone(props.tone)
              : undefined
          }
        />
      </span>
    </div>
  );
}

function KeyValueListView({ props, renderNode }: ViewProps) {
  const title = asString(props.title);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      {title && (
        <div className="border-b border-border/60 px-4 py-2.5">
          <p className="text-xs font-semibold text-foreground">{title}</p>
        </div>
      )}
      <div className="divide-y divide-border/60">{renderNode(props.items)}</div>
    </div>
  );
}

function TableView({ props }: ViewProps) {
  const columns = Array.isArray(props.columns)
    ? props.columns.map((column) => asString(column))
    : [];
  const rows = Array.isArray(props.rows)
    ? props.rows.map((row) =>
        Array.isArray(row) ? row.map((cell) => asString(cell)) : []
      )
    : [];
  const title = asString(props.title);

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      {title && (
        <div className="border-b border-border/60 px-4 py-2.5">
          <p className="text-xs font-semibold text-foreground">{title}</p>
        </div>
      )}

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className="whitespace-nowrap px-4 py-2.5 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className="transition-colors hover:bg-muted/20"
              >
                {columns.map((_, columnIndex) => {
                  const value = row[columnIndex] || "—";

                  return (
                    <td
                      key={`cell-${rowIndex}-${columnIndex}`}
                      className="whitespace-nowrap px-4 py-2.5 text-foreground/90"
                    >
                      <StatusValue value={value} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-border/60 sm:hidden">
        {rows.map((row, rowIndex) => (
          <div
            key={`mobile-row-${rowIndex}`}
            className="space-y-1.5 px-3.5 py-3"
          >
            {columns.map((column, columnIndex) => (
              <div
                key={`mobile-cell-${rowIndex}-${columnIndex}`}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <span className="text-muted-foreground">{column}</span>
                <span className="text-right font-medium text-foreground">
                  <StatusValue value={row[columnIndex] || "—"} />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArtifactView({ props }: ViewProps) {
  const kind = asArtifactKind(props.kind);
  const config = ARTIFACT_KINDS[kind];
  const Icon = config.icon;
  const title = asString(props.title) || config.label;
  const description = asString(props.description);
  const content = asString(props.content);
  const language = asString(props.language);

  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  async function copyArtifact() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied; the artifact stays readable.
    }
  }

  function downloadArtifact() {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${title.replace(/[^\w.-]+/g, "-").toLowerCase()}.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/30 px-3 py-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-xs font-semibold text-foreground">
              {title}
            </p>
            <span className="shrink-0 rounded border border-border/70 bg-background/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
              {config.label}
            </span>
          </div>
          {description && (
            <p className="truncate text-[10px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={copyArtifact}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Copy artifact"
            aria-label="Copy artifact"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={downloadArtifact}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Download artifact"
            aria-label="Download artifact"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setOpen((previous) => !previous)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-expanded={open}
            aria-label={open ? "Collapse artifact" : "Expand artifact"}
          >
            {open ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-80 overflow-auto bg-background/40 p-3.5">
          {language && kind === "code" && (
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {language}
            </p>
          )}
          <pre
            className={`whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-foreground/90 ${
              kind === "code" ? "overflow-x-auto whitespace-pre" : ""
            }`}
          >
            {content}
          </pre>
        </div>
      )}
    </section>
  );
}

function ApprovalView({ props }: ViewProps) {
  const status = asApprovalStatus(props.status);
  const config = APPROVAL_STATUS[status];
  const Icon = config.icon;
  const amount = asString(props.amount);
  const reference = asString(props.reference);
  const note = asString(props.note);

  return (
    <section className={`rounded-xl border p-3.5 sm:p-4 ${config.wrapper}`}>
      <div className="flex items-start gap-2.5">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${TONE_TEXT[config.tone]}`} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">
              {asString(props.title)}
            </p>
            <span
              className={`rounded-full border border-current/20 bg-background/50 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide ${TONE_TEXT[config.tone]}`}
            >
              {config.label}
            </span>
          </div>

          <p className="mt-1 text-[13px] leading-relaxed text-foreground/80">
            {asString(props.description)}
          </p>

          {(amount || reference) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
              {amount && (
                <p className={`text-lg font-bold tracking-tight ${TONE_TEXT[config.tone]}`}>
                  {amount}
                </p>
              )}
              {reference && (
                <p className="font-mono text-[10px] text-muted-foreground">
                  Ref {reference}
                </p>
              )}
            </div>
          )}

          {note && (
            <p className="mt-2 border-t border-current/10 pt-2 text-[11px] leading-relaxed text-muted-foreground">
              {note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function TimelineView({ props, renderNode }: ViewProps) {
  const title = asString(props.title);

  return (
    <section className="rounded-xl border border-border/70 bg-card p-4">
      {title && (
        <h3 className="text-xs font-semibold text-foreground">{title}</h3>
      )}
      <div className={title ? "mt-3" : ""}>{renderNode(props.items)}</div>
    </section>
  );
}

function TimelineItemView({ props }: ViewProps) {
  const tone = asTone(props.tone);
  const date = asString(props.date);
  const description = asString(props.description);

  return (
    <div className="relative border-l border-border/70 pb-4 pl-5 last:border-transparent last:pb-0">
      <span
        className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card ${TONE_DOT[tone]}`}
      />
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-foreground">
          {asString(props.title)}
        </p>
        {date && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {date}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}

function CardView({ props, renderNode }: ViewProps) {
  const title = asString(props.title);
  const description = asString(props.description);

  return (
    <section className="rounded-xl border border-border/70 bg-card/80 p-4">
      {(title || description) && (
        <div className="mb-2.5">
          {title && (
            <h3 className="text-xs font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2.5">{renderNode(props.children)}</div>
    </section>
  );
}

function AnswerView({ props, renderNode }: ViewProps) {
  return <div className="space-y-3">{renderNode(props.children)}</div>;
}

const renderers: Record<
  string,
  ComponentRenderer<Record<string, unknown>>
> = {
  TextBlock: TextBlockView,
  Callout: CalloutView,
  Stat: StatView,
  StatGrid: StatGridView,
  KeyValueItem: KeyValueItemView,
  KeyValueList: KeyValueListView,
  Table: TableView,
  Artifact: ArtifactView,
  Approval: ApprovalView,
  Timeline: TimelineView,
  TimelineItem: TimelineItemView,
  Card: CardView,
  Answer: AnswerView,
};

const { definitions } = buildOpenUIComponents((spec) =>
  defineComponent({
    name: spec.name,
    description: spec.description,
    props: spec.props,
    component: renderers[spec.name]!,
  })
);

export const openuiLibrary = createLibrary({
  root: "Answer",
  components: definitions,
});
