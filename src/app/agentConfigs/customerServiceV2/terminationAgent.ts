/**
 * Termination Agent - Handles service termination requests (requires authentication)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { getUserByMobile } from './sampleData';
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

export const terminationAgent = new RealtimeAgent({
    name: 'termination_agent',
    voice: 'sage',
    handoffDescription:
        'Handles service termination requests, explains termination policies, early termination fees, and processes cancellations for authenticated customers.',

    instructions: `
# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in service termination and account closure.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word, not like a name

# Core Responsibilities
- Handle service termination requests professionally and empathetically
- Explain termination policies and early termination fees
- Calculate contract obligations and penalties
- Process termination requests after proper verification
- Offer retention alternatives when appropriate
- Require authentication before processing terminations

# Authentication Requirement
- ALWAYS verify user identity before discussing termination details
- Use session context to check authentication status
- If not authenticated, explain that you need to verify their identity first

# Anti-Hallucination Guardrails (CRITICAL)
- ONLY use actual contract data from the tools
- NEVER invent termination fees or contract terms
- Always calculate exact early termination fees based on contract
- If unsure about policies, offer to connect with a specialist
- NEVER process termination without explicit confirmation

# Voice Optimization
- Keep responses SHORT and conversational (2-3 sentences max)
- Show empathy - termination is often a difficult decision
- Be clear about consequences and fees
- Confirm critical details before processing
- Examples:
  - "I understand you'd like to terminate your service. Let me check your contract details first"
  - "Your contract ends on December 31st, 2025. If you terminate now, there's an early termination fee of 500 ringgit"
  - "Before we proceed, I need to confirm: you want to terminate your service effective immediately?"

# Termination Process Flow
1. Authentication Check
   - Verify user is authenticated
   - If not, request authentication first

2. Contract Review
   - Check contract end date
   - Calculate early termination fees if applicable
   - Review any outstanding balances

3. Retention Attempt (Optional)
   - Briefly mention alternatives if appropriate
   - "Before we proceed, have you considered our retention plans?"
   - Don't be pushy - respect customer's decision

4. Termination Details
   - Explain fees and final bill
   - Confirm effective date
   - Explain service discontinuation process

5. Final Confirmation
   - Get explicit confirmation
   - Process the termination
   - Provide reference number

# Handling Common Scenarios

## "I want to cancel my service"
1. Express understanding
2. Check authentication
3. Review contract status
4. Explain any fees
5. Ask for confirmation

## "What are the cancellation fees?"
1. Verify authentication
2. Check contract details
3. Calculate early termination fee
4. Explain clearly: "Based on your contract, the early termination fee would be X ringgit"

## "When does my contract end?"
1. Check contract end date
2. Calculate remaining days/months
3. Mention fee-free termination after contract end

## "Can I cancel without penalty?"
1. Check if past contract end date
2. If not, explain early termination fee
3. Mention when penalty-free cancellation is available

# Retention Guidelines
- Be subtle, not aggressive
- Mention once if appropriate
- Examples:
  - "Have you considered our lower-cost plans instead?"
  - "We have retention offers that might address your concerns"
- If customer insists, proceed with termination

# Error Handling
- If not authenticated: "I'll need to verify your identity first to discuss termination options"
- If system error: "I'm having trouble accessing that information. Let me connect you with a specialist"
- If unsure about policy: "Let me transfer you to our termination specialist for accurate information"

# Important Rules
- REQUIRE authentication for all termination discussions
- ALWAYS confirm before processing
- Calculate fees accurately from contract data
- Show empathy but remain professional
- Keep responses SHORT for voice
- Support English, Malay, and Mandarin
- Provide clear reference numbers
`,

    tools: [
        tool({
            name: 'checkTerminationEligibility',
            description:
                'Check user\'s contract status and calculate termination fees',
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
                    
                    // Calculate termination details
                    const now = new Date();
                    const contractEndDate = accountInfo.contract.contractEnd || new Date().toISOString();
                    const contractEnd = new Date(contractEndDate);
                    const monthsRemaining = Math.max(0, 
                        (contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
                    );
                    
                    // Calculate early termination fee (example: RM100 per remaining month)
                    const earlyTerminationFee = contractEnd > now ? Math.ceil(monthsRemaining) * 100 : 0;
                    
                    // Get outstanding balance
                    const billingBalance = accountInfo.billing.outstandingBalance;
                    let outstandingBalance =  accountInfo.billing.outstandingBalance.value;
                    

                    return {
                        success: true,
                        eligibility: {
                            canTerminate: true,
                            contractEndDate: accountInfo.contract.contractEnd,
                            daysRemaining: accountInfo.contract.daysRemaining,
                            isUnderContract: contractEnd > now,
                            earlyTerminationFee: earlyTerminationFee,
                            outstandingBalance: outstandingBalance,
                            totalTerminationCost: earlyTerminationFee + outstandingBalance,
                            currentPlan: accountInfo.plan.planName,
                            monthlyCharge: accountInfo.plan.planAmount.value,
                        },
                        accountId: accountInfo.account.accountId,
                        userName: accountInfo.customer.name,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve termination eligibility',
                    };
                }
            },
        }),

        tool({
            name: 'getRetentionOffers',
            description:
                'Get available retention offers for the customer',
            parameters: {
                type: 'object',
                properties: {
                    current_plan_price: {
                        type: 'number',
                        description: 'Current monthly plan price',
                    },
                    reason: {
                        type: 'string',
                        enum: ['price', 'service', 'coverage', 'other'],
                        description: 'Reason for termination',
                    },
                },
                required: ['current_plan_price'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { current_plan_price, reason = 'other' } = input as {
                    current_plan_price: number;
                    reason?: string;
                };

                try {
                    // Generate retention offers based on current plan and reason
                    const retentionOffers = [];

                    // Price-based retention
                    if (reason === 'price' || current_plan_price > 30) {
                        retentionOffers.push({
                            type: 'discount',
                            description: '30% discount for 6 months',
                            newMonthlyPrice: current_plan_price * 0.7,
                            duration: '6 months',
                            savings: current_plan_price * 0.3 * 6,
                        });
                    }

                    // Loyalty retention
                    retentionOffers.push({
                        type: 'loyalty',
                        description: 'Free 3 months if you stay for another year',
                        newMonthlyPrice: current_plan_price,
                        duration: '12 months contract',
                        savings: current_plan_price * 3,
                    });

                    // Downgrade option
                    if (current_plan_price > 38) {
                        retentionOffers.push({
                            type: 'downgrade',
                            description: 'Switch to PLUS 38 plan with no penalty',
                            newMonthlyPrice: 38,
                            duration: 'No contract',
                            savings: (current_plan_price - 38) * 12,
                        });
                    }

                    return {
                        success: true,
                        offers: retentionOffers,
                        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 7 days
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve retention offers',
                    };
                }
            },
        }),

        tool({
            name: 'processTermination',
            description:
                'Process the service termination after user confirmation',
            parameters: {
                type: 'object',
                properties: {
                    phone_number: {
                        type: 'string',
                        description: 'User\'s phone number',
                    },
                    termination_date: {
                        type: 'string',
                        description: 'Effective termination date (YYYY-MM-DD)',
                    },
                    reason: {
                        type: 'string',
                        description: 'Reason for termination',
                    },
                    confirmed: {
                        type: 'boolean',
                        description: 'User confirmation status',
                    },
                    acknowledged_fees: {
                        type: 'boolean',
                        description: 'User acknowledged termination fees',
                    },
                },
                required: ['phone_number', 'termination_date', 'confirmed', 'acknowledged_fees'],
                additionalProperties: false,
            },
            execute: async (input: unknown, context: any) => {
                const { 
                    phone_number, 
                    termination_date, 
                    reason = 'Customer request',
                    confirmed,
                    acknowledged_fees
                } = input as {
                    phone_number: string;
                    termination_date: string;
                    reason?: string;
                    confirmed: boolean;
                    acknowledged_fees: boolean;
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
                    if (!confirmed || !acknowledged_fees) {
                        return {
                            success: false,
                            error: 'Termination not confirmed or fees not acknowledged',
                            requiresConfirmation: true,
                        };
                    }

                    // Get account info for final verification
                    const accountInfo = getUserByMobile(phone_number);

                    // Simulate termination process
                    // In real implementation, this would call backend API
                    const terminationResult = {
                        success: true,
                        terminationId: `TERM-${Date.now()}`,
                        accountId: accountInfo.account.accountId,
                        customerName: accountInfo.customer.name,
                        planName: accountInfo.plan.planName,
                        effectiveDate: termination_date,
                        reason: reason,
                        finalBillEstimate: {
                            outstandingBalance: accountInfo.billing.outstandingBalance,
                            earlyTerminationFee: 'Calculated based on contract',
                            totalAmount: 'Will be calculated in final bill',
                        },
                        nextSteps: [
                            'Final bill will be sent within 30 days',
                            'Service will be discontinued on the effective date',
                            'Return any rented equipment to nearest store',
                        ],
                        message: `Service termination scheduled for ${termination_date}`,
                    };

                    // Update session context
                    const sessionData = getSessionContext(sessionId);
                    if (sessionData) {
                        updateSessionContext(sessionId, {
                            ...sessionData,
                            lastActivity: Date.now(),
                        });
                    }

                    return terminationResult;
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to process termination. Please contact support.',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
