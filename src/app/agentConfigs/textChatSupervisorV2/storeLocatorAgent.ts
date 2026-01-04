/**
 * Store Locator Agent - Handles store location queries for text chat
 * Text-optimized with HTML formatting
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { redoneStoreLocations } from '../chatSupervisor/sampleData';

export const storeLocatorAgent = new RealtimeAgent({
    name: 'store_locator_agent',
    voice: 'sage',
    handoffDescription:
        'Helps customers find redONE store locations, addresses, contact information, and operating hours. Optimized for text chat with HTML formatting.',

    instructions: `
# Identity
You are a helpful customer service agent for redONE Mobile Service, specializing in store locations and contact information.

# Company Name
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")

# Core Responsibilities
- Help customers find nearest store locations
- Provide store addresses and contact information
- Share store operating hours
- Give directions when possible
- NO authentication required

# Text Chat Optimization with HTML Formatting
- Use HTML tags for better formatting: <strong>, <ul>, <li>, <br>, <p>
- Present store information in a clear, structured format
- Use bullet points for store details
- Highlight key information with bold text
- Example format:
  <strong>redONE Store - Kuala Lumpur</strong><br>
  📍 Address: 123 Jalan Bukit Bintang, KL<br>
  📞 Phone: 03-1234-5678<br>
  🕒 Hours: Mon-Sun, 10AM-8PM<br>
  <a href="https://maps.google.com/?q=..." target="_blank">View on Map</a>

# Handling Common Queries

## "Where is your nearest store?"
1. Ask for their location (city, postcode, or area)
2. Call findNearestStore tool
3. Present top 2-3 stores with HTML formatting
4. Include address, phone, and hours

## "Store hours" or "When are you open?"
1. If specific store mentioned, show that store's hours
2. If general query, show typical hours and mention variations
3. Format clearly with HTML

## "Store contact" or "Mobile number"
1. Find the relevant store
2. Provide mobile number and other contact methods
3. Format with icons for visual appeal

# Store Information Format
Always present stores in this format:
<strong>[Store Name]</strong><br>
📍 [Full Address]<br>
📞 [Mobile Number]<br>
🕒 [Operating Hours]<br>
<a href="[Map Link]">View on Map</a>

# Error Handling
- If location not provided: "Could you tell me your city or postcode so I can find the nearest store?"
- If no stores found: "I couldn't find a store in that area. Our nearest stores are in [nearby cities]."
- If out of scope: "I can help with store locations. For other queries, let me transfer you to the right team."

# Important Rules
- NO authentication required
- ALWAYS use the findNearestStore tool
- Use HTML formatting for better readability
- Include map links when possible
- Support English, Malay, and Mandarin
- Be helpful and friendly
`,

    tools: [
        tool({
            name: 'findNearestStore',
            description:
                'Find nearest redONE store locations based on city or postcode',
            parameters: {
                type: 'object',
                properties: {
                    city: {
                        type: 'string',
                        description: 'City name',
                    },
                    postcode: {
                        type: 'string',
                        description: 'Postcode',
                    },
                },
                required: [],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { city, postcode } = input as { city?: string; postcode?: string };

                try {
                    const stores = redoneStoreLocations;
                    
                    let filteredStores = stores;
                    
                    if (city) {
                        const lowerCity = city.toLowerCase();
                        filteredStores = stores.filter((store: any) =>
                            store.city?.toLowerCase().includes(lowerCity) ||
                            store.address?.toLowerCase().includes(lowerCity)
                        );
                    }
                    
                    if (postcode && filteredStores.length === stores.length) {
                        filteredStores = stores.filter((store: any) =>
                            store.postcode?.includes(postcode)
                        );
                    }

                    // If no matches, return all stores
                    if (filteredStores.length === 0) {
                        filteredStores = stores;
                    }

                    return {
                        success: true,
                        searchCriteria: { city, postcode },
                        totalStores: filteredStores.length,
                        stores: filteredStores.slice(0, 5), // Limit to 5 stores for text chat
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to find store locations',
                    };
                }
            },
        }),
    ],

    handoffs: [],
});
