import type { RunnableConfig } from "@langchain/core/runnables";

import { getInvoiceTool } from "./getInvoice";
import { getMaintenanceHistoryTool } from "./getMaintenanceHistory";
import { getPendingMaintenanceTool } from "./getPendingMaintenance";
import { requestPaymentTool } from "./requestPayment";

export {
  getInvoiceTool,
  getMaintenanceHistoryTool,
  getPendingMaintenanceTool,
  requestPaymentTool,
};

/**
 * The complete set of tools the assistant may bind to the model.
 *
 * Adding a tool here is the only way to make a capability reachable by the
 * assistant, which keeps the assistant's abilities easy to audit.
 *
 * Every tool is read-only except `request_payment`, which only records a
 * pending confirmation. There is intentionally no tool that transfers money.
 */
export const ASSISTANT_TOOLS = [
  getPendingMaintenanceTool,
  getMaintenanceHistoryTool,
  getInvoiceTool,
  requestPaymentTool,
];

/**
 * The narrow view of a tool that the calling loop needs.
 *
 * LangChain infers a separate concrete type per tool from its own Zod schema,
 * so a union of the tool types has no single callable `invoke` signature. This
 * interface is the common denominator; the cast below is confined to this one
 * registry and is the only place the heterogeneity is papered over.
 */
export type ExecutableTool = {
  name: string;
  invoke(
    input: Record<string, unknown>,
    config?: RunnableConfig
  ): Promise<unknown>;
};

const TOOL_REGISTRY: Record<string, ExecutableTool> =
  Object.fromEntries(
    ASSISTANT_TOOLS.map((candidate) => [
      candidate.name,
      candidate as unknown as ExecutableTool,
    ])
  );

/** Names of every tool the assistant can call. */
export const ASSISTANT_TOOL_NAMES = ASSISTANT_TOOLS.map(
  (candidate) => candidate.name
);

/** Look up a tool by the name the model returned in its tool call. */
export function getToolByName(name: string): ExecutableTool | undefined {
  return TOOL_REGISTRY[name];
}
