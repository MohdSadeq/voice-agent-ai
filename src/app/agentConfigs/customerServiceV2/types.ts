/**
 * Shared types for Customer Service V2 Agent System
 */

// User context maintained across conversation
export interface UserContext {
    phoneNumber?: string;
    nric?: string;
    name?: string;
    isVerified: boolean;
    verificationAttempts: number;
    lastVerificationError?: string;
}

// Tool response types
export interface ToolResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface VerificationResult {
    verified: boolean;
    message?: string;
    user?: any;
}

// Agent routing decisions
export enum AgentType {
    SUPERVISOR = 'supervisor',
    ACCOUNT = 'account',
    PLANS = 'plans',
    STORE_LOCATOR = 'store_locator',
    FAQ = 'faq',
    HUMAN = 'human',
}

export interface RoutingDecision {
    targetAgent: AgentType;
    reason: string;
    requiresAuth: boolean;
}

// Voice-optimized response structure
export interface VoiceResponse {
    message: string;
    shouldSpellOut?: string[]; // Array of items to spell out (phone numbers, addresses)
    confirmationRequired?: boolean;
    expectedUserResponse?: string[];
}

// Error types for better error handling
export enum ErrorType {
    VERIFICATION_FAILED = 'verification_failed',
    DATA_NOT_FOUND = 'data_not_found',
    INVALID_INPUT = 'invalid_input',
    OUT_OF_SCOPE = 'out_of_scope',
    SYSTEM_ERROR = 'system_error',
}

export interface AgentError {
    type: ErrorType;
    message: string;
    shouldEscalate: boolean;
}
