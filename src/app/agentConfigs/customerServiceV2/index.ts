/**
 * Customer Service V2 - Main export file
 * Configures all agents and their handoff relationships
 */

import { supervisorAgent } from './supervisorAgent';
import { accountAgent } from './accountAgent';
import { plansAgent } from './plansAgent';
import { planUpgradeAgent } from './planUpgradeAgent';
import { terminationAgent } from './terminationAgent';
import { storeLocatorAgent } from './storeLocatorAgent';
import { faqAgent } from './faqAgent';

// Configure handoffs for each agent
// All agents can hand off back to supervisor or escalate to each other if needed

// Account Agent can hand off to other agents
(accountAgent.handoffs as any).push(
    supervisorAgent,
    plansAgent,
    planUpgradeAgent,
    terminationAgent,
    storeLocatorAgent,
    faqAgent
);

// Plans Agent can hand off to other agents
(plansAgent.handoffs as any).push(
    supervisorAgent,
    accountAgent,
    planUpgradeAgent,
    terminationAgent,
    storeLocatorAgent,
    faqAgent
);

// Store Locator Agent can hand off to other agents
(storeLocatorAgent.handoffs as any).push(
    supervisorAgent,
    accountAgent,
    plansAgent,
    planUpgradeAgent,
    terminationAgent,
    faqAgent
);

// FAQ Agent can hand off to other agents
(faqAgent.handoffs as any).push(
    supervisorAgent,
    accountAgent,
    plansAgent,
    planUpgradeAgent,
    terminationAgent,
    storeLocatorAgent
);

// Plan Upgrade Agent can hand off to other agents
(planUpgradeAgent.handoffs as any).push(
    supervisorAgent,
    accountAgent,
    plansAgent,
    terminationAgent,
    storeLocatorAgent,
    faqAgent
);

// Termination Agent can hand off to other agents
(terminationAgent.handoffs as any).push(
    supervisorAgent,
    accountAgent,
    plansAgent,
    planUpgradeAgent,
    storeLocatorAgent,
    faqAgent
);

// Export the scenario starting with supervisor
export const customerServiceV2Scenario = [
    supervisorAgent,
    accountAgent,
    plansAgent,
    planUpgradeAgent,
    terminationAgent,
    storeLocatorAgent,
    faqAgent,
];

// Company name for guardrails
export const customerServiceV2CompanyName = 'redONE Mobile Service';

// Export individual agents for testing
export {
    supervisorAgent,
    accountAgent,
    plansAgent,
    planUpgradeAgent,
    terminationAgent,
    storeLocatorAgent,
    faqAgent,
};

export default customerServiceV2Scenario;
