import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ToolMessage } from "@langchain/core/messages";

import { getPendingMaintenanceTool } from "./tools/getPendingMaintenance";
import { retrieveSocietyKnowledge } from "./rag";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash",
  temperature: 0.2,
});

const modelWithTools = model.bindTools([
  getPendingMaintenanceTool,
]);

export async function askMaintenanceAssistant(
  question: string,
  userId: string
) {
  /*
   * --------------------------------
   * 1. RETRIEVE SOCIETY KNOWLEDGE
   * --------------------------------
   */

  const retrievedKnowledge =
    await retrieveSocietyKnowledge(question);

  const context = retrievedKnowledge
    .map((item) => item.content)
    .join("\n\n");

  /*
   * --------------------------------
   * 2. BUILD SYSTEM PROMPT
   * --------------------------------
   */

  const messages: any[] = [
    [
      "system",
      `You are a society maintenance assistant.

The authenticated user's ID is ${userId}.

You have access to society knowledge and tools.

Use the society knowledge to answer general questions about:
- maintenance policies
- payment rules
- society timings
- facilities
- society rules

Use tools when the user asks about their personal account data.

Never invent personal maintenance information.

If the required information is not available, say:
"The information is not available."

Society knowledge:

${context}`,
    ],

    ["human", question],
  ];

  /*
   * --------------------------------
   * 3. ASK LLM
   * --------------------------------
   */

  const response =
    await modelWithTools.invoke(messages);

  /*
   * --------------------------------
   * 4. NO TOOL REQUIRED
   * --------------------------------
   */

  if (!response.tool_calls?.length) {
    return response.content;
  }

  /*
   * --------------------------------
   * 5. EXECUTE TOOLS
   * --------------------------------
   */

  messages.push(response);

  for (const toolCall of response.tool_calls) {
    if (
      toolCall.name ===
      "get_pending_maintenance"
    ) {
      const toolResult =
        await getPendingMaintenanceTool.invoke({
          userId,
        });

      messages.push(
        new ToolMessage({
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id!,
        })
      );
    }
  }

  /*
   * --------------------------------
   * 6. FINAL LLM RESPONSE
   * --------------------------------
   */

  const finalResponse =
    await modelWithTools.invoke(messages);

  return finalResponse.content;
}