/**
 * Plan Upgrade Agent - Handles plan upgrade requests (requires authentication)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from './sampleData';
import mobilePlansData from './plansForLLM.json';
import {
    getSessionContext,
    updateSessionContext,
    getAuthenticationStatus,
} from './sessionContext';

export const planUpgradeAgent = new RealtimeAgent({
    name: 'plan_upgrade_agent',
    voice: 'sage',
    handoffDescription:
        'Handles plan upgrade requests for authenticated customers. Checks current plan, suggests suitable upgrades, and processes upgrade requests.',

    instructions: `
⚠️ CRITICAL RULE #1: NEVER GREET OR ACKNOWLEDGE TRANSFERS ⚠️
DO NOT say: "Hello", "Please hold", "Let me transfer you", "Thank you"
The user has ALREADY been greeted. Jump STRAIGHT to helping.

# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in plan upgrades and migrations.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word, not like a name

# CRITICAL: NO GREETINGS OR ACKNOWLEDGMENTS (ABSOLUTE RULE)

You are an INTERNAL specialist agent. The user has ALREADY been greeted.
You are CONTINUING an existing conversation.

**ABSOLUTE RULES:**
1. NEVER greet - No "Hello", "Hi"
2. NEVER acknowledge transfer
3. NEVER introduce yourself
4. NEVER use transitional phrases

**FORBIDDEN PHRASES:**
❌ "Hello! I can help with upgrades"
❌ "Thank you for being transferred"
❌ "I'm the upgrade specialist"
❌ "Let me help you with that"

**CORRECT RESPONSE:**
User: "I want to upgrade my plan"
✅ "To help with your upgrade, I'll need to verify your identity. May I have your phone number please?"

**REMEMBER:** Jump STRAIGHT to helping. Check authentication and proceed immediately.

# Core Responsibilities
- Help customers upgrade their current plans
- Suggest suitable upgrade options based on their needs
- Explain upgrade benefits and pricing differences
- Process upgrade requests (with proper confirmation)
- Require authentication before processing upgrades

# Authentication Requirement
**CRITICAL AUTHENTICATION FLOW:**

1. **First, try checkCurrentPlan** (no parameters needed)
   - This automatically checks if user is already authenticated in session
   - If successful → User is authenticated, proceed with upgrade options
   - If returns requiresAuth → User needs authentication

2. **If user needs authentication:**
   - Ask for their phone number politely
   - Call authenticateUser with the phone number
   - This will store authentication in session context for ALL agents
   - Once authenticated, the session persists across agent handoffs

3. **Session Context Benefits:**
   - Authentication is stored and shared across all agents
   - User won't need to re-authenticate when transferred to other agents
   - Phone number is automatically available for subsequent operations

**Example Flow:**
- User: "I want to upgrade my plan"
- Agent: [Calls checkCurrentPlan]
- If authenticated → "I see you're on PLUS 38. Let me show you upgrade options..."
- If not authenticated → "To help with your upgrade, may I have your phone number please?"
- User provides phone → [Call authenticateUser] → Now authenticated for entire session

# Anti-Hallucination Guardrails (CRITICAL)
- ONLY use actual plan data from the tools
- NEVER invent plan names, prices, or features
- Always calculate accurate price differences
- If unsure about upgrade eligibility, offer to connect with a specialist
- NEVER process upgrades without explicit confirmation

# Voice Optimization
- Keep responses SHORT and conversational (2-3 sentences max)
- Use simple comparisons when explaining upgrades
- Confirm key details before processing
- Examples:
  - "I see you're on the PLUS 38 plan. Would you like to upgrade to get more data?"
  - "The PLUS 48 plan gives you 70 more gigabytes for just 10 ringgit more per month"
  - "To confirm, you want to upgrade from PLUS 38 to PLUS 48, correct?"

# Upgrade Process Flow
1. Check Authentication Status
   - Verify user is authenticated
   - If not, request authentication first

2. Get Current Plan
   - Retrieve user's current plan details
   - Identify upgrade possibilities

3. Suggest Upgrades
   - Based on current plan and user needs
   - Present 2-3 suitable options
   - Focus on benefits and value

4. Confirm Upgrade
   - **ONLY after presenting a SPECIFIC plan upgrade option**
   - Present ONE specific upgrade option clearly with exact plan names
   - Ask: "To confirm, you want to upgrade from [CURRENT] to [NEW] for [PRICE] ringgit per month, correct?"
   - **ONLY call processUpgrade if:**
     * You just asked about upgrading to a SPECIFIC plan
     * User responds with YES/CONFIRMED/PROCEED/OKAY to that specific upgrade question
   - **DO NOT call processUpgrade if:**
     * You asked about supplementary services, other options, or general questions
     * User said "yes" to something OTHER than a specific plan upgrade
     * You haven't mentioned a specific new plan name yet
   - DO NOT ask for confirmation multiple times
   - DO NOT repeat the same question if user already confirmed

# Handling Common Scenarios

## "I want to upgrade my plan"
1. Check authentication status
2. Get current plan information
3. Ask about their needs: "What would you like more of? Data, international calls, or other features?"
4. Suggest 2-3 suitable upgrades

## "What upgrades are available for me?"
1. Verify authentication
2. Get current plan
3. Present upgrade options that make sense
4. Example: "From your PLUS 38 plan, you could upgrade to PLUS 48 for more data, or PLUS 68 for unlimited high-speed data"

## "I need more data"
1. Check current plan and data allocation
2. Find plans with more data
3. Present options with clear benefits
4. "The PLUS 48 plan would give you 250 gigabytes instead of 180, for just 10 ringgit more"

## Price-Sensitive Customers
- Always mention the price difference clearly
- Highlight the value proposition
- "For 10 ringgit more, you get 70 extra gigabytes - that's great value"

## CRITICAL: When to Call processUpgrade vs When NOT To

### ✅ CORRECT - Call processUpgrade:
**Scenario 1:**
- Agent: "To confirm, you want to upgrade from AMAZING38 to postpaidPLUS48 for 48 ringgit per month, correct?"
- User: "yes"
- Action: ✅ Call processUpgrade(current_plan: "AMAZING38", new_plan: "postpaidPLUS48", new_price: 48)

**Scenario 2:**
- Agent: "Would you like to upgrade to PLUS48 for 10 ringgit more?"
- User: "confirmed"
- Action: ✅ Call processUpgrade

### ❌ WRONG - DO NOT Call processUpgrade:
**Scenario 1:**
- Agent: "Would you like help with supplementary services instead?"
- User: "yes"
- Action: ❌ DO NOT call processUpgrade (user wants supplementary services, NOT a plan upgrade)

**Scenario 2:**
- Agent: "I can show you some options. Interested?"
- User: "yes"
- Action: ❌ DO NOT call processUpgrade (user just wants to see options, hasn't chosen a specific plan yet)

**Scenario 3:**
- Agent: "The options start at 48 MYR. Would you like to check other alternatives?"
- User: "yes"
- Action: ❌ DO NOT call processUpgrade (user wants to explore alternatives, not commit to an upgrade)

# Error Handling
- If not authenticated: "I'll need to verify your identity first to help with plan upgrades"
- If upgrade not possible: "Your current plan is already our highest tier. Would you like to add supplementary services instead?"
- If system error: "I'm having trouble processing that. Let me connect you with a specialist"

# Important Rules
- REQUIRE authentication for all upgrades
- ALWAYS confirm before processing (ask ONCE)
- **CRITICAL**: When user confirms (yes/confirmed/proceed/okay/ja), IMMEDIATELY call processUpgrade - DO NOT ask again
- Present clear price differences
- Focus on customer benefits
- Keep responses SHORT for voice
- Support English, Malay, and Mandarin
- Recognize affirmative responses in multiple languages: yes, ya, yeah, confirmed, proceed, okay, ja (German/Dutch), oui (French)
`,

    tools: [
        tool({
            name: 'authenticateUser',
            description:
                'Authenticate a user by their phone number and store authentication in session context. Use this when user is not yet authenticated.',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number for authentication',
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
                    // Get user account information to verify phone number exists
                    const accountInfo = getUserByMobile(phone_number);

                    // Update session context with authentication data
                    updateSessionContext(sessionId, {
                        phoneNumber: phone_number,
                        accountId: accountInfo.account.accountId,
                        userName: accountInfo.customer.name,
                        isAuthenticated: true,
                        isPhoneVerified: true,
                        lastActivity: Date.now(),
                    });
                    
                    console.log('[Plan Upgrade Agent - Authentication]', { 
                        sessionId, 
                        userName: accountInfo.customer.name,
                        accountId: accountInfo.account.accountId 
                    });

                    return {
                        success: true,
                        authenticated: true,
                        userName: accountInfo.customer.name,
                        accountId: accountInfo.account.accountId,
                        message: `Authentication successful for ${accountInfo.customer.name}`,
                    };
                } catch (error) {
                    return {
                        success: false,
                        authenticated: false,
                        error: 'Failed to authenticate user. Please verify the phone number.',
                    };
                }
            },
        }),

        tool({
            name: 'checkCurrentPlan',
            description:
                'Check the authenticated user\'s current plan details. This tool automatically retrieves the phone number from the session context for authenticated users.',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                // Get session ID from context
                const sessionId = context?.context?.sessionId || context?.sessionId;
                
                if (!sessionId) {
                    return {
                        success: false,
                        error: 'No session ID found',
                    };
                }
                
                try {
                    // Get session context to retrieve phone number
                    const sessionContext = getSessionContext(sessionId);
                    
                    // Check authentication status
                    const authStatus = getAuthenticationStatus(sessionId);
                    if (!authStatus.isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated. Please authenticate first.',
                            requiresAuth: true,
                        };
                    }

                    // Get phone number from session context
                    const phoneNumber = sessionContext.phoneNumber;
                    if (!phoneNumber) {
                        return {
                            success: false,
                            error: 'Phone number not found in session. Please authenticate again.',
                            requiresAuth: true,
                        };
                    }

                    // Get user account information
                    const accountInfo = getUserByMobile(phoneNumber);
                    
                    // Extract current plan details
                    const currentPlan = {
                        name: accountInfo.plan.planName,
                        monthlyPrice: accountInfo.plan.planAmount.value,
                        data: accountInfo.plan.defaultSubscribedServices.find((service: any) => service.name === 'redDATA')?.amount || 0,
                        contractEndDate: accountInfo.contract.contractEnd,
                        status: accountInfo.account.status,
                    };

                    return {
                        success: true,
                        currentPlan: currentPlan,
                        accountId: accountInfo.account.accountId,
                        userName: authStatus.userName || accountInfo.customer.name,
                        phoneNumber: phoneNumber,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve current plan information',
                    };
                }
            },
        }),

        tool({
            name: 'getUpgradeOptions',
            description:
                'Get available upgrade options based on current plan',
            parameters: {
                type: 'object',
                properties: {
                    current_plan_name: {
                        type: 'string',
                        description: 'Name of the current plan',
                    },
                    current_price: {
                        type: 'number',
                        description: 'Current monthly price',
                    },
                    preference: {
                        type: 'string',
                        enum: ['more_data', 'unlimited', 'family', 'any'],
                        description: 'User preference for upgrade',
                    },
                },
                required: ['current_plan_name', 'current_price'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { current_plan_name, current_price, preference = 'any' } = input as {
                    current_plan_name: string;
                    current_price: number;
                    preference?: string;
                };

                try {
                    // Get all plans from the data
                    const allPlans = mobilePlansData.plans;
                    
                    // Filter for upgrade options (higher price than current)
                    let upgradeOptions = allPlans.filter((plan: any) => 
                        plan.monthlyPrice > current_price
                    );

                    // Apply preference filter if specified
                    if (preference === 'more_data') {
                        upgradeOptions = upgradeOptions.filter((plan: any) => {
                            const dataStr = typeof plan.data === 'object' ? JSON.stringify(plan.data) : String(plan.data || '');
                            return dataStr && !dataStr.includes('unlimited');
                        });
                    } else if (preference === 'unlimited') {
                        upgradeOptions = upgradeOptions.filter((plan: any) => {
                            const dataStr = typeof plan.data === 'object' ? JSON.stringify(plan.data) : String(plan.data || '');
                            return dataStr && dataStr.toLowerCase().includes('unlimited');
                        });
                    } else if (preference === 'family') {
                        upgradeOptions = upgradeOptions.filter((plan: any) => 
                            plan.name.toLowerCase().includes('family') ||
                            (plan.tagline && plan.tagline.toLowerCase().includes('family'))
                        );
                    }

                    // Sort by price (lowest upgrade first)
                    upgradeOptions.sort((a, b) => a.monthlyPrice - b.monthlyPrice);

                    // Take top 3 options
                    const topOptions = upgradeOptions.slice(0, 3).map((plan: any) => ({
                        name: plan.name,
                        monthlyPrice: plan.monthlyPrice,
                        priceDifference: plan.monthlyPrice - current_price,
                        data: typeof plan.data === 'object' ? plan.data : { total: plan.data || 'N/A' },
                        calls: plan.voice || 'Unlimited',
                        features: plan.sms || 'Unlimited SMS',
                        benefits: plan.tagline || '',
                    }));

                    return {
                        success: true,
                        currentPlan: current_plan_name,
                        currentPrice: current_price,
                        upgradeOptions: topOptions,
                        totalOptions: upgradeOptions.length,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve upgrade options',
                    };
                }
            },
        }),

        tool({
            name: 'processUpgrade',
            description:
                'Process the plan upgrade after user has confirmed. Call this when user says yes, confirmed, proceed, or any affirmative response to the upgrade confirmation.',
            parameters: {
                type: 'object',
                properties: {
                    current_plan: {
                        type: 'string',
                        description: 'Current plan name',
                    },
                    new_plan: {
                        type: 'string',
                        description: 'New plan name to upgrade to',
                    },
                    new_price: {
                        type: 'number',
                        description: 'New monthly price',
                    },
                },
                required: ['current_plan', 'new_plan', 'new_price'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { current_plan, new_plan, new_price } = input as {
                    current_plan: string;
                    new_plan: string;
                    new_price: number;
                };

                // Get session ID
                const sessionId = context?.context?.sessionId || context?.sessionId;

                if (!sessionId) {
                    return {
                        success: false,
                        error: 'No session ID found',
                    };
                }

                try {
                    // Get session context
                    const sessionContext = getSessionContext(sessionId);
                    
                    // Verify authentication
                    const authStatus = getAuthenticationStatus(sessionId);
                    if (!authStatus.isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated',
                            requiresAuth: true,
                        };
                    }

                    // Get phone number from session
                    const phone_number = sessionContext.phoneNumber;
                    if (!phone_number) {
                        return {
                            success: false,
                            error: 'Phone number not found in session',
                            requiresAuth: true,
                        };
                    }

                    // Simulate upgrade process
                    // In real implementation, this would call backend API
                    const upgradeResult = {
                        success: true,
                        upgradeId: `UPG-${Date.now()}`,
                        fromPlan: current_plan,
                        toPlan: new_plan,
                        newMonthlyPrice: new_price,
                        effectiveDate: new Date().toISOString().split('T')[0],
                        message: `Successfully upgraded from ${current_plan} to ${new_plan}`,
                    };

                    // Update session context
                    const sessionData = getSessionContext(sessionId);
                    if (sessionData) {
                        updateSessionContext(sessionId, {
                            ...sessionData,
                            lastActivity: Date.now(),
                        });
                    }

                    return upgradeResult;
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to process upgrade. Please try again or contact support.',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
