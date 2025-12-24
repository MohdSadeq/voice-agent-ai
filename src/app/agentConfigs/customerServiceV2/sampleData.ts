/**
 * Sample data for Customer Service V2 Agent System
 * Reuses data from chatSupervisor where applicable
 */

// Re-export existing data from chatSupervisor
export {
    getUserByMobile,
    redonePlans,
    redoneStoreLocations,
    exampleFAQQuestions,
    redoneHomeWiFiPlans,
    type User,
    type MobilePlan,
} from '../chatSupervisor/sampleData';

// Additional FAQ data specific to customer service
export const customerServiceFAQs = [
    {
        id: 'CS-001',
        category: 'general',
        question: 'What are your customer service hours?',
        answer: 'Our customer service is available Monday to Sunday, 8 AM to 8 PM Malaysian time.',
    },
    {
        id: 'CS-002',
        category: 'account',
        question: 'How do I reset my account password?',
        answer: 'You can reset your password through our mobile app or website. Go to Settings, then Account Security, and select Reset Password.',
    },
    {
        id: 'CS-003',
        category: 'billing',
        question: 'When is my bill due?',
        answer: 'Bills are typically due on the 21st of each month. You can check your specific due date in your account details.',
    },
    {
        id: 'CS-004',
        category: 'plans',
        question: 'Can I change my plan mid-month?',
        answer: 'Yes, you can change your plan at any time. The new plan will take effect immediately, and charges will be prorated.',
    },
    {
        id: 'CS-005',
        category: 'technical',
        question: 'How do I enable 5G on my device?',
        answer: 'Go to Settings, then Mobile Network, and toggle on 5G. Make sure your plan supports 5G and you\'re in a 5G coverage area.',
    },
];

// Helper function to search FAQs
export function searchFAQs(query: string, category?: string): typeof customerServiceFAQs {
    const lowerQuery = query.toLowerCase();

    let results = customerServiceFAQs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(lowerQuery) ||
            faq.answer.toLowerCase().includes(lowerQuery)
    );

    if (category) {
        results = results.filter((faq) => faq.category === category);
    }

    return results;
}

// Helper function to get FAQ by category
export function getFAQsByCategory(category: string): typeof customerServiceFAQs {
    return customerServiceFAQs.filter((faq) => faq.category === category);
}
