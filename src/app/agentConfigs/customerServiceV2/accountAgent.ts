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
The user has ALREADY been greeted. Jump STRAIGHT to helping.

⚠️ CRITICAL RULE #2: ALWAYS CHECK AUTHENTICATION STATUS FIRST ⚠️

**MANDATORY FIRST ACTION - NO EXCEPTIONS:**
When you receive control (after handoff or user query):
1. **IMMEDIATELY call getUserAccountInfo() with NO parameters** - Do this BEFORE saying anything
2. **If tool returns success** → User is already authenticated
   - Provide the information they requested immediately
   - Example: "Your current balance is 150 MYR" or "Your outstanding balance is 55.08 MYR"
3. **If tool returns authentication error** → User needs authentication
   - Then ask: "For security, may I have your phone number please?"

**CRITICAL RULES:**
- ✅ ALWAYS call getUserAccountInfo() first, even if user says "hi" or "hello"
- ❌ NEVER ask for phone number without calling getUserAccountInfo() first
- ❌ NEVER assume user is not authenticated
- Users are often already authenticated from another agent (plan upgrade, termination, etc.)

**Example Flow After Handoff:**
User: [Transferred from plan upgrade agent] "I want to check my bill"
Agent: [Calls getUserAccountInfo()] → Success → "Your outstanding balance is 55.08 MYR"
✅ NO authentication needed - user was already authenticated!

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

# ⚠️ CRITICAL FIRST ACTION: ALWAYS CHECK AUTHENTICATION FIRST ⚠️
**BEFORE asking for phone number or NRIC:**
1. **IMMEDIATELY call getUserAccountInfo() without any parameters**
2. If it succeeds → User is already authenticated, provide the information they requested
3. If it fails with authentication error → THEN ask for phone number

**DO NOT ask for phone number without calling getUserAccountInfo() first!**
This prevents asking users to re-authenticate when they're already authenticated.

# CRITICAL: Two-Factor Authentication (Phone + NRIC)
**Account access requires BOTH phone number AND last 4 digits of NRIC for security.**

## Authentication Flow (Do this ONCE per session):

1. **First, check if already authenticated:**
   - Call getUserAccountInfo() without parameters
   - If successful → User is fully authenticated, provide account info immediately
   - If error → Proceed to authentication steps below

2. **If not authenticated, verify identity in TWO steps:**
   
   **Step 1 - Phone Verification:**
   - Ask: "For security, may I have your phone number please?"
   - **CRITICAL: Wait for user to provide a phone number (10-11 digits)**
   - **If user says something else (e.g., "hello", "good morning", "hi")**: Say "I need your phone number to verify your identity. Please provide your phone number."
   - **NEVER make up or assume a phone number!**
   - Once user provides phone number, repeat back for confirmation: "Thank you. Just to confirm, that's [repeat digits], correct?"
   - Wait for user confirmation (yes/correct/that's right)
   - Call verifyPhoneNumber(phone_number)
   - If successful → Proceed to Step 2
   
   **Step 2 - NRIC Verification:**
   - Ask: "For additional security, may I have the last 4 digits of your NRIC please?"
   - Call verifyNRIC(nric_last_4)
   - If successful → User is now fully authenticated
   - Call getUserAccountInfo() to retrieve account details

3. **Once authenticated:**
   - Authentication persists across the entire session
   - User will NOT be asked again, even after agent handoffs
   - Simply call getUserAccountInfo() without parameters

## Examples:

**First time user (not authenticated):**
User: "What's my account balance?"
Agent: "For security, may I have your phone number please?"
User: "60123456789"
Agent: [Calls verifyPhoneNumber] → "Thank you. For additional security, may I have the last 4 digits of your NRIC?"
User: "5678"
Agent: [Calls verifyNRIC] → [Calls getUserAccountInfo] → "Your current balance is..."

**Second time in same session (already authenticated):**
User: "What's my plan?"
Agent: [Calls getUserAccountInfo] → Success → "You're on the AMAZING38 plan..."
✅ NO re-authentication needed!

**After handoff from another agent (already authenticated there):**
User: [Transferred from plan upgrade agent]
Agent: [Calls getUserAccountInfo] → Success → Provides account info
✅ NO re-authentication needed!

**After handoff - user says "hi" or anything:**
User: "hi"
Agent: [FIRST calls getUserAccountInfo without parameters]
- If success → "You're already authenticated. How can I help with your account?"
- If fails → "For security, may I have your phone number please?"
✅ ALWAYS call getUserAccountInfo first, even if user just says "hi"!

**After handoff - user asks a question:**
User: "what's my balance?"
Agent: [FIRST calls getUserAccountInfo without parameters]
- If success → Provides balance information immediately
- If fails → "For security, may I have your phone number please?"
✅ ALWAYS call getUserAccountInfo first!


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
            name: 'verifyPhoneNumber',
            description:
                'Verify user\'s phone number (Step 1 of authentication). Call this first before NRIC verification.',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number to verify',
                    },
                },
                required: ['phone_number'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { phone_number } = input as { phone_number: string };
                
                // Get session ID from context
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;
                
                try {
                    // Verify phone number exists in the system
                    const accountInfo = getUserByMobile(phone_number);
                    
                    // Update session context with phone verification
                    updateSessionContext(sessionId, {
                        phoneNumber: phone_number,
                        isPhoneVerified: true,
                        accountId: accountInfo.account.accountId,
                        userName: accountInfo.customer.name,
                        lastActivity: Date.now(),
                    });
                    
                    console.log('[Phone Verification Success]', { 
                        sessionId, 
                        phoneNumber: phone_number,
                        userName: accountInfo.customer.name 
                    });

                    return {
                        success: true,
                        phoneVerified: true,
                        userName: accountInfo.customer.name,
                        message: 'Phone number verified successfully. Please provide last 4 digits of NRIC for additional security.',
                        needsNricVerification: true,
                    };
                } catch (error) {
                    return {
                        success: false,
                        phoneVerified: false,
                        error: 'Phone number not found in our system. Please verify and try again.',
                    };
                }
            },
        }),

        tool({
            name: 'verifyNRIC',
            description:
                'Verify user\'s NRIC last 4 digits (Step 2 of authentication). Only call this AFTER phone number is verified.',
            parameters: {
                type: 'object',
                properties: {
                    nric_last_4: {
                        type: 'string',
                        description: 'Last 4 digits of user\'s NRIC',
                    },
                },
                required: ['nric_last_4'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { nric_last_4 } = input as { nric_last_4: string };
                
                // Get session ID from context
                const sessionId = context?.context?.sessionId || context?.sessionId;
                
                if (!sessionId) {
                    return {
                        success: false,
                        error: 'No session found',
                    };
                }
                
                try {
                    // Get session context to check phone verification
                    const sessionContext = getSessionContext(sessionId);
                    
                    if (!sessionContext.isPhoneVerified || !sessionContext.phoneNumber) {
                        return {
                            success: false,
                            error: 'Phone number must be verified first',
                            needsPhoneVerification: true,
                        };
                    }
                    
                    // Get user account to verify NRIC
                    const accountInfo = getUserByMobile(sessionContext.phoneNumber);
                    
                    // Extract last 4 digits of NRIC from account
                    const actualNricLast4 = accountInfo.customer.nric.slice(-4);
                    
                    // Verify NRIC matches
                    if (nric_last_4 === actualNricLast4) {
                        // Update session context with NRIC verification
                        updateSessionContext(sessionId, {
                            nricLast4: nric_last_4,
                            isNricVerified: true,
                            // isAuthenticated will be auto-set to true by updateSessionContext
                            lastActivity: Date.now(),
                        });
                        
                        console.log('[NRIC Verification Success]', { 
                            sessionId,
                            userName: sessionContext.userName,
                            fullyAuthenticated: true
                        });

                        return {
                            success: true,
                            nricVerified: true,
                            fullyAuthenticated: true,
                            message: 'Identity verified successfully. You now have full access to your account information.',
                        };
                    } else {
                        return {
                            success: false,
                            nricVerified: false,
                            error: 'NRIC verification failed. The last 4 digits do not match our records.',
                        };
                    }
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to verify NRIC. Please try again.',
                    };
                }
            },
        }),

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
                
                // Check if user is FULLY authenticated (both phone AND NRIC verified)
                if (sessionContext.isAuthenticated && sessionContext.phoneNumber) {
                    // User is fully authenticated - retrieve account info
                    try {
                        const accountInfo = getUserByMobile(sessionContext.phoneNumber);
                        
                        console.log('[Get Account Info] Using authenticated session', {
                            sessionId,
                            userName: sessionContext.userName,
                            isAuthenticated: true,
                            phoneVerified: sessionContext.isPhoneVerified,
                            nricVerified: sessionContext.isNricVerified
                        });

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
                }
                
                // User is NOT fully authenticated - check what's missing
                const authStatus = getAuthenticationStatus(sessionId);
                
                if (authStatus.needsPhoneVerification) {
                    return {
                        success: false,
                        error: 'Authentication required',
                        message: 'For security, may I have your phone number please?',
                        needsPhoneVerification: true,
                    };
                }
                
                if (authStatus.needsNricVerification) {
                    return {
                        success: false,
                        error: 'NRIC verification required',
                        message: 'For additional security, may I have the last 4 digits of your NRIC please?',
                        needsNricVerification: true,
                    };
                }

                // Fallback - should not reach here
                return {
                    success: false,
                    error: 'Authentication incomplete',
                    message: 'Please complete authentication to access your account.',
                };
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
