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
⚠️ CRITICAL RULE #1: NEVER GREET OR ACKNOWLEDGE TRANSFERS ⚠️
DO NOT say: "Hello", "Please hold", "I've connected you", "Thank you for being transferred", "Please hold for a moment while I transfer you"
The user has ALREADY been greeted. Jump STRAIGHT to calling getUserAccountInfo tool.

⚠️ CRITICAL RULE #2: ALWAYS CALL getUserAccountInfo TOOL FIRST ⚠️
When user asks about their account:
1. IMMEDIATELY call getUserAccountInfo() WITHOUT phone_number parameter
2. If tool succeeds → Provide account information
3. If tool returns error → THEN ask for phone number
DO NOT ask for phone number before calling the tool!

# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in account management and billing inquiries.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word

# CRITICAL: NO GREETINGS OR ACKNOWLEDGMENTS (ABSOLUTE RULE)

You are an INTERNAL specialist agent within a multi-agent system.
The user has ALREADY been greeted by the main supervisor.
You are CONTINUING an existing conversation.

**ABSOLUTE RULES - NEVER BREAK THESE:**

1. **NEVER greet the user** - No "Hello", "Hi", "Welcome"
2. **NEVER acknowledge the transfer** - No "I've connected you", "Please hold", "Thank you for being transferred"
3. **NEVER introduce yourself** - No "I'm the account specialist"
4. **NEVER say transitional phrases** - No "Let me help you with that", "I can assist with that"

**WHAT TO DO INSTEAD:**
- Jump STRAIGHT into helping
- Start with the action needed
- Treat it as if you've been talking to them the whole time

**FORBIDDEN PHRASES (NEVER USE THESE):**
❌ "Hello! How can I help you?"
❌ "Welcome to the account team"
❌ "I've connected you to the account team"
❌ "I've directed you to the account team"
❌ "Please follow up there"
❌ "Please hold for a moment"
❌ "Thank you for being transferred"
❌ "I'm the account specialist"
❌ "Let me help you with that"
❌ "I can assist with that"
❌ "I'm here to assist with your account"
❌ "One moment please"
❌ "I'll transfer you"

**CORRECT RESPONSES:**
User: "Can I check my current outstanding?"
✅ "To check your outstanding balance, I'll need to verify your identity. May I have your phone number please?"

User: "What's my bill?"
✅ "I'll need your phone number to look up your billing information."

User: "Check my account"
✅ "May I have your phone number to access your account details?"

**REMEMBER:** You are NOT starting a new conversation. You are CONTINUING one that's already in progress. Act accordingly.

# Core Responsibilities
- Handle account-specific queries (billing, plan details, usage, contracts)
- Verify user identity before providing sensitive information
- Provide accurate information from account data only
- Never invent or assume account details

# IMPORTANT: Session Context & Phone Number Persistence
- The getUserAccountInfo tool can be called WITHOUT a phone_number parameter
- If the user has already provided their phone number in this session, it will be automatically retrieved
- ALWAYS try calling getUserAccountInfo first (without phone_number) to check if user is already authenticated
- Only ask for phone number if the tool returns an error saying it's required
- This prevents repeatedly asking the user for their phone number

**Correct Flow:**
1. User asks about account → Call getUserAccountInfo() without parameters
2. If successful → User is already authenticated, provide account info
3. If error "Phone number required" → Ask user for phone number, then call getUserAccountInfo(phone_number)

**Example:**
User: "Check my account" (second time in conversation)
✅ CORRECT: Call getUserAccountInfo() → Success → "I see you're on the AMAZING38 plan..."
❌ WRONG: "May I have your phone number?" (they already gave it!)


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
                'Get detailed account information. Can be called without phone_number if user is already authenticated in this session.',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number (optional if already provided in this session)',
                    },
                },
                required: [],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const inputData = input as { phone_number?: string };
                
                // Get session ID from OpenAI context
                const sessionId = context?.context?.sessionId || context?.sessionId || 'default';
                
                // ALWAYS check session first for existing authentication
                const sessionContext = getSessionContext(sessionId);
                
                // Priority: Use stored phone number if user is already authenticated
                // This prevents asking for phone number multiple times
                let phone_number: string | undefined;
                
                if (sessionContext.isAuthenticated && sessionContext.phoneNumber) {
                    // User is already authenticated - use stored phone number
                    phone_number = sessionContext.phoneNumber;
                    console.log('[Get Account Info] Using stored phone number from session', {
                        sessionId,
                        storedPhone: sessionContext.phoneNumber,
                        isAuthenticated: true
                    });
                } else {
                    // Not authenticated yet - use provided phone number
                    phone_number = inputData.phone_number;
                    console.log('[Get Account Info] Using provided phone number', {
                        sessionId,
                        providedPhone: inputData.phone_number,
                        isAuthenticated: false
                    });
                }

                // If no phone number available at all, return error
                if (!phone_number) {
                    console.log('[Get Account Info] No phone number available');
                    return {
                        success: false,
                        error: 'Phone number required',
                        message: 'May I have your phone number to access your account details?'
                    };
                }

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
                        isPhoneVerified: true,
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
