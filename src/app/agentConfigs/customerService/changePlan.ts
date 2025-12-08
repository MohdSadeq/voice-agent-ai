import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from '../chatSupervisor/sampleData';

export const changePlanAgent = new RealtimeAgent({
  name: 'changePlanAgent',
  voice: 'sage',
  handoffDescription:
    "Handles account-related inquiries, including account details, billing, or any personalized information. Should be routed whenever the user is asking about their",

    instructions: `- Always reference fields directly from the JSON.
    - If the answer involves dates (contract, suspension, billing, etc.), calculate timelines accurately.
    - If the customer asks about subscriptions, list VAS, amounts, dates, or statuses clearly.
    - If the customer asks about billing, refer to invoices and payment histories.
    - If the customer asks about device, plan, roaming, or features (5G, VoLTE, IDD, etc.), check the relevant boolean flags and plan details.
    - If information is missing, state that it is not available in the provided data.`,
    
  tools: [

        tool({
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
          execute: async (input: unknown) => {
            // ✅ Cast/validate input
            const { phone_number } = input as { phone_number: string };
        
            const user = getUserByMobile(phone_number);
            if (!user) {
              return { success: false, error: "Phone number not found" };
            }
        
            return { success: true, user };
          },
        }),
  ],

  handoffs: [],
});
