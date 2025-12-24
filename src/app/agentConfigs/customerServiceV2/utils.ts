/**
 * Utility functions for Customer Service V2 Agent System
 */

import { VoiceResponse } from './types';

/**
 * Format phone number for voice readback (digit-by-digit)
 * Example: "0123456789" -> "zero-one-two-three-four-five-six-seven-eight-nine"
 */
export function formatPhoneForVoice(phone: string): string {
    const digitMap: { [key: string]: string } = {
        '0': 'zero',
        '1': 'one',
        '2': 'two',
        '3': 'three',
        '4': 'four',
        '5': 'five',
        '6': 'six',
        '7': 'seven',
        '8': 'eight',
        '9': 'nine',
    };

    const digits = phone.replace(/\D/g, '');
    return digits
        .split('')
        .map((d) => digitMap[d] || d)
        .join('-');
}

/**
 * Format NRIC last 4 digits for voice readback
 * Example: "5678" -> "five-six-seven-eight"
 */
export function formatNRICForVoice(nric: string): string {
    return formatPhoneForVoice(nric);
}

/**
 * Normalize phone number to consistent format
 * Removes all non-digits and ensures Malaysian format
 */
export function normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');

    // If starts with country code 60, keep it; otherwise add it
    if (digitsOnly.startsWith('60')) {
        return digitsOnly;
    }

    // If starts with 0, replace with 60
    if (digitsOnly.startsWith('0')) {
        return '60' + digitsOnly.substring(1);
    }

    // Otherwise assume it's missing country code
    return '60' + digitsOnly;
}

/**
 * Create a voice-optimized confirmation message
 */
export function createConfirmationMessage(
    value: string,
    type: 'phone' | 'nric'
): string {
    const formattedValue =
        type === 'phone' ? formatPhoneForVoice(value) : formatNRICForVoice(value);

    return `You said ${formattedValue}, is that correct?`;
}

/**
 * Check if a query requires authentication
 */
export function requiresAuthentication(query: string): boolean {
    const authKeywords = [
        'account',
        'bill',
        'billing',
        'invoice',
        'payment',
        'balance',
        'plan details',
        'my plan',
        'usage',
        'data usage',
        'contract',
        'subscription',
        'vas',
        'ticket',
        'issue',
        'complaint',
    ];

    const lowerQuery = query.toLowerCase();
    return authKeywords.some((keyword) => lowerQuery.includes(keyword));
}

/**
 * Classify user intent from query
 */
export function classifyIntent(query: string): {
    intent: 'account' | 'plans' | 'store' | 'faq' | 'unknown';
    confidence: number;
} {
    const lowerQuery = query.toLowerCase();

    // Account-related keywords
    if (
        /\b(my account|my bill|my plan|my usage|my balance|my invoice|my contract)\b/i.test(
            query
        )
    ) {
        return { intent: 'account', confidence: 0.9 };
    }

    // Plans-related keywords
    if (
        /\b(plan|package|pricing|offer|promotion|postpaid|prepaid|family plan)\b/i.test(
            query
        )
    ) {
        return { intent: 'plans', confidence: 0.85 };
    }

    // Store-related keywords
    if (
        /\b(store|location|branch|office|address|nearest|where|find)\b/i.test(
            query
        )
    ) {
        return { intent: 'store', confidence: 0.85 };
    }

    // FAQ-related keywords
    if (
        /\b(how to|how do|can i|what is|tell me about|explain|help)\b/i.test(
            query
        )
    ) {
        return { intent: 'faq', confidence: 0.7 };
    }

    return { intent: 'unknown', confidence: 0.5 };
}

/**
 * Create a voice-optimized error message
 */
export function createErrorMessage(
    errorType: string,
    shouldEscalate: boolean = false
): string {
    const messages: { [key: string]: string } = {
        verification_failed:
            "I'm sorry, but I couldn't verify that information. Let's try again.",
        data_not_found:
            "I couldn't find that information in our system. Would you like me to connect you with a representative?",
        invalid_input:
            "I didn't quite catch that. Could you please repeat it?",
        out_of_scope:
            "I'm sorry, but I can only help with mobile service related questions. Is there anything else I can assist you with?",
        system_error:
            "I'm experiencing a technical issue. Let me connect you with someone who can help.",
    };

    const baseMessage = messages[errorType] || messages.system_error;

    if (shouldEscalate) {
        return `${baseMessage} I'll transfer you to a representative now.`;
    }

    return baseMessage;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
    const digitsOnly = phone.replace(/\D/g, '');
    // Malaysian phone numbers: 10-11 digits (with or without country code)
    return digitsOnly.length >= 10 && digitsOnly.length <= 12;
}

/**
 * Validate NRIC last 4 digits
 */
export function isValidNRICDigits(nric: string): boolean {
    const digitsOnly = nric.replace(/\D/g, '');
    return digitsOnly.length === 4 && /^\d{4}$/.test(digitsOnly);
}
