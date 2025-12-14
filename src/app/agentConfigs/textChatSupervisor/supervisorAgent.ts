import {
  exampleStoreLocations,
  exampleRedoneSearchResults,
  getUserByMobile,
  exampleFAQQuestions,
} from './sampleData';

// Supervisor instructions for the text-only agent
export const supervisorAgentInstructions = `You are an expert customer service supervisor agent speaking in Malaysian English (Manglish), tasked with providing guidance to a junior agent chatting directly with the customer. You will be given detailed response instructions, tools, and the full conversation history so far, and you should create a correct next message that the junior agent can read directly.
You are a helpful redONE Mobile assistant. 
When responding, always return your message in HTML format that can be rendered in a chat component. 
- If showing a text reply, wrap it in <p>...</p>.
- If showing cards (data plans, offers), wrap them in <div class="card">...</div> elements.
- Never return plain text without HTML.
# Key rules
- Respond concisely and professionally
- Default to English
- ONLY answer questions related to mobile services, plans, SIM cards, network issues, billing, roaming, top-ups, device problems, and customer account support.
- Always use the provided JSON data or tools for answers
- Never assume anything not explicitly in the JSON
- Use the getUserAccountInfo tool for any account-specific requests
- Use other tools only when relevant
`;

// Tools the supervisor can call
export const supervisorAgentTools = [
  {
    type: 'function',
    name: 'searchRedoneMobile',
    description: 'Search for redONE Malaysia mobile plans.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        plan_type: {
          type: 'string',
          enum: ['prepaid', 'postpaid', 'supplementary', 'unlimited', 'exclusive', 'family'],
        },
        target_audience: {
          type: 'string',
          enum: ['general', 'government_servant', 'e_hailing_driver', 'delivery_rider', 'football_fan'],
        },
        min_price: { type: 'number' },
        max_price: { type: 'number' },
        min_data_gb: { type: 'number' },
        has_free_phone: { type: 'boolean' },
        has_takaful: { type: 'boolean' },
        has_unlimited_calls: { type: 'boolean' },
        include_supplementary: { type: 'boolean', default: false },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'lookupFAQDocument',
    description: 'Look up internal documents and FAQs by topic or keyword.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
      },
      required: ['topic'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'getUserAccountInfo',
    description: 'Get user account information (read-only).',
    parameters: {
      type: 'object',
      properties: {
        phone_number: { type: 'string' },
      },
      required: ['phone_number'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'findNearestStore',
    description: 'Find the nearest store location.',
    parameters: {
      type: 'object',
      properties: {
        postcode: { type: 'string' },
        city: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
];

// Local tool executor (mock or real)
function getToolResponse(fName: string, args: any) {
  switch (fName) {
    case 'getUserAccountInfo':
      if (!args.phone_number) throw new Error('Phone number required');
      return getUserByMobile(args.phone_number);
    case 'lookupFAQDocument':
      return exampleFAQQuestions;
    case 'findNearestStore':
      return exampleStoreLocations;
    case 'searchRedoneMobile':
      return exampleRedoneSearchResults;
    default:
      return { result: true };
  }
}

// Send request to your API (or directly to OpenAI)
async function fetchResponsesMessage(body: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) return { error: 'Something went wrong.' };
  return response.json();
}

// Iteratively handle function calls until final message
async function handleToolCalls(body: any, response: any) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) return { error: 'Something went wrong.' };

    const outputItems: any[] = currentResponse.output ?? [];
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      const messages = outputItems.filter((item) => item.type === 'message');
      return messages
        .map((msg) =>
          (msg.content ?? [])
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('')
        )
        .join('\n');
    }

    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = getToolResponse(fName, args);

      // Add results to the body to send back
      body.input.push(
        { type: 'function_call', call_id: toolCall.call_id, name: fName, arguments: toolCall.arguments },
        { type: 'function_call_output', call_id: toolCall.call_id, output: JSON.stringify(toolRes) }
      );
    }

    currentResponse = await fetchResponsesMessage(body);
  }
}

// Main exported tool for the chat agent
export const getNextResponseFromSupervisor = async (relevantContextFromLastUserMessage: string) => {
  const body: any = {
    model: 'gpt-4o-mini',
    input: [
      { type: 'message', role: 'system', content: supervisorAgentInstructions },
      {
        type: 'message',
        role: 'user',
        content: `Relevant context: ${relevantContextFromLastUserMessage}`,
      },
    ],
    tools: supervisorAgentTools,
  };

  const response = await fetchResponsesMessage(body);
  if (response.error) return { error: 'Something went wrong.' };

  const finalText = await handleToolCalls(body, response);
  if ((finalText as any)?.error) return { error: 'Something went wrong.' };

  return { nextResponse: finalText as string };
};
