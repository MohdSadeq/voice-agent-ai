/**
 * Account Agent - Handles account-specific queries for text chat (requires authentication)
 * Text-optimized with HTML formatting
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from '../customerServiceV2/sampleData';
import {
    formatPhoneForVoice,
    formatNRICForVoice,
    normalizePhoneNumber,
    createConfirmationMessage,
    isValidPhoneNumber,
    isValidNRICDigits,
    createErrorMessage,
} from '../customerServiceV2/utils';
import {
    getSessionContext,
    updateSessionContext,
    getAuthenticationStatus,
} from '../customerServiceV2/sessionContext';

export const accountAgent = new RealtimeAgent({
    name: 'account_agent',
    voice: 'sage',
    handoffDescription:
        'Handles account-specific queries like billing, plan details, usage, and contract information. Requires user authentication via phone number and NRIC verification. Optimized for text chat with HTML formatting.',

    instructions: `
# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in account management and billing inquiries.

# Company Name
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")

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

# Text Chat Optimization with HTML Formatting
- Use HTML tags for better formatting: <strong>, <ul>, <li>, <br>, <p>, <table>
- Present information in a structured, easy-to-read format
- Use bullet points for lists
- Highlight key information with bold text
- Examples:
  <strong>Your Current Plan:</strong><br>
  Postpaid PLUS 38 - RM38/month<br><br>
  <strong>Last Bill:</strong><br>
  Amount: RM45.50<br>
  Status: Paid<br>
  Date: December 15, 2024

# Handling Common Queries

## Billing Questions
- Provide last bill amount, date, and status
- Mention outstanding balance if any
- Give next bill date
- Format clearly:
  "<strong>Billing Summary:</strong><br>
  • Last bill: RM45.50 (Paid on Dec 15, 2024)<br>
  • Outstanding: RM0.00<br>
  • Next bill due: Jan 21, 2025"

## Plan Details
- State plan name and monthly cost
- Mention key features (data, calls, VAS)
- Use HTML formatting:
  "<strong>Your Plan: Postpaid PLUS 38</strong><br>
  • Monthly: RM38<br>
  • Data: 180GB<br>
  • Calls: Unlimited to all networks<br>
  • 5G: Included"

## Usage Questions
- Refer to account data for usage information
- If not available, offer to escalate
- Format data clearly with HTML

## Contract Information
- Provide contract start and end dates
- Calculate days remaining if asked
- Mention suspension or barring dates if relevant
- Format:
  "<strong>Contract Details:</strong><br>
  • Start: January 1, 2024<br>
  • End: December 31, 2025<br>
  • Days remaining: 365 days"

## Customer Logs and Ticket History
- Check customerLogs for previous interactions
- Reference ticketHistories for ongoing issues
- Summarize in a friendly, concise manner
- Format with HTML for clarity:
  "<strong>Previous Issue:</strong><br>
  Last week, you reported poor network coverage. Our agent performed network reset. Issue resolved."

# Error Handling
- If verification fails: "I couldn't verify that information. Let's try again."
- If data not found: "I don't see that information in your account. Would you like me to connect you with a specialist?"
- If out of scope: "I can help with account-related questions. For [topic], let me transfer you to the right team."

# Important Rules
- REQUIRE authentication for all account queries
- ONLY use data from tools (never invent)
- Use HTML formatting for better readability
- Keep responses organized and easy to scan
- Support English, Malay, and Mandarin
- Always verify before providing sensitive information
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
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;
                
                console.log('[Get Account Info - Context]', { 
                    sessionId, 
                    phone_number,
                    contextSessionId: context?.context?.sessionId || context?.sessionId,
                });

                try {
                    // Get user account information
                    const accountInfo = getUserByMobile(phone_number);

                    // Update session context with user data
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
