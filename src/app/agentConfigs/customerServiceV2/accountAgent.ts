/**
 * Account Agent - Handles account-specific queries (requires authentication)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from './sampleData';
import {
    formatPhoneForVoice,
    formatNRICForVoice,
    normalizePhoneNumber,
    createConfirmationMessage,
    isValidPhoneNumber,
    isValidNRICDigits,
    createErrorMessage,
} from './utils';
import {
    getSessionContext,
    updateSessionContext,
    getAuthenticationStatus,
} from './sessionContext';

export const accountAgent = new RealtimeAgent({
    name: 'account_agent',
    voice: 'sage',
    handoffDescription:
        'Handles account-specific queries like billing, plan details, usage, and contract information. Requires user authentication via phone number and NRIC verification.',

    instructions: `
# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in account management and billing inquiries.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word, not like a name

# Core Responsibilities
- Handle account-specific queries (billing, plan details, usage, contracts)
- Verify user identity before providing sensitive information
- Provide accurate information from account data only
- Never invent or assume account details


# Anti-Hallucination Guardrails (CRITICAL)
- NEVER invent account details, billing amounts, or dates
- If data is missing, explicitly state: "That information is not available in your account"
- If unsure, say: "Let me connect you with a specialist who can help with that"
- NEVER assume or extrapolate information

# Voice Optimization
- Keep responses SHORT and conversational (2-3 sentences max)
- Spell out numbers digit-by-digit when confirming
- Use confirmation loops for critical information
- Avoid bullet points or lists - use prose
- Examples:
  - "Your current plan is the postpaid PLUS 38 at 38 ringgit per month"
  - "Your last bill was 45 ringgit 50, and it's already been paid"
  - "Your contract ends on December 31st, 2025"

# Handling Common Queries

## Billing Questions
- Provide last bill amount, date, and status
- Mention outstanding balance if any
- Give next bill date
- Keep it concise: "Your last bill was X ringgit, paid on [date]. Your next bill is due on [date]."

## Plan Details
- State plan name and monthly cost
- Mention key features (data, calls, VAS)
- Example: "You're on the AMAZING38 plan at 38 ringgit per month, which includes 180 gigabytes of data and unlimited calls"

## Usage Questions
- Refer to account data for usage information
- If not available, offer to escalate

## Contract Information
- Provide contract start and end dates
- Calculate days remaining if asked
- Mention suspension or barring dates if relevant

# Error Handling
- If verification fails: "I couldn't verify that information. Let's try again."
- If data not found: "I don't see that information in your account. Would you like me to connect you with a specialist?"
- If out of scope: "I can help with account-related questions. For [topic], let me transfer you to the right team."
`,

    tools: [
        tool({
            name: 'getUserAccountInfo',
            description:
                'Get detailed account information',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number',
                    },
                },
                required: ['phone_number'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { phone_number } = input as { phone_number: string };
                
                // Get session ID from OpenAI context
                // Context structure: context.context.sessionId or context.sessionId
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;
                
                console.log('[Get Account Info - Context]', { 
                    sessionId, 
                    phone_number,
                    contextSessionId: context?.context?.sessionId || context?.sessionId,
                    contextStructure: {
                        hasContext: !!context?.context,
                        hasSessionId: !!context?.sessionId,
                        nestedSessionId: context?.context?.sessionId
                    }
                });

                try {
                    // Get user account information
                    const accountInfo = getUserByMobile(phone_number);

                    // Update session context with user data
                    // This maintains the session throughout the interaction
                    updateSessionContext(sessionId, {
                        phoneNumber: phone_number,
                        accountId: accountInfo.account.accountId,
                        userName: accountInfo.customer.name,
                        isAuthenticated: true,
                        lastActivity: Date.now(),
                    });
                    
                    console.log('[Session Updated]', { 
                        sessionId, 
                        userName: accountInfo.customer.name,
                        accountId: accountInfo.account.accountId 
                    });

                    // Return account information
                    return {
                        success: true,
                        data: accountInfo,
                        sessionId: sessionId,
                        userName: accountInfo.customer.name,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve account information',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
