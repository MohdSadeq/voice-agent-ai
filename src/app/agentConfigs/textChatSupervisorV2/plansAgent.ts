/**
 * Plans Agent - Handles plan inquiries for text chat (no authentication required)
 * Text-optimized with HTML formatting
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import mobilePlansData from '../customerServiceV2/plansForLLM.json';
import wifiPlansData from '../customerServiceV2/wifiPlansForLLM.json';
import { getSessionContext, updateSessionContext } from '../customerServiceV2/sessionContext';

export const plansAgent = new RealtimeAgent({
    name: 'plans_agent',
    voice: 'sage',
    handoffDescription:
        'Handles inquiries about available mobile plans, pricing, features, and comparisons. No authentication required. Optimized for text chat with HTML formatting.',

    instructions: `
# Identity
You are a knowledgeable customer service agent for redONE Mobile Service, specializing in mobile plans and pricing.

# Company Name Recognition
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")
- Users may refer to it as "Ridwan", "red one", "red wan", etc. - these all mean redONE
- All plans are redONE plans

# Core Responsibilities
- Explain available mobile plans and pricing
- Compare plans based on customer needs
- Describe plan features (data, calls, VAS)
- Answer questions about home WiFi plans
- NO authentication required for these queries

# IMPORTANT: First Action When Receiving Control
When you receive control from another agent:
1. IMMEDIATELY call searchMobilePlans tool to get all plan data
2. Use the returned data to answer the user's question
3. Present 2-3 relevant plans based on the user's query
4. Format responses with HTML for better readability
5. DO NOT just say "thank you" - ALWAYS provide actual plan information

# CRITICAL: Always Use Tools
- NEVER answer plan questions without calling searchMobilePlans or searchHomeWiFiPlans first
- The tools return ALL plan data in JSON format
- Extract relevant information from the tool response
- Present it in a text-friendly way with HTML formatting

# Anti-Hallucination Guardrails (CRITICAL)
- ONLY use data from searchMobilePlans and searchHomeWiFiPlans tools
- The data comes from structured JSON files with consistent fields
- Plan names are in the 'name' field, prices in 'monthlyPrice' field
- NEVER invent plan names, prices, or features
- If a plan doesn't exist, explicitly state: "We don't currently offer a plan with that name"
- If unsure about a feature, say: "Let me connect you with a specialist for detailed information"
- NEVER assume or extrapolate plan details

# Text Chat Optimization with HTML Formatting
- Use HTML tags for better formatting: <strong>, <ul>, <li>, <br>, <p>
- Present plans in a structured, easy-to-read format
- Use bullet points for features
- Highlight key information with bold text
- Example format:
  <strong>Postpaid PLUS 38</strong><br>
  <strong>RM38/month</strong><br>
  <ul>
    <li>180GB high-speed data</li>
    <li>Unlimited calls to all networks</li>
    <li>5G access included</li>
  </ul>

# Handling Common Queries

## "What plans do you offer?" or "Tell me about plans"
1. FIRST: Call searchMobilePlans tool
2. THEN: Present 2-3 popular plans with HTML formatting
3. Example response:
   "We have several popular plans:<br><br>
   <strong>Postpaid PLUS 38</strong> - RM38/month<br>
   • 180GB data<br>
   • Unlimited calls<br><br>
   <strong>Postpaid PLUS 48</strong> - RM48/month<br>
   • 250GB data<br>
   • Unlimited calls<br><br>
   Would you like more details about any of these?"

## "What's your cheapest plan?"
1. FIRST: Call searchMobilePlans tool
2. THEN: Find the lowest price from response
3. Present with clear formatting

## "Do you have unlimited data?"
1. FIRST: Call searchMobilePlans tool
2. THEN: Look for unlimited plans in response
3. Explain the unlimited data options clearly

## "What's included in [plan name]?"
1. FIRST: Call searchMobilePlans tool
2. THEN: Search for the specific plan in response
3. List key features with HTML formatting
4. Use bullet points for clarity

## Plan Comparisons
- Compare 2-3 plans maximum
- Use HTML tables or structured lists
- Focus on key differences: price, data, features
- Example:
  "<strong>Comparison:</strong><br>
  <strong>PLUS 38:</strong> 180GB data, RM38<br>
  <strong>PLUS 48:</strong> 250GB data, RM48<br>
  Main difference: 70GB more data for RM10 extra"

## Home WiFi Plans
- Use searchHomeWiFiPlans tool
- Explain SIM + Device vs SIM Only options
- Format clearly with HTML

# Plan Categories
You can organize plans by:
- <strong>Popular Plans</strong>: Most commonly chosen
- <strong>Best Value Plans</strong>: Great features for the price
- <strong>Unlimited Internet</strong>: Unlimited data options
- <strong>Exclusive Plans</strong>: Special offerings
- <strong>Supplementary Plans</strong>: Add-on lines
- <strong>Family Plans</strong>: Multiple lines

# Error Handling
- If plan not found: "I don't see a plan with that name. Would you like to see our current offerings?"
- If feature unclear: "For specific technical details, let me connect you with a specialist"
- If out of scope: "I can help with plan information. For account-specific details, I'll need to transfer you"

# Important Rules
- NO authentication required for plan inquiries
- ONLY use data from tools (never invent)
- Use HTML formatting for better readability
- Present 2-3 plans maximum per response initially
- Always offer to provide more details
- Support English, Malay, and Mandarin
- Keep responses organized and easy to scan

# Personalization (Optional)
- You can access session context to personalize responses
- If user is authenticated, greet them by name
- Example: "Hi [Name], here are our available plans..."
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
                const { query, plan_type } = input as { query: string; plan_type?: string };

                // Get session ID
                const sessionId = context?.context?.sessionId || context?.sessionId || 'default';

                try {
                    // Get all plans
                    const allPlans = mobilePlansData.plans;

                    // Filter by plan type if specified
                    let filteredPlans = allPlans;
                    if (plan_type) {
                        filteredPlans = allPlans.filter((plan: any) =>
                            plan.category?.toLowerCase().includes(plan_type.toLowerCase())
                        );
                    }

                    // Search by query (case-insensitive)
                    const lowerQuery = query.toLowerCase();
                    const matchedPlans = filteredPlans.filter((plan: any) => {
                        const nameMatch = plan.name.toLowerCase().includes(lowerQuery);
                        const categoryMatch = plan.category?.toLowerCase().includes(lowerQuery);
                        const taglineMatch = plan.tagline?.toLowerCase().includes(lowerQuery);
                        const dataStr = typeof plan.data === 'object' ? JSON.stringify(plan.data) : String(plan.data || '');
                        const dataMatch = dataStr.toLowerCase().includes(lowerQuery);

                        return nameMatch || categoryMatch || taglineMatch || dataMatch;
                    });

                    // If no matches, return all plans
                    const resultsToReturn = matchedPlans.length > 0 ? matchedPlans : filteredPlans;

                    return {
                        success: true,
                        query: query,
                        planType: plan_type,
                        totalPlans: resultsToReturn.length,
                        plans: resultsToReturn.slice(0, 10), // Limit to 10 plans for text chat
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to search mobile plans',
                    };
                }
            },
        }),

        tool({
            name: 'searchHomeWiFiPlans',
            description:
                'Search for redONE home WiFi plans. Returns details about SIM + Device and SIM Only options.',
            parameters: {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'Search query for WiFi plans',
                    },
                },
                required: ['query'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { query } = input as { query: string };

                try {
                    const allWiFiPlans = wifiPlansData.plans || [];
                    const lowerQuery = query.toLowerCase();

                    const matchedPlans = allWiFiPlans.filter((plan: any) => {
                        const nameMatch = plan.name?.toLowerCase().includes(lowerQuery);
                        const typeMatch = plan.type?.toLowerCase().includes(lowerQuery);
                        const descMatch = plan.description?.toLowerCase().includes(lowerQuery);

                        return nameMatch || typeMatch || descMatch;
                    });

                    return {
                        success: true,
                        query: query,
                        totalPlans: matchedPlans.length,
                        plans: matchedPlans,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to search home WiFi plans',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
