import { RealtimeItem, tool } from '@openai/agents/realtime';


import {
  redoneStoreLocations,
  redonePlans,
  getUserByMobile,
  exampleFAQQuestions,
  redoneHomeWiFiPlans,
} from './sampleData';

export const supervisorAgentInstructions = `You are an expert customer service supervisor agent, tasked with providing real-time guidance to a more junior agent that's chatting directly with the customer. You will be given detailed response instructions, tools, and the full conversation history so far, and you should create a correct next message that the junior agent can read directly.

# Instructions
- Your message will be read verbatim by the junior agent, so feel free to use it like you would talk directly to the user
- Make the conversation more human and friendly
- You support English, Malay, and Mandarin.
- You are a Redone Mobile Service Support Agent for a telecommunications company.
- You ONLY answer questions related to mobile services, plans, SIM cards, network issues, billing, roaming, top-ups, device problems, and customer account support.
- If the user asks anything outside the telecommunications or mobile service domain, you must politely refuse and redirect them back to telco-related topics. 
- Never provide information unrelated to mobile networks, telco services, devices, data plans, billing, customer support, or technical troubleshooting.
- Never answer personal, medical, legal, financial, or general knowledge questions.
- Always reference fields directly from the JSON.
- Use ONLY the provided JSON. When asked for account details, respond briefly and clearly, covering: account status, plan name and price, active services (5G, roaming, IDD), outstanding balance and next bill date, contract end date, and any open tickets, customer logs.
- If the answer involves dates (contract, suspension, billing, etc.), calculate timelines accurately.
- If the customer asks about subscriptions, list VAS, amounts, dates, or statuses clearly.
- If the customer asks about billing, refer to invoices and payment histories.
- If the customer asks about device, plan, roaming, or features (5G, VoLTE, IDD, etc.), check the relevant boolean flags and plan details.
- If information is missing, state that it is not available in the provided data.
- Never assume anything not explicitly in the JSON.
- Provide concise, factual, and structured responses.


# Handling Subscriptions & VAS
- List plan name, price, VAS names, amounts, and subscription dates clearly.
- Use JSON data only, do not assume extra info.
- If VAS info is missing, say it is unavailable.

# Billing & Payments
- Refer to invoices, payment history, and barring history.
- Give last bill, outstanding balance, next bill date, and due date, invoice status, invoice amount, invoice items, invoice date, invoice number, invoice description.
- Summarize payment issues concisely.

# Contract & Services
- Provide contract start, end, suspension date, days remaining.
- Mention active services like Roaming, IDD, 5G.
- Summarize network features (LTE, VoLTE, 5G) from JSON.

# Ticket & Customer Logs
- Reference ticketHistory for ongoing/open tickets.
- Focus on pendingFor and nextAction for open tickets.
- Summarize customerLogs to provide relevant context concisely.
- Closed tickets or logs can be used for historical reference only.

 
  
==== Domain-Specific Agent Instructions ====
You are a helpful customer service agent working for redONE Mobile, located in Malaysia, helping a user efficiently fulfill their request while adhering closely to provided guidelines.

# Instructions
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
- Do NOT request a mobile number for general enquiries.
- General enquiries include, but are not limited to:
  - Store locations or operating hours
  - Promotions, offers, or campaigns, redone plans
  - General plan information
  - Coverage or network availability
  - Device availability
- Only request a mobile number when the user’s request explicitly requires account-level access
  (e.g., billing, plan details, charges, line status, account verification).



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
- "To help you with that, could you please provide your [required info, e.g., postcode/phone number/City]?"
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
    description: "Search for redONE Malaysia mobile plans (prepaid, postpaid, supplementary, exclusive, or unlimited). Filter by plan name, type, target audience, price, data quota, or special benefits like free phone, takaful.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text search query. Can include plan name (e.g. 'Mukmin58'), keyword (e.g. 'unlimited', '5G phone'), ",
          examples: ["Mukmin", "free phone", "unlimited internet", "Sabah FC"]
        },
        plan_type: {
          type: "string",
          enum: ["prepaid", "postpaid", "supplementary", "unlimited", "exclusive", "family"],
          description: "Filter by plan category. Use 'exclusive' for special plans like Mukmin, redplanKM, or SFC."
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
      "Tool to find the nearest store location to a customer, given their postcode or city.",
    parameters: {
      type: "object",
      properties: {
        postcode: {
          type: "string",
          description: "The customer's 5-digit Postcode.",
        },
        city: {
          type: "string",
          description: "The customer's city.",
        },
      },
      // required: ["postcode"],
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "verifyNRIC",
    description: "Verify the user's identity by checking the last 4 digits of their NRIC. This tool should be called when the user provides the last 4 digits of their NRIC.",
    parameters: {
      type: "object",
      properties: {
        last_4_digits: {
          type: "string",
          description: "The last 4 digits of the user's NRIC provided by the user.",
        },
      },
      required: ["last_4_digits"],
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

function getToolResponse(fName: string, args: any, details?: any): any {
  const context = (details?.context as any);
  const updateUserContext = context?.updateUserContext;
  const userContext = context?.userContext;

  switch (fName) {
    case "getUserAccountInfo":
      if (!args.phone_number) {
        throw new Error("Phone number is required for getUserAccountInfo");
      }
      const accountInfo = getUserByMobile(args.phone_number);
      if (accountInfo.personalInfo && updateUserContext) {
        const updates = {
          mobile: accountInfo.personalInfo.phone,
          nric: accountInfo.personalInfo.nric,
          name: accountInfo.personalInfo.name,
        };
        updateUserContext(updates);
        if (userContext) {
          Object.assign(userContext, updates);
        }
      }

      if (!userContext?.nricNotYetRequestedToBeVerified) {
        return {
          nricNotYetRequestedToBeVerified: false, 
          message: "Request last 4 digits of NRIC from user"
        };
      }

      return accountInfo;
    case "lookupFAQDocument":
      return exampleFAQQuestions;
    case "findNearestStore":
      return redoneStoreLocations
    case "searchRedoneMobile":
      return redonePlans;
    case "verifyNRIC":
      if (!args.last_4_digits || args.last_4_digits.length !== 4) {
        return { verified: false };
      }

      const userNRIC = userContext?.nric;
      if (!userNRIC) {
        return { verified: false };
      }

      const isVerified = !!(userNRIC && userNRIC.endsWith(args.last_4_digits));
      if (isVerified && updateUserContext) {
        updateUserContext({ nricNotYetRequestedToBeVerified: true });
        if (userContext) {
          userContext.nricNotYetRequestedToBeVerified = true;
        }
      }
      return { verified: isVerified };
    case "searchRedoneHomeWiFiPlans":
      return redoneHomeWiFiPlans;
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
  details?: any,
) {
  let currentResponse = response;
  const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
    | ((title: string, data?: any) => void)
    | undefined;
  const updateUserContext = (details?.context as any)?.updateUserContext as
    | ((updates: any) => void)
    | undefined;

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
      const toolRes = getToolResponse(fName, args, details);


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

    const userContext = (details?.context as any)?.userContext ?? {
      userMobileNumber: "",
      mobile: "",
      nric: "",
      name: "",
    };

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
          content: `==== User Context ====
          ${JSON.stringify(userContext, null, 2)}

          ==== Conversation History ====
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

    const finalText = await handleToolCalls(body, response, details);
    if ((finalText as any)?.error) {
      return { error: 'Something went wrong.' };
    }

    return { nextResponse: finalText as string };
  },
});
