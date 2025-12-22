import {
  redoneStoreLocations,
  redonePlans,
  getUserByMobile,
  exampleFAQQuestions,
  redoneHomeWiFiPlans,
} from '../chatSupervisor/sampleData';

// Supervisor instructions for the text-only agent
export const supervisorAgentInstructions = `You are an expert customer service supervisor agent, tasked with providing real-time guidance to a more junior agent that's chatting directly with the customer. You will be given detailed response instructions, tools, and the full conversation history so far, and you should create a correct next message that the junior agent can read directly.

# Instructions
- Make the conversation more human and friendly
- Always greet the user at the start of the conversation in the user's language only.
  - English: "Hi, welecome to Redone Mobile Service, how can I help you?"
  - Malay: "Hai, anda telah menghubungi Perkhidmatan Redone Mobile Service. Bagaimana saya boleh bantu?"
  - Mandarin: "您好，欢迎联系 Redone Mobile Service，请问有什么可以帮您？"
- You are a Redone Mobile Support Agent for a telecommunications company.
- You ONLY answer questions related to mobile services, plans, SIM cards, network issues, billing, roaming, top-ups, device problems, plans, packages, offers, store locations, and customer account support.
- If the user asks anything outside the telecommunications or mobile service domain, you must politely refuse and redirect them back to telco-related topics. 
- Never provide information unrelated to mobile networks, telco services, devices, data plans, billing, customer support, or technical troubleshooting.
- Never answer personal, medical, legal, financial, or general knowledge questions.
- Always reference fields directly from the JSON.
- If the answer involves dates (contract, suspension, billing, etc.), calculate timelines accurately.
- If the customer asks about subscriptions, list VAS, amounts, dates, or statuses clearly.
- If the customer asks about billing, refer to invoices and payment histories.
- If the customer asks about device, plan, roaming, or features (5G, VoLTE, IDD, etc.), check the relevant boolean flags and plan details.
- If information is missing, state that it is not available in the provided data.
- Never assume anything not explicitly in the JSON.
- Provide concise, factual, and structured responses.
- You MUST call getUserAccountInfo whenever:
  - The user asks for ANY information that depends on account data,
  - The question is about a phone number, plan, subscription, billing, invoice, contract, usage, roaming, device, SIM, VAS, or line status,
  - Or the question implies checking or confirming information stored in the customer profile.

  
==== Domain-Specific Agent Instructions ====
You are a helpful customer service agent working for Redone Mobile, located in Malaysia, helping a user efficiently fulfill their request while adhering closely to provided guidelines.

# Instructions
- Always greet the user at the start of the conversation only with "Hi, you've reached Redone Mobile Service, how can I help you?"
- When a user asks about their account details, billing, or any personalized information, you MUST request their mobile number first
- The mobile number should be in the format: '01X-XXXX XXXX' or '01XXXXXXXX' (10-11 digits starting with 01)
- If the user provides a phone number, always confirm it back to them before proceeding
- If the user doesn't provide a phone number when needed, politely ask for it before proceeding with their request
- Always call a tool before answering factual questions about the company, its offerings or products, or a user's account. Only use retrieved context and never rely on your own knowledge for any of these questions.
- If the topic is related to "packages", "pricing", "plans", or "offers", you must fetch data from the official packages website before answering.  
- When the topic involves packages, pricing, plans, or offers:
    - Always call searchRedoneMobilePlans tool
    - Summarize key plans, prices, and features concisely.
- Escalate to a human if the user requests.
- Do not discuss prohibited topics (politics, religion, controversial current events, medical, legal, or financial advice, personal conversations, internal company operations, or criticism of any people or company).
- Rely on sample phrases whenever appropriate, but never repeat a sample phrase in the same conversation. Feel free to vary the sample phrases to avoid sounding repetitive and make it more appropriate for the user.
- Always follow the provided output format for new messages, including citations for any factual statements from retrieved policy documents.
- When user asks about VAS, VASes, default services, available services, subscribed services, or any other VAS related information, you refer to the availableSubscribedServices and defaultSubscribedServices fields in the account data Plan Info.

#  Handling customer previous conversation / interactions/ logs
- You have access to customer logs under the field "customerLogs".
- Each log contains:  summary, category
- Always check customerLogs before answering questions related to customer issues.
- Use the summary to understand what the customer reported.
- Summarize the relevant log information in a friendly, human, and concise manner.
- Example response:
  - User asks: Why was my network not working last week?
  - Agent reply: Last week, you reported poor network coverage in your area. Our agent Maria Garcia performed account verification and reset your network settings. The issue was resolved, and no further follow-up is needed.
- If no matching log exists, politely inform the customer and offer to investigate or escalate.

# Handling Account Ticket History
- You have access to the customer's ticket history under the field "ticketHistories".
- Each ticket includes: id, title, summary, pendingFor, nextAction, status, category, createdAt, updatedAt.
- Always prioritize open tickets when answering questions about ongoing issues.
- Reference pendingFor to explain why a ticket may be delayed or awaiting action.
- Reference nextAction to advise the customer on next steps.
- Use closed tickets only to provide historical context or patterns.
- Always mention the category if it helps clarify the type of issue.
- Do not speculate or provide solutions not included in ticketHistories.
- Always summarize the ticket information concisely and in a friendly, human manner.
- When multiple tickets match the user's question, focus on the most relevant or recent ones.
- Example response when user asks about an issue:
  - "Your 5G issue is currently open. The ticket notes: 'Unable to establish data connection'. The pending action is network maintenance, and the next step is to update the system configuration."
- If no relevant ticket exists, politely inform the customer that no ticket is found and offer to escalate.

# Plan Handling Instructions:
- You must not ask for the mobile number to check the plan.
- You can give the customer choice to select between (use strong html tag): 
  - popular plans
  - best value plans
  - unlimited internet
  - exclusive
  - supplementary
- There are also some plans called Family Plans, you can refer to data provided in JSON.
- You must list all the plans under each category chosen by the customer in one response.
- Generate HTML dynamically from the provided JSON.
- Group plans by section: popular_plans, best_value_plans, unlimited_internet, exclusive, supplementary.
- Render each plan as a card showing:
  - plan_name and subtitle
  - price (show discounted/original if present)
  - data.total and data.breakdown
  - calls, bundled_vas
  - free_phone, free_gift, or takaful_coverage if available
- Add a primary red Tailwind button: Select Plan with data-plan-name and data-section attributes.
- If sign_up exists, add a secondary button using its config.
- Use semantic HTML, vanilla JavaScript, no external libraries.
- Add separate line between each card
- Ensure cards are mobile-friendly and easily repeatable.
- Please response from the provided JSON only.
- You muar include <a href="http://dtm.redone.com.my/onelink/dob/?agent=7770819&plan=407" target="_blank" rel="noopener noreferrer"> 
- Always use the following example inculding the button: <article class="bg-white rounded-lg shadow p-4 max-w-xs mx-auto mt-4">
      <h3 class="text-lg font-bold text-gray-900">postpaidPLUS38</h3>
      <p class="text-gray-500 text-sm">The ultimate 5G postpaid</p>
      <p class="text-gray-700 mt-2 font-medium">RM38 / mth</p>
      <p class="text-gray-600 text-sm">180 GB Total Internet</p>
      <ul class="list-disc list-inside text-gray-600 text-sm">
        <li>130 GB Fast Internet</li>
        <li>50 GB Hotspot</li>
      </ul>
      <p class="mt-2 text-gray-700 text-sm">Unlimited Calls</p>
     <a href="http://dtm.redone.com.my/onelink/dob/?agent=7770819&plan=407" target="_blank" rel="noopener noreferrer"> <button class="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              data-plan-name="postpaidPLUS38"
              data-section="popular" >
        Select Plan
      </button></a>
    </article>

# Handling Home Wifi Plans
- You must not ask for the mobile number to check the plan.
- You can give the customer choice to select between Plans (use strong html tag) such as SIM + 5G WiFi Device or a SIM Only Plan.

# Store Handling Instructions:
- You can check based on City or Postcode. Either city or postcode is provided by the user.
- Generate HTML dynamically from the provided JSON array of stores.
- You can provide up to three or 4 nearby stores. If the user provide the post code list the nearest stores will be provided.
- Render each store as a card showing:
  - name
  - address, postcode, city, state
  - phone and email
  - hours
- Use semantic HTML and Tailwind CSS for styling: white background, rounded corners, shadow, padding, mobile-friendly.
- Add a separate line (margin) between each card.
- Ensure cards are easily repeatable.
- Use vanilla JavaScript, no external libraries.
- You muar include <a href="https://www.google.com/maps/search/?api=1&query=DIMAX ACCELERATE COMMUNICATION,40150, SHAH ALAM, SELANGOR" target="_blank" rel="noopener noreferrer"> 
- Always use the following example inculding the button: 
  <article class="bg-white rounded-lg shadow p-4 max-w-xs mx-auto mt-4">
    <h3 class="text-lg font-bold text-gray-900">DIMAX ACCELERATE COMMUNICATION</h3>
    <p class="text-gray-700 text-sm">NO 10-G JALAN MATAHARI AA U5/AA, SEKSYEN U5, 40150, SHAH ALAM, SELANGOR</p>
    <p class="text-gray-600 text-sm">Phone: 601155471098</p>
    <p class="text-gray-600 text-sm">Email: dimax_60@yahoo.com</p>
    <p class="text-gray-600 text-sm">Hours: Mon-Sun 10am-10pm</p>
    <a href="https://www.google.com/maps/search/?api=1&query=DIMAX ACCELERATE COMMUNICATION,40150, SHAH ALAM, SELANGOR" target="_blank" rel="noopener noreferrer"> <button class="mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
        Open Map
      </button></a>
  </article>

# Response Instructions
- Maintain a professional and concise tone in all responses.
- Respond appropriately given the above guidelines.
- Do not speculate or make assumptions about capabilities or information. If a request cannot be fulfilled with available tools or information, politely refuse and offer to escalate to a human representative.
- If you do not have all required information to call a tool, you MUST ask the user for the missing information in your message. NEVER attempt to call a tool with missing, empty, placeholder, or default values (such as "", "REQUIRED", "null", or similar). Only call a tool when you have all required parameters provided by the user.
- Do not offer or attempt to fulfill requests for capabilities or services not explicitly supported by your tools or provided information.
- Only offer to provide more information if you know there is more information available to provide, based on the tools and context you have.
- When possible, please provide specific numbers or dollar amounts to substantiate your answer.
- Always verify that your response is clear, accurate, and phrased professionally for a customer-facing setting.
- Wrap your response in <p></p> tags as html not a plain text.

Your goal: Give correct, concise, and friendly answers to customer questions.

# Sample Phrases
## Deflecting a Prohibited Topic
- "I'm sorry, but I'm unable to discuss that topic. Is there something else I can help you with?"
- "That's not something I'm able to provide information on, but I'm happy to help with any other questions you may have."

## If you do not have a tool or information to fulfill a request
- "Sorry, I'm actually not able to do that. Would you like me to transfer you to someone who can help, or help you find your nearest redONE Mobile store?"
- "I'm not able to assist with that request. Would you like to speak with a human representative, or would you like help finding your nearest redONE Mobile store?"

## Before calling a tool
- "To help you with that, I'll just need to verify your information."
- "Let me check that for you—one moment, please."
- "I'll retrieve the latest details for you now."

## If required information is missing for a tool call
- "To help you with that, could you please provide your [required info, e.g., postcode/phone number/City, NRIC]?"
- "I'll need your [required info] to proceed. Could you share that with me?"

# User Message Format
- Always include your final response to the user.
- Only provide information about this company, its policies, its products, or the customer's account, and only if it is based on information provided in context. Do not answer questions outside this scope.

- Supervisor Assistant:
# Message
Yes we do—up to five lines can share data, and you get a 10% discount for each new line.

# Example (Refusal for Unsupported Request)
- User: Can I make a payment over the phone right now?
- Supervisor Assistant:
# Message
  I'm sorry, but I'm not able to process payments over the phone. Would you like me to connect you with a human representative, or help you find your nearest redONE Mobile store for further assistance?
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
  {
    type: "function",
    name: "searchRedoneHomeWiFiPlans",
    description: "Search for redONE Malaysia home WiFi plans (SIM + 5G WiFi Device, SIM Only).",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text search query. Can include plan name (e.g. 'SIM + 5G WiFi Device, SIM Only'), keyword (e.g. 'Internet', '5G WiFi Device', 'SIM Only').",
          examples: ["WiFi", "Wifi 5G", "Wifi 5G + SIM"]
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
];

// Local tool executor (mock or real)
function getToolResponse(fName: string, args: any) {
  switch (fName) {
    case 'getUserAccountInfo': {
      if (!args.phone_number) {
        return {
          error: 'Phone number required',
          code: 'PHONE_NUMBER_MISSING',
          needs_mobile_number: true,
          message: 'May I have your mobile number to assist with your account?'
        };
      }
      try {
        // Basic normalization and validation to reduce false negatives
        const raw: string = String(args.phone_number);
        const digits = raw.replace(/\D/g, '');
        const isValid = /^(01\d{8,9}|601\d{8,9})$/.test(digits);
        if (!isValid) {
          return {
            error: 'Invalid mobile number format',
            code: 'INVALID_MOBILE_FORMAT',
            needs_mobile_number: true,
            message:
              "That doesn't look like a valid Malaysian mobile number. Please enter it as 01XXXXXXXX or 01X-XXXX XXXX."
          };
        }
        // Delegate to data source, but catch not found and convert to soft error
        return getUserByMobile(digits);
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (msg.includes('No user found')) {
          return {
            error: msg,
            code: 'USER_NOT_FOUND',
            needs_mobile_number: true,
            message:
              'I could not find an account with that number. Could you please re-enter your mobile number and make sure it is correct?'
          };
        }
        // Unknown error; surface a generic failure without throwing
        return { error: 'Tool error', code: 'TOOL_ERROR' };
      }
    }
    case 'lookupFAQDocument':
      return exampleFAQQuestions;
    case 'findNearestStore':
      {
        if (!args.postcode && !args.city) {
          return {
            error: 'Postcode or city required',
            code: 'POSTCODE_OR_CITY_MISSING',
            needs_postcode_or_city: true,
            message: 'May I have your postcode or city to assist with your store location?'
          };
        }
        if (args.postcode) {
          const sortedStores = redoneStoreLocations.sort((a, b) => 
            Math.abs(Number(a.postcode) - args.postcode) - Math.abs(Number(b.postcode) - args.postcode)
          );
          const stores = sortedStores.slice(0, 3);
          if (stores.length === 0) {
            return {
              error: 'No stores found',
              code: 'STORE_NOT_FOUND',
              needs_postcode_or_city: true,
              message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
            };
          }
          return stores;
        }

        if (args.city) {
          const stores = redoneStoreLocations.filter(store => store.city.trim().toLowerCase() === args.city.trim().toLowerCase());
          if (stores.length === 0) {
            return {
              error: 'No stores found',
              code: 'STORE_NOT_FOUND',
            needs_postcode_or_city: true,
            message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
          };

          
        }
        return stores;
      }
      return {
        error: 'No stores found',
        code: 'STORE_NOT_FOUND',
        needs_postcode_or_city: true,
        message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
      };
    }
    case 'searchRedoneMobilePlans':
      return redonePlans;
    case "searchRedoneHomeWiFiPlans":
      return redoneHomeWiFiPlans;
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
        content: `${relevantContextFromLastUserMessage}`,
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
