/**
 * Plan Upgrade Agent - Handles plan upgrade requests for text chat (requires authentication)
 * Text-optimized with HTML formatting
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from '../customerServiceV2/sampleData';
import mobilePlansData from '../customerServiceV2/plansForLLM.json';
import {
    getSessionContext,
    updateSessionContext,
    getAuthenticationStatus,
} from '../customerServiceV2/sessionContext';

export const planUpgradeAgent = new RealtimeAgent({
    name: 'plan_upgrade_agent',
    voice: 'sage',
    handoffDescription:
        'Handles plan upgrade requests for authenticated customers. Checks current plan, suggests suitable upgrades, and processes upgrade requests. Optimized for text chat with HTML formatting.',

    instructions: `
# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in plan upgrades and migrations.

# Company Name
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")

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

# Text Chat Optimization with HTML Formatting
- Use HTML tags for better formatting: <strong>, <ul>, <li>, <br>, <p>, <table>
- Present upgrade options in a clear, structured format
- Use bullet points for benefits
- Highlight price differences with bold text
- Examples:
  <strong>Upgrade Options:</strong><br><br>
  <strong>1. Postpaid PLUS 48</strong><br>
  • RM48/month (+RM10)<br>
  • 250GB data (+70GB)<br>
  • Unlimited calls<br><br>
  <strong>2. Postpaid PLUS 68</strong><br>
  • RM68/month (+RM30)<br>
  • Unlimited high-speed data<br>
  • Unlimited calls

# Upgrade Process Flow
1. Check Authentication Status
   - Verify user is authenticated
   - If not, request authentication first

2. Get Current Plan
   - Retrieve user's current plan details
   - Identify upgrade possibilities

3. Suggest Upgrades
   - Based on current plan and user needs
   - Present 2-3 suitable options with HTML formatting
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
4. Suggest 2-3 suitable upgrades with HTML formatting

## "What upgrades are available for me?"
1. Verify authentication
2. Get current plan
3. Present upgrade options with clear formatting
4. Example:
   "<strong>Available Upgrades from PLUS 38:</strong><br><br>
   <strong>PLUS 48</strong> - RM48/month<br>
   • 70GB more data<br>
   • Only RM10 extra<br><br>
   <strong>PLUS 68</strong> - RM68/month<br>
   • Unlimited data<br>
   • RM30 extra"

## "I need more data"
1. Check current plan and data allocation
2. Find plans with more data
3. Present options with clear benefits using HTML
4. "The <strong>PLUS 48</strong> plan gives you 250GB instead of 180GB, for just RM10 more per month."

## Price-Sensitive Customers
- Always mention the price difference clearly
- Highlight the value proposition
- Use HTML to emphasize savings:
  "<strong>Great Value:</strong> For RM10 more, you get 70 extra GB - that's excellent value!"

# Error Handling
- If not authenticated: "I'll need to verify your identity first to help with plan upgrades."
- If upgrade not possible: "Your current plan is already our highest tier. Would you like to add supplementary services instead?"
- If system error: "I'm having trouble processing that. Let me connect you with a specialist."

# Important Rules
- REQUIRE authentication for all upgrades
- ALWAYS confirm before processing
- Present clear price differences with HTML formatting
- Focus on customer benefits
- Use structured formatting for readability
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
                        description: 'User\'s mobile number',
                    },
                },
                required: ['phone_number'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { phone_number } = input as { phone_number: string };
                
                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;
                
                try {
                    const isAuthenticated = getAuthenticationStatus(sessionId);
                    if (!isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated',
                            requiresAuth: true,
                        };
                    }

                    const accountInfo = getUserByMobile(phone_number);
                    
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
                    const allPlans = mobilePlansData.plans;
                    
                    let upgradeOptions = allPlans.filter((plan: any) => 
                        plan.monthlyPrice > current_price
                    );

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

                    upgradeOptions.sort((a, b) => a.monthlyPrice - b.monthlyPrice);

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
                        description: 'User\'s mobile number',
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

                const sessionId = context?.context?.sessionId || context?.sessionId || phone_number;

                try {
                    const isAuthenticated = getAuthenticationStatus(sessionId);
                    if (!isAuthenticated) {
                        return {
                            success: false,
                            error: 'User not authenticated',
                            requiresAuth: true,
                        };
                    }

                    if (!confirmed) {
                        return {
                            success: false,
                            error: 'Upgrade not confirmed by user',
                            requiresConfirmation: true,
                        };
                    }

                    const upgradeResult = {
                        success: true,
                        upgradeId: `UPG-${Date.now()}`,
                        fromPlan: current_plan,
                        toPlan: new_plan,
                        newMonthlyPrice: new_price,
                        effectiveDate: new Date().toISOString().split('T')[0],
                        message: `Successfully upgraded from ${current_plan} to ${new_plan}`,
                    };

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

    handoffs: [],
});
