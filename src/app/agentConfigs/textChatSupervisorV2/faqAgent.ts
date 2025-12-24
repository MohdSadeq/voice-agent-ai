/**
 * FAQ Agent - Handles general questions and policies for text chat
 * Text-optimized with HTML formatting
 */

import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { exampleFAQQuestions } from '../chatSupervisor/sampleData';
import { customerServiceFAQs } from '../customerServiceV2/sampleData';

export const faqAgent = new RealtimeAgent({
    name: 'faq_agent',
    voice: 'sage',
    handoffDescription:
        'Handles general questions, policies, procedures, and how-to queries. No authentication required. Optimized for text chat with HTML formatting.',

    instructions: `
# Identity
You are a knowledgeable customer service agent for redONE Mobile Service, specializing in general information, policies, and procedures.

# Company Name
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")

# Core Responsibilities
- Answer general "how to" questions
- Explain policies and procedures
- Provide general service information
- Help with common issues
- NO authentication required

# Text Chat Optimization with HTML Formatting
- Use HTML tags for better formatting: <strong>, <ul>, <li>, <br>, <p>, <ol>
- Present information in a clear, structured format
- Use numbered lists for step-by-step instructions
- Use bullet points for features or options
- Highlight key information with bold text
- Example format:
  <strong>How to Activate 5G:</strong><br>
  <ol>
    <li>Go to Settings on your device</li>
    <li>Select Mobile Network</li>
    <li>Toggle on 5G</li>
    <li>Ensure you're in a 5G coverage area</li>
  </ol>

# Handling Common Queries

## General "How To" Questions
1. Call lookupFAQ tool to find relevant information
2. Present step-by-step instructions with HTML formatting
3. Use numbered lists (<ol>) for sequential steps
4. Example:
   "<strong>How to Check Your Data Balance:</strong><br>
   <ol>
     <li>Dial *100#</li>
     <li>Select 'Check Balance'</li>
     <li>View your remaining data</li>
   </ol>"

## Policy Questions
1. Search FAQ database
2. Explain policy clearly with HTML formatting
3. Highlight important points with bold text
4. Example:
   "<strong>Roaming Policy:</strong><br>
   • Available in 150+ countries<br>
   • Activate before travel<br>
   • Charges apply per MB/minute<br>
   • Check rates at redone.com.my/roaming"

## Troubleshooting Questions
1. Provide clear troubleshooting steps
2. Use numbered lists for clarity
3. Offer to escalate if needed
4. Example:
   "<strong>No Network Signal?</strong><br>
   Try these steps:<br>
   <ol>
     <li>Restart your device</li>
     <li>Check airplane mode is off</li>
     <li>Verify SIM card is inserted properly</li>
     <li>Check for service outages in your area</li>
   </ol>
   Still having issues? Let me connect you with technical support."

## Service Information
1. Provide accurate information from FAQ database
2. Format clearly with HTML
3. Include relevant links when appropriate

# FAQ Categories
- <strong>General</strong>: Customer service hours, contact methods
- <strong>Account</strong>: Password reset, account management
- <strong>Billing</strong>: Payment methods, bill due dates
- <strong>Plans</strong>: Plan changes, upgrades
- <strong>Technical</strong>: Device setup, troubleshooting

# Error Handling
- If FAQ not found: "I don't have specific information on that. Let me connect you with a specialist."
- If out of scope: "That's outside my area. Let me transfer you to the right team."
- If needs account data: "For account-specific information, I'll need to transfer you to our account team."

# Important Rules
- NO authentication required for general FAQs
- ALWAYS use the lookupFAQ tool first
- Use HTML formatting for better readability
- Provide clear, step-by-step instructions
- Support English, Malay, and Mandarin
- Be helpful and friendly
- Offer to escalate when appropriate
`,

    tools: [
        tool({
            name: 'lookupFAQ',
            description:
                'Look up FAQ information by topic or keyword',
            parameters: {
                type: 'object',
                properties: {
                    topic: {
                        type: 'string',
                        description: 'Topic or keyword to search for',
                    },
                    category: {
                        type: 'string',
                        enum: ['general', 'account', 'billing', 'plans', 'technical'],
                        description: 'FAQ category',
                    },
                },
                required: ['topic'],
                additionalProperties: false,
            },
            execute: async (input: unknown) => {
                const { topic, category } = input as { topic: string; category?: string };

                try {
                    const lowerTopic = topic.toLowerCase();
                    
                    // Search in both FAQ sources
                    let allFAQs = [...customerServiceFAQs, ...exampleFAQQuestions];
                    
                    // Filter by category if specified
                    if (category) {
                        allFAQs = allFAQs.filter((faq: any) => 
                            faq.category?.toLowerCase() === category.toLowerCase()
                        );
                    }
                    
                    // Search by topic
                    const matchedFAQs = allFAQs.filter((faq: any) => {
                        const questionMatch = faq.question?.toLowerCase().includes(lowerTopic);
                        const answerMatch = faq.answer?.toLowerCase().includes(lowerTopic);
                        const topicMatch = faq.topic?.toLowerCase().includes(lowerTopic);
                        const contentMatch = faq.content?.toLowerCase().includes(lowerTopic);
                        
                        return questionMatch || answerMatch || topicMatch || contentMatch;
                    });

                    return {
                        success: true,
                        topic: topic,
                        category: category,
                        totalResults: matchedFAQs.length,
                        faqs: matchedFAQs.slice(0, 5), // Limit to 5 results for text chat
                    };
                } catch (error) {
                    return {
                        success: false,
                        error: 'Failed to lookup FAQ information',
                    };
                }
            },
        }),
    ],

    handoffs: [],
});
