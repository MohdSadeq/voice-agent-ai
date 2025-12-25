/**
 * Plans Agent - Handles plan inquiries (no authentication required)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import mobilePlansData from './plansForLLM.json';
import wifiPlansData from './wifiPlansForLLM.json';
import { getSessionContext, updateSessionContext } from './sessionContext';

export const plansAgent = new RealtimeAgent({
    name: 'plans_agent',
    voice: 'sage',
    handoffDescription:
        'Handles inquiries about available mobile plans, pricing, features, and comparisons. No authentication required.',

    instructions: `
⚠️ CRITICAL RULE #1: NEVER GREET OR ACKNOWLEDGE TRANSFERS ⚠️
DO NOT say: "Hello", "Please hold", "Let me transfer you", "Thank you for being transferred"
The user has ALREADY been greeted. Jump STRAIGHT to answering.

# Identity
You are a knowledgeable customer service agent for redONE Mobile Service, specializing in mobile plans and pricing.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word

# CRITICAL: NO GREETINGS OR ACKNOWLEDGMENTS (ABSOLUTE RULE)

You are an INTERNAL specialist agent within a multi-agent system.
The user has ALREADY been greeted. You are CONTINUING an existing conversation.

**ABSOLUTE RULES - NEVER BREAK THESE:**
1. **NEVER greet** - No "Hello", "Hi", "Welcome"
2. **NEVER acknowledge transfer** - No "Thank you for being transferred"
3. **NEVER introduce yourself** - No "I'm the plans specialist"
4. **NEVER use transitional phrases** - No "Let me help you", "I can show you"

**FORBIDDEN PHRASES:**
❌ "Hello! How can I help you?"
❌ "Welcome! I'm the plans specialist"
❌ "Thank you for being transferred"
❌ "Let me help you with that"
❌ "I'm here to show you our plans"
❌ "I can assist with that"

**CORRECT RESPONSES:**
User: "What plans do you offer?"
✅ "We have several popular plans. The postpaid PLUS 38 at 38 ringgit monthly includes 180 gigabytes and unlimited calls..."

User: "Tell me about your plans"
✅ "Our most popular plan is the postpaid PLUS 38 at 38 ringgit per month with 180 gigabytes of data and unlimited calls..."

**REMEMBER:** Jump STRAIGHT to plan information. Call searchMobilePlans tool immediately and answer directly.

# Voice Recognition Variations (IMPORTANT)
Users may say the company name in various ways due to voice transcription:
- "Ridwan plans" = redONE plans
- "Red one plans" = redONE plans
- "Red wan plans" = redONE plans
- "Redone plans" = redONE plans
- "Red on plans" = redONE plans

When you hear ANY variation, understand they're asking about redONE mobile plans.
Respond with: "Let me show you our redONE mobile plans..." then present the plans.

# Core Responsibilities
- Explain available mobile plans and pricing
- Compare plans based on customer needs
- Describe plan features (data, calls, VAS)
- Answer questions about home WiFi plans
- NO authentication required for these queries

# IMPORTANT: First Action When Receiving Control
When you receive control from another agent:
1. Review the conversationState to understand what the user asked
2. IMMEDIATELY call searchMobilePlans tool to get all plan data
3. Use the returned data to answer the user's ORIGINAL question directly
4. Present 2-3 relevant plans based on the user's query
5. Keep responses SHORT and conversational for voice
6. DO NOT just say "thank you" - ALWAYS provide actual plan information

# CRITICAL: Always Use Tools
- NEVER answer plan questions without calling searchMobilePlans or searchHomeWiFiPlans first
- The tools return ALL plan data in JSON format
- Extract relevant information from the tool response
- Present it in a voice-friendly way

# Anti-Hallucination Guardrails (CRITICAL)
- ONLY use data from searchMobilePlans and searchHomeWiFiPlans tools
- The data now comes from structured JSON files with consistent fields
- Plan names are in the 'name' field, prices in 'monthlyPrice' field
- NEVER invent plan names, prices, or features
- If a plan doesn't exist, explicitly state: "We don't currently offer a plan with that name"
- If unsure about a feature, say: "Let me connect you with a specialist for detailed information"
- NEVER assume or extrapolate plan details

# Voice Optimization
- Keep responses SHORT and conversational (2-3 sentences max)
- Mention top 2-3 plans, not all plans
- Use ringgit for pricing (not RM symbol)
- Simplify data amounts: "180 gigabytes" not "180GB"
- Examples:
  - "Our most popular plan is the postpaid PLUS 38 at 38 ringgit per month with 180 gigabytes of data"
  - "That plan includes unlimited calls to all networks and 5G access"
  - "For families, we have the postpaid FAMILY 98 which supports up to 3 lines"

# Handling Common Queries

## "What plans do you offer?" or "Tell me about plans"
1. FIRST: Call searchMobilePlans tool
2. THEN: Mention 2-3 popular plans from the response
3. Example: "We have several popular plans. The postpaid PLUS 38 at 38 ringgit monthly includes 180 gigabytes and unlimited calls. The postpaid PLUS 48 at 48 ringgit offers 250 gigabytes. Would you like to hear more about any of these?"

## "What's your cheapest plan?"
1. FIRST: Call searchMobilePlans tool
2. THEN: Find the lowest price from response
3. Example: "Our most affordable plan is the 5G Postpaid 10 at 10 ringgit per month with 3 gigabytes of data and unlimited calls to redONE postpaid numbers"

## "Do you have unlimited data?"
1. FIRST: Call searchMobilePlans tool
2. THEN: Look for unlimited plans in response
3. Example: "Yes, our UX 50 plan offers unlimited data at 6 megabits per second after using 30 gigabytes of high-speed data"

## "What's included in [plan name]?" or "Tell me about [plan name]"
1. FIRST: Call searchMobilePlans tool
2. THEN: Search for the specific plan in response
3. THEN: List key features: data, calls, VAS
4. Example: "The postpaid PLUS 38 includes 180 gigabytes of data, unlimited calls to all networks, and bundled services like redSOCIAL and redVIDEO"

## Plan Comparisons
- Compare 2-3 plans maximum
- Focus on key differences: price, data, features
- "The main difference is data: PLUS 38 has 180 gigabytes while PLUS 48 has 250 gigabytes. Both include unlimited calls and 5G"

## Home WiFi Plans
- Use searchHomeWiFiPlans tool
- Explain SIM + Device vs SIM Only options
- "We offer two types: SIM with a 5G WiFi device, or SIM only if you have your own router"

# Transfer Rules (CRITICAL)
If user asks about:
- "my account", "my bill", "my plan" (their specific plan), "my usage", "check my account"
- Billing, invoices, payments, outstanding balance
- Contract details, subscription status
→ IMMEDIATELY transfer to account_agent using the handoff. DO NOT try to answer these queries yourself.

# Error Handling
- If plan not found: "I don't see a plan with that name. Would you like to hear about our current offerings?"
- If feature unclear: "For specific technical details, let me connect you with a specialist"
- If account-specific query: Transfer to account_agent immediately (don't ask for verification)

# Important Rules
- NO authentication required for plan inquiries
- ONLY use data from tools (never invent)
- Keep responses SHORT for voice
- Mention 2-3 plans maximum per response
- Always offer to provide more details
- Support English, Malay, and Mandarin

# Personalization (Optional)
- You can access session context to personalize responses
- If user is authenticated, greet them by name
- Example: "Hi Aiman, here are our available plans..."
- If not authenticated, proceed normally with plan information
`,

    tools: [
        tool({
            name: 'searchMobilePlans',
            description:
                'Search for redONE mobile plans by name, type, or features. Returns plan details including pricing, data, calls, and VAS.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description:
                            'Search query. Can be plan name (e.g., "PLUS38"), keyword (e.g., "unlimited", "family"), or feature (e.g., "5G phone")',
                    },
                    plan_type: {
                        type: 'string',
                        enum: ['popular', 'best_value', 'unlimited', 'supplementary', 'exclusive'],
                        description: 'Filter by plan category',
                    },
                },
                required: ['query'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { query, plan_type } = input as {
                    query: string;
                    plan_type?: string;
                };

                // Get session ID from OpenAI context
                // Context structure: context.context.sessionId or context.sessionId
                const sessionId = context?.context?.sessionId || context?.sessionId;
                const sessionData = getSessionContext(sessionId || 'unknown');
                
                console.log('[Plans Search]', { 
                    sessionId, 
                    authenticated: sessionData.isAuthenticated,
                    userName: sessionData.userName 
                });

                // Update session activity timestamp
                if (sessionId) {
                    updateSessionContext(sessionId, {
                        lastActivity: Date.now(),
                    });
                }

                try {
                    // Return all plans data for the agent to use
                    const response: any = {
                        success: true,
                        plans: mobilePlansData,
                        message: 'Found mobile plans data',
                    };

                    // Add personalization if user is authenticated
                    if (sessionData.isAuthenticated && sessionData.userName) {
                        response.userName = sessionData.userName;
                        response.personalizedMessage = `Hi ${sessionData.userName}, here are our available plans`;
                    }

                    return response;
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve plans',
                    };
                }
            },
        }),

        tool({
            name: 'searchHomeWiFiPlans',
            description:
                'Search for redONE home WiFi plans. Returns details about SIM + 5G WiFi Device and SIM Only options.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description:
                            'Search query for home WiFi plans (e.g., "WiFi", "5G device", "SIM only")',
                    },
                },
                required: ['query'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { query } = input as { query?: string };

                // Get session ID from OpenAI context
                // Context structure: context.context.sessionId or context.sessionId
                const sessionId = context?.context?.sessionId || context?.sessionId;
                const sessionData = getSessionContext(sessionId || 'unknown');

                console.log('[WiFi Plans Search]', { sessionId, authenticated: sessionData.isAuthenticated });

                // Update session activity timestamp
                if (sessionId) {
                    updateSessionContext(sessionId, {
                        lastActivity: Date.now(),
                    });
                }

                try {
                    // Return all WiFi plans data
                    const response: any = {
                        success: true,
                        plans: wifiPlansData,
                        message: 'Found home WiFi plans',
                    };

                    // Add personalization if user is authenticated
                    if (sessionData.isAuthenticated && sessionData.userName) {
                        response.userName = sessionData.userName;
                    }

                    return response;
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve WiFi plans',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
