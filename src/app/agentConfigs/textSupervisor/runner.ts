import { supervisorAgentTools, supervisorAgentInstructions } from '@/app/agentConfigs/chatSupervisor/supervisorAgent';

async function fetchResponsesMessage(body: any) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });
  if (!response.ok) {
    console.warn('responses proxy error', response);
    return { error: 'failed' } as any;
  }
  return await response.json();
}

async function handleToolCalls(body: any, response: any) {
  let currentResponse = response;
  while (true) {
    if (currentResponse?.error) return { error: 'Something went wrong.' } as any;

    const outputItems: any[] = currentResponse.output ?? [];
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      const assistantMessages = outputItems.filter((item) => item.type === 'message');
      const finalText = assistantMessages
        .map((msg: any) => {
          const contentArr = msg.content ?? [];
          return contentArr
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('');
        })
        .join('\n');
      return finalText;
    }

    for (const toolCall of functionCalls) {
      body.input.push(
        {
          type: 'function_call',
          call_id: toolCall.call_id,
          name: toolCall.name,
          arguments: toolCall.arguments,
        },
        {
          type: 'function_call_output',
          call_id: toolCall.call_id,
          // NOTE: For the text UI we don't execute real tools server-side here.
          // We simply echo back a placeholder saying the tool was consulted.
          output: JSON.stringify({ ok: true }),
        },
      );
    }

    currentResponse = await fetchResponsesMessage(body);
  }
}

export async function runAgentWithTools(params: {
  model: string;
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const { model, messages } = params;
  const system = params.system ?? supervisorAgentInstructions;

  const body: any = {
    model,
    input: [
      { type: 'message', role: 'system', content: system },
      ...messages.map((m) => ({ type: 'message', role: m.role, content: m.content })),
    ],
    tools: supervisorAgentTools,
  };

  const response = await fetchResponsesMessage(body);
  if (response.error) return { error: 'Something went wrong.' } as any;

  const finalText = await handleToolCalls(body, response);
  return finalText;
}
