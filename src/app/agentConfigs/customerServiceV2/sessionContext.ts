/**
 * Session Context Management
 * Persists authentication state across agent handoffs
 */

export interface SessionContext {
    // Authentication state
    phoneNumber?: string;
    isPhoneVerified: boolean;
    nricLast4?: string;
    isNricVerified: boolean;
    isAuthenticated: boolean;
    
    // User information
    accountId?: string;
    userName?: string;
    
    // Session metadata
    sessionId: string;
    timestamp: number;
    lastActivity: number;
}

// In-memory session store (use Redis for production)
const sessionStore = new Map<string, SessionContext>();

// Session timeout: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Get session context by session ID
 */
export function getSessionContext(sessionId: string): SessionContext {
    const context = sessionStore.get(sessionId);
    
    if (!context) {
        // Create new session context
        return {
            sessionId,
            isPhoneVerified: false,
            isNricVerified: false,
            isAuthenticated: false,
            timestamp: Date.now(),
            lastActivity: Date.now(),
        };
    }
    
    // Check if session has expired
    if (Date.now() - context.lastActivity > SESSION_TIMEOUT_MS) {
        // Session expired, clear it
        sessionStore.delete(sessionId);
        return {
            sessionId,
            isPhoneVerified: false,
            isNricVerified: false,
            isAuthenticated: false,
            timestamp: Date.now(),
            lastActivity: Date.now(),
        };
    }
    
    // Update last activity
    context.lastActivity = Date.now();
    sessionStore.set(sessionId, context);
    
    return context;
}

/**
 * Update session context
 */
export function updateSessionContext(
    sessionId: string,
    updates: Partial<SessionContext>
): SessionContext {
    const current = getSessionContext(sessionId);
    
    const updated: SessionContext = {
        ...current,
        ...updates,
        sessionId, // Always preserve session ID
        lastActivity: Date.now(),
    };
    
    // Auto-set isAuthenticated if both verifications are complete
    if (updated.isPhoneVerified && updated.isNricVerified) {
        updated.isAuthenticated = true;
    }
    
    sessionStore.set(sessionId, updated);
    return updated;
}

/**
 * Clear session context
 */
export function clearSessionContext(sessionId: string): void {
    sessionStore.delete(sessionId);
}

/**
 * Check if user is authenticated in this session
 */
export function isSessionAuthenticated(sessionId: string): boolean {
    const context = getSessionContext(sessionId);
    return context.isAuthenticated;
}

/**
 * Get authentication status for session
 */
export function getAuthenticationStatus(sessionId: string): {
    isAuthenticated: boolean;
    needsPhoneVerification: boolean;
    needsNricVerification: boolean;
    userName?: string;
} {
    const context = getSessionContext(sessionId);
    
    return {
        isAuthenticated: context.isAuthenticated,
        needsPhoneVerification: !context.isPhoneVerified,
        needsNricVerification: context.isPhoneVerified && !context.isNricVerified,
        userName: context.userName,
    };
}

/**
 * Clean up expired sessions (call periodically)
 */
export function cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, context] of sessionStore.entries()) {
        if (now - context.lastActivity > SESSION_TIMEOUT_MS) {
            sessionStore.delete(sessionId);
            cleaned++;
        }
    }
    
    return cleaned;
}

// Auto-cleanup every 5 minutes
setInterval(() => {
    const cleaned = cleanupExpiredSessions();
    if (cleaned > 0) {
        console.log(`[SessionContext] Cleaned up ${cleaned} expired sessions`);
    }
}, 5 * 60 * 1000);
