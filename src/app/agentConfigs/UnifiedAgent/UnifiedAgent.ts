import { RealtimeAgent, tool, RealtimeItem } from '@openai/agents/realtime';
import {
  exampleStoreLocations,
  exampleRedoneSearchResults,
  getUserByMobile,
  exampleFAQQuestions,
} from '../chatSupervisor/sampleData';

/** Tool execution **/
function getToolResponse(fName: string, args: any) {
  switch (fName) {
    case 'getUserAccountInfo':
      if (!args.phone_number) throw new Error('Phone number is required');
      return getUserByMobile(args.phone_number);
    case 'lookupFAQDocument':
      return exampleFAQQuestions;
    case 'findNearestStore':
      if (!args.postcode) throw new Error('Postcode is required');
      return exampleStoreLocations;
    case 'searchRedoneMobile':
      return exampleRedoneSearchResults;
    default:
      return { result: true };
  }
}

/** Unified agent tools **/
const unifiedAgentTools = [
  tool({
    name: 'getUserAccountInfo',
    description: 'Retrieve user account info',
    parameters: { type: 'object', properties: { phone_number: { type: 'string' } }, required: ['phone_number'], additionalProperties: false, },
    
    execute: async (input) => getToolResponse('getUserAccountInfo', input),
  }),
  tool({
    name: 'lookupFAQDocument',
    description: 'Look up FAQ documents',
    parameters: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'], additionalProperties: false, },
    execute: async (input) => getToolResponse('lookupFAQDocument', input),
  }),
  tool({
    name: 'findNearestStore',
    description: 'Find nearest store',
    parameters: { type: 'object', properties: { postcode: { type: 'string' } }, required: ['postcode'], additionalProperties: false, },
    execute: async (input) => getToolResponse('findNearestStore', input),
  }),
  tool({
    name: 'searchRedoneMobile',
    description: 'Search for redONE mobile plans',
    parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'], additionalProperties: false, },
    execute: async (input) => getToolResponse('searchRedoneMobile', input),
  }),
];

/** Unified agent instructions **/
const unifiedAgentInstructions = `
You are a Redone Mobile customer service agent.
- Handle greetings, basic chit-chat, and mobile number collection directly.
- For account-specific queries, always ask for or use the stored mobile number ('userMobileNumber').
- For billing, plan info, SIM, network issues, top-ups, roaming, or device problems, call tools as needed.
- Do not answer questions outside the telco domain.
- Maintain a neutral, concise, professional tone.
- Use filler phrases like "One moment", "Let me check", or "Just a second" before calling tools.
- Confirm mobile numbers after the user provides them.
- Never make assumptions; rely only on tool data or stored information.
`;

/** Iterative tool handling function **/
async function handleToolCalls(
  body: any,
  fetchResponsesMessage: (body: any) => Promise<any>,
  addBreadcrumb?: (title: string, data?: any) => void
) {
  let currentResponse = await fetchResponsesMessage(body);

  while (true) {
    if (currentResponse?.error) return { error: 'Something went wrong.' };

    const outputItems: RealtimeItem[] = currentResponse.output ?? [];
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      // No more tools to call – gather final message
      const finalText = outputItems
        .filter((msg) => msg.type === 'message')
        .map((msg: any) =>
          (msg.content ?? [])
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('')
        )
        .join('\n');
      return finalText;
    }

    // Execute each tool sequentially
    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = getToolResponse(fName, args);

      if (addBreadcrumb) addBreadcrumb(`[UnifiedAgent] tool call: ${fName}`, args);
      if (addBreadcrumb) addBreadcrumb(`[UnifiedAgent] tool result: ${fName}`, toolRes);

      // Append tool call and result to the body
      body.input.push(
        { type: 'function_call', itemId: toolCall?.itemId, name: toolCall.name, arguments: toolCall.arguments },
        { type: 'function_call_output', itemId: toolCall?.itemId, output: JSON.stringify(toolRes) }
      );
    }

    currentResponse = await fetchResponsesMessage(body);
  }
}

/** Unified agent **/
export const unifiedAgent = new RealtimeAgent({
  name: 'redoneUnifiedAgent',
  voice: 'sage',
  instructions: unifiedAgentInstructions,
  tools: unifiedAgentTools,
});
