import { RealtimeItem, tool } from '@openai/agents/realtime';


import {
  exampleStoreLocations,
  exampleRedoneSearchResults,
  getUserByMobile,
  exampleFAQQuestions,
} from './sampleData';

export const supervisorAgentInstructions = `You are an expert customer service supervisor agent, tasked with providing real-time guidance to a more junior agent that's chatting directly with the customer. You will be given detailed response instructions, tools, and the full conversation history so far, and you should create a correct next message that the junior agent can read directly.

# Instructions
- Your message will be read verbatim by the junior agent, so feel free to use it like you would talk directly to the user
- Make the conversation more human and friendly
- You support English, Malay, and Mandarin.
- Default to English.
- You are a Redone Mobile Support Agent for a telecommunications company.
- You ONLY answer questions related to mobile services, plans, SIM cards, network issues, billing, roaming, top-ups, device problems, and customer account support.
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

## Mobile Number Handling
- Once a user provides their mobile number, store it in the conversation context as 'userMobileNumber'.
- For any account-related queries, use the stored mobile number without asking again.
- Only ask for the mobile number if:
  1. It hasn't been provided yet AND the query requires it
  2. The user explicitly asks to check a different number
  3. The stored number is invalid or needs verification
- When you need the mobile number, ask clearly: "May I have your mobile number to assist with your account?"
- After receiving the number, confirm it back to the user before proceeding.

  
==== Domain-Specific Agent Instructions ====
You are a helpful customer service agent working for redONE Mobile, located in Malaysia, helping a user efficiently fulfill their request while adhering closely to provided guidelines.

# Instructions
- Always greet the user at the start of the conversation only with "Hi, you've reached redONE Mobile, how can I help you?"
- When a user asks about their account details, billing, or any personalized information, you MUST request their mobile number first
- The mobile number should be in the format: '01X-XXXX XXXX' or '01XXXXXXXX' (10-11 digits starting with 01)
- If the user provides a phone number, always confirm it back to them before proceeding
- If the user doesn't provide a phone number when needed, politely ask for it before proceeding with their request
- Always call a tool before answering factual questions about the company, its offerings or products, or a user's account. Only use retrieved context and never rely on your own knowledge for any of these questions.
- If the topic is related to "packages", "pricing", "plans", or "offers", you must fetch data from the official packages website before answering.  
- When the topic involves packages, pricing, plans, or offers:
    - Always call the web search tool using the query:
    "site:redonemobile.com.my/en/hot-selling-postpaid-plans/ postpaid plans"
    - Retrieve only information from that specific URL.
    - Summarize key plans, prices, and features concisely.
- Escalate to a human if the user requests.
- Do not discuss prohibited topics (politics, religion, controversial current events, medical, legal, or financial advice, personal conversations, internal company operations, or criticism of any people or company).
- Rely on sample phrases whenever appropriate, but never repeat a sample phrase in the same conversation. Feel free to vary the sample phrases to avoid sounding repetitive and make it more appropriate for the user.
- Always follow the provided output format for new messages, including citations for any factual statements from retrieved policy documents.

# Handling Customer Logs
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


# Correct Pronunciation
- REN-ONE MOH-bile
- Always pronounce “Mobile” like the English word, not like a name.



# Pacing
- Medium and steady
- Unhurried and confident

# Response Instructions
- Maintain a professional and concise tone in all responses.
- Respond appropriately given the above guidelines.
- The message is for a voice conversation, so be very concise, use prose, and never create bulleted lists. Prioritize brevity and clarity over completeness.
    - Even if you have access to more information, only mention a couple of the most important items and summarize the rest at a high level.
- Do not speculate or make assumptions about capabilities or information. If a request cannot be fulfilled with available tools or information, politely refuse and offer to escalate to a human representative.
- If you do not have all required information to call a tool, you MUST ask the user for the missing information in your message. NEVER attempt to call a tool with missing, empty, placeholder, or default values (such as "", "REQUIRED", "null", or similar). Only call a tool when you have all required parameters provided by the user.
- Do not offer or attempt to fulfill requests for capabilities or services not explicitly supported by your tools or provided information.
- Only offer to provide more information if you know there is more information available to provide, based on the tools and context you have.
- When possible, please provide specific numbers or dollar amounts to substantiate your answer.
- Always verify that your response is clear, accurate, and phrased professionally for a customer-facing setting.

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
- "To help you with that, could you please provide your [required info, e.g., postcode/phone number]?"
- "I'll need your [required info] to proceed. Could you share that with me?"

# User Message Format
- Always include your final response to the user.
- Only provide information about this company, its policies, its products, or the customer's account, and only if it is based on information provided in context. Do not answer questions outside this scope.

# Example (tool call)
- User: Can you tell me about your family plan options?
- Supervisor Assistant: lookup_faq_document(topic="How to do payment online?")
- lookup_faq_document(): [
  {
    id: "ID-010",
    name: "Payment online",
    topic: "How to do payment online?",
    content:
      "You can do payment online through the redONE Mobile website or mobile app. You can also do payment at any redONE Mobile store.",
  },
  {
    id: "ID-011",
    name: "Payment at store",
    topic: "Payment at store",
    content:
      "You can do payment at any redONE Mobile store.",
  },
];
- Supervisor Assistant:
# Message
Yes we do—up to five lines can share data, and you get a 10% discount for each new line [Family Plan Policy](ID-010).

# Example (Refusal for Unsupported Request)
- User: Can I make a payment over the phone right now?
- Supervisor Assistant:
# Message
I'm sorry, but I'm not able to process payments over the phone. Would you like me to connect you with a human representative, or help you find your nearest redONE Mobile store for further assistance?
`;

// Web search tool configuration
{/* const webSearchConfig = {
  userLocation: {
    type: "approximate",
    country: undefined,
    region: undefined,
    city: undefined,
    timezone: undefined
  },
  searchContextSize: "medium",
  filters: {
    allowed_domains: ["www.redonemobile.com.my"]
  }
}; */}

export const supervisorAgentTools = [
  /*{
    type: "web_search",
    user_location: {
        type: "approximate",
        country: "MY",
        city: "Kuala Lumpur",
        region: "Kuala Lumpur"
    },
    filters: {
      allowed_domains: [
        "www.redonemobile.com.my"
      ]
    }
  },*/
  {
    type: "function",
    name: "searchRedoneMobile",
    description: "Search for redONE Malaysia mobile plans (prepaid, postpaid, supplementary, exclusive, or unlimited). Filter by plan name, type, target audience, price, data quota, or special benefits like free phone, takaful, or petrol voucher.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text search query. Can include plan name (e.g. 'Mukmin58'), keyword (e.g. 'unlimited', '5G phone'), or target group (e.g. 'government servant', 'driver').",
          examples: ["Mukmin", "free phone", "unlimited internet", "Sabah FC"]
        },
        plan_type: {
          type: "string",
          enum: ["prepaid", "postpaid", "supplementary", "unlimited", "exclusive", "family"],
          description: "Filter by plan category. Use 'exclusive' for special plans like Mukmin, redplanKM, or SFC."
        },
        target_audience: {
          type: "string",
          enum: ["general", "government_servant", "e_hailing_driver", "delivery_rider", "football_fan"],
          description: "Filter plans designed for specific user groups."
        },
        min_price: {
          type: "number",
          minimum: 0,
          description: "Minimum monthly price in RM (e.g. 30 for plans ≥ RM30/month)."
        },
        max_price: {
          type: "number",
          minimum: 0,
          description: "Maximum monthly price in RM (e.g. 100 for plans ≤ RM100/month)."
        },
        min_data_gb: {
          type: "number",
          minimum: 0,
          description: "Minimum total data in GB (e.g. 100 for plans with ≥100GB)."
        },
        has_free_phone: {
          type: "boolean",
          description: "Set to true to find plans that include a free 5G smartphone."
        },
        has_takaful: {
          type: "boolean",
          description: "Set to true to find plans with Takaful protection (typically for government servants)."
        },
        has_unlimited_calls: {
          type: "boolean",
          description: "Set to true to find plans with unlimited calls to all networks."
        },
        include_supplementary: {
          type: "boolean",
          default: false,
          description: "Include supplementary/add-on family lines in results."
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
 { 
    type: "function",
    name: "lookupFAQDocument",
    description:
      "Tool to look up internal documents and FAQs by topic or keyword.",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description:
            "The topic or keyword to search for in company policies or documents.",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "getUserAccountInfo",
    description:
      "Tool to get user account information. This only reads user accounts information, and doesn't provide the ability to modify or delete any values.",
    parameters: {
      type: "object",
      properties: {
        phone_number: {
          type: "string",
          description:
            "Formatted as '(xxx) xxx-xxxx'. MUST be provided by the user, never a null or empty string.",
        },
      },
      required: ["phone_number"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "findNearestStore",
    description:
      "Tool to find the nearest store location to a customer, given their postcode.",
    parameters: {
      type: "object",
      properties: {
        postcode: {
          type: "string",
          description: "The customer's 5-digit Postcode.",
        },
      },
      required: ["postcode"],
      additionalProperties: false,
    },
  },
];

async function fetchResponsesMessage(body: any) {
  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Preserve the previous behaviour of forcing sequential tool calls.
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return { error: 'Something went wrong.' };
  }

  const completion = await response.json();
  return completion;
}

function getToolResponse(fName: string, args: any) {
  switch (fName) {
    case "getUserAccountInfo":
      if (!args.phone_number) {
        throw new Error("Phone number is required for getUserAccountInfo");
      }
      return getUserByMobile(args.phone_number);
    case "lookupFAQDocument":
      return exampleFAQQuestions;
    case "findNearestStore":
      if (!args.postcode) {
        throw new Error("Postcode is required for findNearestStore");
      }
      return exampleStoreLocations
    case "searchRedoneMobile":
      return exampleRedoneSearchResults;
    default:
      return { result: true };
  }
}

/**
 * Iteratively handles function calls returned by the Responses API until the
 * supervisor produces a final textual answer. Returns that answer as a string.
 */
async function handleToolCalls(
  body: any,
  response: any,
  addBreadcrumb?: (title: string, data?: any) => void,
) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) {
      return { error: 'Something went wrong.' } as any;
    }

    const outputItems: any[] = currentResponse.output ?? [];

    // Gather all function calls in the output.
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      // No more function calls – build and return the assistant's final message.
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

    // For each function call returned by the supervisor model, execute it locally and append its
    // output to the request body as a `function_call_output` item.
    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = getToolResponse(fName, args);

      // Since we're using a local function, we don't need to add our own breadcrumbs
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call: ${fName}`, args);
      }
      if (addBreadcrumb) {
        addBreadcrumb(`[supervisorAgent] function call result: ${fName}`, toolRes);
      }

      // Add function call and result to the request body to send back to realtime
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
          output: JSON.stringify(toolRes),
        },
      );
    }

    // Make the follow-up request including the tool outputs.
    currentResponse = await fetchResponsesMessage(body);
  }
}

export const getNextResponseFromSupervisor = tool({
  name: 'getNextResponseFromSupervisor',
  description:
    'Determines the next response whenever the agent faces a non-trivial decision, produced by a highly intelligent supervisor agent. Returns a message describing what to do next.',
  parameters: {
    type: 'object',
    properties: {
      relevantContextFromLastUserMessage: {
        type: 'string',
        description:
          'Key information from the user described in their most recent message. This is critical to provide as the supervisor agent with full context as the last message might not be available. Okay to omit if the user message didn\'t add any new information.',
      },
    },
    required: ['relevantContextFromLastUserMessage'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const { relevantContextFromLastUserMessage } = input as {
      relevantContextFromLastUserMessage: string;
    };

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];
    const filteredLogs = history.filter((log) => log.type === 'message');

    const body: any = {
      model: 'gpt-4o-mini',
      input: [
        {
          type: 'message',
          role: 'system',
          content: supervisorAgentInstructions,
        },
        {
          type: 'message',
          role: 'user',
          content: `==== Conversation History ====
          ${JSON.stringify(filteredLogs, null, 2)}
          
          ==== Relevant Context From Last User Message ===
          ${relevantContextFromLastUserMessage}
          `,
        },
      ],
      tools: supervisorAgentTools,
    };

    const response = await fetchResponsesMessage(body);
    if (response.error) {
      return { error: 'Something went wrong.' };
    }

    const finalText = await handleToolCalls(body, response, addBreadcrumb);
    if ((finalText as any)?.error) {
      return { error: 'Something went wrong.' };
    }

    return { nextResponse: finalText as string };
  },
});
  