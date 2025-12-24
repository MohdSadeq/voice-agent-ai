import { chatSupervisorScenario, chatSupervisorCompanyName } from './chatSupervisor';
import { customerServiceScenario, customerServiceCompanyName } from './customerService';
import { customerServiceV2Scenario, customerServiceV2CompanyName } from './customerServiceV2';
import { unifiedAgent } from './UnifiedAgent/UnifiedAgent';

import type { RealtimeAgent } from '@openai/agents/realtime';

export const agentConfigs = {
  chatSupervisor: {
    scenario: chatSupervisorScenario,
    companyName: chatSupervisorCompanyName,
  },
  customerService: {
    scenario: customerServiceScenario,
    companyName: customerServiceCompanyName,
  },
  customerServiceV2: {
    scenario: customerServiceV2Scenario,
    companyName: customerServiceV2CompanyName,
  },
};

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  customerService: customerServiceScenario,
  chatSupervisor: chatSupervisorScenario,
  customerServiceV2: customerServiceV2Scenario,
  unifiedAgent: [unifiedAgent],
};

export const defaultAgentSetKey = 'chatSupervisor';
