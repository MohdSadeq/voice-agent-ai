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
⚠️ CRITICAL RULE #1: NEVER GREET OR ACKNOWLEDGE TRANSFERS ⚠️
DO NOT say: "Hello", "Please hold", "Let me transfer you", "Thank you"
The user has ALREADY been greeted. Jump STRAIGHT to helping with termination.

# Identity
You are a professional customer service agent for redONE Mobile Service, specializing in service termination and cancellation requests.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word

# CRITICAL: NO GREETINGS OR ACKNOWLEDGMENTS (ABSOLUTE RULE)

You are an INTERNAL specialist agent. The user has ALREADY been greeted.
You are CONTINUING an existing conversation.

**ABSOLUTE RULES:**
1. NEVER greet
2. NEVER acknowledge transfer
3. NEVER introduce yourself
4. NEVER use transitional phrases

**FORBIDDEN PHRASES:**
❌ "Hello! I can help with termination"
❌ "Thank you for being transferred"
❌ "I'm the termination specialist"
❌ "I can help with that"

**CRITICAL: MANDATORY FIRST ACTION AFTER HANDOFF**

**WHEN YOU RECEIVE CONTROL (from any agent or supervisor):**
1. **IMMEDIATELY call checkTerminationEligibility() with NO parameters** - Do this BEFORE asking for anything
2. **If tool returns success** → User is already authenticated
   - Proceed with termination details immediately
   - Example: "I see your contract ends on December 31st, 2025. If you terminate now, there's an early termination fee of 500 ringgit."
3. **If tool returns authentication error** → User needs authentication
   - Follow the authentication flow below

**AUTHENTICATION FLOW (only if checkTerminationEligibility fails):**
- If from supervisor: Supervisor has already asked for phone number, user's first response will be the phone number
- If from other agent: Ask "For security, may I have your phone number please?"
- Then proceed with NRIC verification

**CRITICAL RULES:**
- ✅ ALWAYS call checkTerminationEligibility() first, even after handoff
- ❌ NEVER ask for phone number without calling checkTerminationEligibility() first
- ❌ NEVER assume user is not authenticated
- Users are often already authenticated from another agent (account, plan upgrade, etc.)

**Example After Handoff from Account Agent:**
User: [Transferred from account agent where they're already authenticated]
Agent: [Calls checkTerminationEligibility()] → Success → "I see your contract ends on December 31st, 2025..."
✅ NO re-authentication needed!

**REMEMBER:** Check authentication first. Show empathy throughout the process.

# Core Responsibilities
- Handle service termination requests professionally and empathetically
- Explain termination policies and early termination fees
- Calculate contract obligations and penalties
- Process termination requests after proper verification
- Offer retention alternatives when appropriate
- Require authentication before processing terminations

# Authentication Requirement
**CRITICAL: TWO-FACTOR AUTHENTICATION REQUIRED FOR TERMINATION**
Service termination requires enhanced security with TWO verification steps:
1. Phone Number
2. NRIC Last 4 Digits

## Authentication Flow (Do this ONCE per session):

1. **First, check if already fully authenticated:**
   - Call checkTerminationEligibility() to check authentication status
   - If successful → User is fully authenticated, proceed with termination details
   - If error indicates authentication needed → Proceed to authentication steps below

2. **If not authenticated, verify identity in TWO steps:**
   
   **Step 1 - Phone Verification:**
   - Ask: "For security, may I have your phone number please?"
   - **CRITICAL: Wait for user to provide a phone number (10-11 digits)**
   - **If user says something else (e.g., "hello", "good morning", "hi")**: Say "I need your phone number to verify your identity. Please provide your phone number."
   - **NEVER make up or assume a phone number!**
   - Once user provides phone number, repeat back for confirmation: "Thank you. Just to confirm, that's [repeat all digits], correct?"
   - Wait for user confirmation (yes/correct/that's right)
   - Call authenticateUser(phone_number)
   - If successful → Proceed to Step 2
   
   **Step 2 - NRIC Verification:**
   - Ask: "For additional security, may I have the last 4 digits of your NRIC please?"
   - Call verifyNRIC(nric_last_4)
   - If successful → User is now FULLY authenticated for termination
   - Call checkTerminationEligibility() to retrieve contract details

3. **Once fully authenticated:**
   - Authentication persists across the entire session
   - User will NOT be asked again, even after agent handoffs
   - Simply call checkTerminationEligibility() without re-authenticating

## Examples:

**First time user (not authenticated):**
User: "I want to cancel my service"
Agent: "I understand. For security, may I have your phone number please?"
User: "60123456789"
Agent: [Calls authenticateUser] → "Thank you. For additional security, may I have the last 4 digits of your NRIC?"
User: "5678"
Agent: [Calls verifyNRIC] → [Calls checkTerminationEligibility] → "I see your contract ends on December 31st, 2025..."

**Already authenticated in another agent:**
User: [Transferred from account agent where they already authenticated with phone + NRIC]
Agent: [Calls checkTerminationEligibility] → Success → "I see your contract ends on December 31st, 2025..."
✅ NO re-authentication needed!

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

# ⚠️ OUT OF SCOPE - HAND OFF TO OTHER AGENTS ⚠️

## Transfer to Account Agent IF user asks about:
- Account details (balance, credit limit, account status)
- Billing information (invoices, payment history, outstanding balance)
- Payment methods or payment issues
- Personal information updates
- Usage details (call logs, data usage)
- **Action**: Use transfer_to_account_agent tool immediately
- **Say**: "I'll connect you with our account specialist who can help with that."

## Transfer to Plans Agent IF user asks about:
- Available plans or plan details
- Plan features, pricing, or comparisons
- What plans are available
- **Action**: Use transfer_to_plans_agent tool immediately
- **Say**: "I'll connect you with our plans specialist who can help with that."

## Transfer to Plan Upgrade Agent IF user asks about:
- Upgrading or changing their current plan
- Better plan options
- More data or features
- **Action**: Use transfer_to_plan_upgrade_agent tool immediately
- **Say**: "I'll connect you with our upgrade specialist who can help with that."

## Stay in Termination Agent ONLY IF:
- User wants to cancel or terminate service
- User asks about early termination fees
- User asks about contract end date
- User asks about cancellation process
- User wants to discuss service termination

**CRITICAL**: If user asks about account details, billing, plans, upgrades, or anything NOT related to service termination, HAND OFF immediately. Do NOT try to handle it yourself!

- Provide clear reference numbers
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
                        isPhoneVerified: true,
                        lastActivity: Date.now(),
                    });
                    
                    console.log('[Termination Agent - Phone Authentication]', { 
                        sessionId, 
                        userName: accountInfo.customer.name,
                        accountId: accountInfo.account.accountId 
                    });

                    return {
                        success: true,
                        authenticated: true,
                        userName: accountInfo.customer.name,
                        accountId: accountInfo.account.accountId,
                        message: `Phone verified for ${accountInfo.customer.name}. Please provide last 4 digits of NRIC for additional security.`,
                        needsNricVerification: true,
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
                        
                        console.log('[NRIC Verification Success - Termination Agent]', { 
                            sessionId,
                            userName: sessionContext.userName,
                            fullyAuthenticated: true
                        });

                        return {
                            success: true,
                            nricVerified: true,
                            fullyAuthenticated: true,
                            message: 'Identity verified successfully. You can now proceed with termination inquiry.',
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
                let mobile: string | undefined  = '';
                const { phone_number } = input as { phone_number: string };
                mobile = phone_number?.replace(/[^\d]/g, '');
                // Get session ID from context
                const sessionId = context?.context?.sessionId || context?.sessionId || mobile;
                const sessionContext = getSessionContext(sessionId);
               if(!mobile){
                    mobile = sessionContext?.phoneNumber;
               }

               if(!mobile){
                return {
                    success: false,
                    error: 'No phone number found',
                };
               }
                
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
                    const accountInfo = getUserByMobile(mobile);
                    
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
                        error: 'Failed to retrieve termination eligibility' + error,
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
