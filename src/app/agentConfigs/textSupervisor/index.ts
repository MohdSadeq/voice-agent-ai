import { textAgents } from './agents';
import { runAgentWithTools } from './runner';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

// Schema for supervisor decision (for Responses.parse text_format)
const supervisorSchema = {
  name: 'supervisor_decision',
  schema: {
    type: 'object',
    properties: {
      target_agent: { type: 'string', enum: textAgents.map(a => a.name) },
      reason: { type: 'string' },
      handoff_to: { type: 'string', enum: textAgents.map(a => a.name), nullable: true },
    },
    required: ['target_agent'],
    additionalProperties: false,
  },
  strict: true,
} as const;

function agentByName(name?: string) {
  if (!name) return textAgents[0];
  return textAgents.find(a => a.name === name) ?? textAgents[0];
}

export async function routeAndRespond(params: {
  model?: string;
  messages: ChatMessage[];
}) {
  const model = params.model ?? 'gpt-4o-mini';
  const messages = params.messages;

  // 1) Ask supervisor for routing decision
  const supRes = await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      input: [
        {
          role: 'system',
          content:
            `You are a supervisor that routes user requests to the best agent. Available agents:\n${textAgents
              .map(a => `- ${a.name}: ${a.description}`)
              .join('\n')}\nPick target_agent from the list. Optionally set handoff_to if a second specialist should continue after the first response. Keep handoffs minimal.`,
        },
        ...messages,
      ],
      text: {
        format: supervisorSchema as any,
      },
      parallel_tool_calls: false,
    }),
  });

  if (!supRes.ok) throw new Error('Supervisor routing failed');
  const sup = await supRes.json();
  const supObj = (sup.output_parsed as unknown as { target_agent?: string; handoff_to?: string | null; reason?: string }) || {};

  const firstAgent = agentByName(supObj.target_agent);

  // 2) Run first agent using shared agentConfigs tool flow
  const firstText = (await runAgentWithTools({
    model,
    system: firstAgent.system,
    messages,
  })) as string;

  let finalAgent = firstAgent.name;
  let finalText = firstText;

  // 3) Optional single handoff
  if (supObj?.handoff_to && supObj.handoff_to !== firstAgent.name) {
    const secondAgent = agentByName(supObj.handoff_to);
    const secondText = (await runAgentWithTools({
      model,
      system: secondAgent.system,
      messages,
    })) as string;

    finalText = `${firstText}\n\n[Handoff -> ${secondAgent.name}]\n${secondText}`;
    finalAgent = secondAgent.name;
  }

  return { agent: finalAgent, text: finalText, supervisor: supObj };
}
