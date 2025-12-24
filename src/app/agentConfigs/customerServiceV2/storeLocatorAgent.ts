/**
 * Store Locator Agent - Handles store location inquiries (no authentication required)
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { redoneStoreLocations } from './sampleData';

export const storeLocatorAgent = new RealtimeAgent({
    name: 'store_locator_agent',
    voice: 'sage',
    handoffDescription:
        'Helps customers find nearby redONE Mobile stores by city or postcode. Provides store addresses, hours, and contact information. No authentication required.',

    instructions: `
# Identity
You are a helpful customer service agent for redONE Mobile Service, specializing in helping customers find store locations.

# Correct Pronunciation
- RED-ONE MOH-bile (not "Red-won" or "Redone")
- Always pronounce "Mobile" like the English word

# Core Responsibilities
- Help customers find nearby stores
- Provide store addresses, hours, and contact info
- Give directions or landmarks when helpful
- NO authentication required

# Anti-Hallucination Guardrails (CRITICAL)
- ONLY use data from findStoresByCity and findStoresByPostcode tools
- NEVER invent store addresses, hours, or phone numbers
- If no stores found, explicitly state: "I don't see any stores in that area. The nearest one is in [city]"
- If unsure about details, say: "Let me connect you with someone who can provide detailed directions"
- NEVER assume or extrapolate store information

# Voice Optimization
- Keep responses SHORT and conversational
- Spell out addresses clearly for voice
- Mention 1-2 nearest stores, not all stores
- Use landmarks when available
- Examples:
  - "The nearest store is in Kuala Lumpur at Jalan Ampang"
  - "They're open Monday through Sunday, 8 AM to 8 PM"
  - "You can reach them at zero-three-two-one-two-three-four-five-six-seven"

# Handling Common Queries

## "Where's your nearest store?"
- Ask for their city or postcode
- "I can help you find the nearest store. What city are you in?"
- Once provided, call findStoresByCity or findStoresByPostcode

## "What are your store hours?"
- Provide standard hours: Monday to Sunday, 8 AM to 8 PM
- "Our stores are open Monday through Sunday, 8 AM to 8 PM Malaysian time"

## "Do you have a store in [city]?"
- Call findStoresByCity
- If yes: Provide address
- If no: Mention nearest alternative
- "Yes, we have a store in Kuala Lumpur at Jalan Ampang. They're open daily from 8 AM to 8 PM"

## "How do I get to [store]?"
- Provide address and landmarks if available
- Suggest using maps app
- "The store is at [address]. I recommend using your maps app for turn-by-turn directions"

# Spelling Out Addresses for Voice
- Spell street names clearly
- Use "number" for building numbers
- Example: "The address is number 123, Jalan Ampang, Kuala Lumpur"

# Error Handling
- If city not found: "I don't see any stores in that area. Could you try a nearby city?"
- If postcode invalid: "I didn't catch that postcode. Could you repeat it?"
- If no stores nearby: "The nearest store is in [city], about [distance] away"

# Important Rules
- NO authentication required
- ONLY use data from tools (never invent)
- Keep responses SHORT for voice
- Mention 1-2 stores maximum per response
- Always offer phone number for the store
- Support English, Malay, and Mandarin
`,

    tools: [
        tool({
            name: 'findStoresByCity',
            description:
                'Find redONE Mobile stores in a specific city. Returns store addresses, hours, and contact information.',
            parameters: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'City name (e.g., "Kuala Lumpur", "Penang", "Johor Bahru")',
                    },
                },
                required: ['city'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { city } = input as { city: string };

                try {
                    const lowerCity = city.toLowerCase();

                    // Filter stores by city
                    const stores = redoneStoreLocations.filter((store: any) =>
                        store.city?.toLowerCase().includes(lowerCity) ||
                        store.address?.toLowerCase().includes(lowerCity)
                    );

                    if (stores.length === 0) {
                        return {
                            success: false,
                            error: `No stores found in ${city}`,
                            suggestion: 'Try a nearby city or provide a postcode',
                        };
                    }

                    return {
                        success: true,
                        data: stores.slice(0, 3), // Limit to top 3 results
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to search for stores',
                    };
                }
            },
        }),

        tool({
            name: 'findStoresByPostcode',
            description:
                'Find redONE Mobile stores near a specific postcode. Returns store addresses, hours, and contact information.',
            parameters: {
                type: 'object',
                properties: {
                    postcode: {
                        type: 'string',
                        description: 'Malaysian postcode (5 digits, e.g., "50000")',
                    },
                },
                required: ['postcode'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { postcode } = input as { postcode: string };

                try {
                    // Filter stores by postcode
                    const stores = redoneStoreLocations.filter((store: any) =>
                        store.postcode?.includes(postcode) ||
                        store.address?.includes(postcode)
                    );

                    if (stores.length === 0) {
                        // If no exact match, return all stores (user can choose nearest)
                        return {
                            success: true,
                            data: redoneStoreLocations.slice(0, 3),
                            message: 'No stores found with that exact postcode. Here are our nearest locations.',
                        };
                    }

                    return {
                        success: true,
                        data: stores.slice(0, 3), // Limit to top 3 results
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to search for stores',
                    };
                }
            },
        }),

        tool({
            name: 'getStoreDetails',
            description:
                'Get detailed information about a specific store including full address, hours, contact number, and services offered.',
            parameters: {
                type: 'object',
                properties: {
                    store_name: {
                        type: 'string',
                        description: 'Name or identifier of the store',
                    },
                },
                required: ['store_name'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { store_name } = input as { store_name: string };

                try {
                    const lowerStoreName = store_name.toLowerCase();

                    const store = redoneStoreLocations.find((s: any) =>
                        s.name?.toLowerCase().includes(lowerStoreName) ||
                        s.city?.toLowerCase().includes(lowerStoreName) ||
                        s.address?.toLowerCase().includes(lowerStoreName)
                    );

                    if (!store) {
                        return {
                            success: false,
                            error: 'Store not found',
                        };
                    }

                    return {
                        success: true,
                        data: store,
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to retrieve store details',
                    };
                }
            },
        }),
    ],

    handoffs: [], // Will be populated in index.ts
});
