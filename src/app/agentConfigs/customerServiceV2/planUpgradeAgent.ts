/**
 * Plan Upgrade Agent - Handles plan upgrade requests (requires authentication)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from './sampleData';
import mobilePlansData from './plansForLLM.json';
import {
    formatPhoneForVoice,
    normalizePhoneNumber,
    createConfirmationMessage,
    isValidPhoneNumber,
    createErrorMessage,
} from './utils';
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
# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in plan upgrades and migrations.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word, not like a name

# Core Responsibilities
- Help customers upgrade their current plans
- Suggest suitable upgrade options based on their needs
- Explain upgrade benefits and pricing differences
- Process upgrade requests (with proper confirmation)
- Require authentication before processing upgrades

# Authentication Requirement
- ALWAYS verify user identity before discussing upgrade options
- Use session context to check authentication status
- If not authenticated, explain that you need to verify their identity first

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
   - Get explicit confirmation
   - Repeat plan name and new monthly cost
   - Process the upgrade

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

# Error Handling
- If not authenticated: "I'll need to verify your identity first to help with plan upgrades"
- If upgrade not possible: "Your current plan is already our highest tier. Would you like to add supplementary services instead?"
- If system error: "I'm having trouble processing that. Let me connect you with a specialist"

# Important Rules
- REQUIRE authentication for all upgrades
- ALWAYS confirm before processing
- Present clear price differences
- Focus on customer benefits
- Keep responses SHORT for voice
- Support English, Malay, and Mandarin
`,

    tools: [
        tool({
            name: 'checkCurrentPlan',
            description:
                'Check the authenticated user\'s current plan details',
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
                
                // Get session ID from context
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;
                
                try {
                    // Check authentication status
                    const isAuthenticated = getAuthenticationStatus(sessionId);
                    if (!isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated',
                            requiresAuth: true,
                        };
                    }

                    // Get user account information
                    const accountInfo = getUserByMobile(phone_number);
                    
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
                        userName: accountInfo.customer.name,
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
                'Process the plan upgrade after user confirmation',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number',
                    },
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
                    confirmed: {
                        type: 'boolean',
                        description: 'User confirmation status',
                    },
                },
                required: ['phone_number', 'current_plan', 'new_plan', 'new_price', 'confirmed'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { phone_number, current_plan, new_plan, new_price, confirmed } = input as {
                    phone_number: string;
                    current_plan: string;
                    new_plan: string;
                    new_price: number;
                    confirmed: boolean;
                };

                // Get session ID
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;

                try {
                    // Verify authentication
                    const isAuthenticated = getAuthenticationStatus(sessionId);
                    if (!isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated',
                            requiresAuth: true,
                        };
                    }

                    // Check confirmation
                    if (!confirmed) {
                        return {
                            success: false,
                            error: 'Upgrade not confirmed by user',
                            requiresConfirmation: true,
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
