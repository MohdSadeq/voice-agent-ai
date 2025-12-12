import { chatSupervisorScenario } from './chatSupervisor';
import { customerServiceScenario } from './customerService';
import { unifiedAgent } from './UnifiedAgent/UnifiedAgent';

import type { RealtimeAgent } from '@openai/agents/realtime';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  customerService: customerServiceScenario,
  chatSupervisor: chatSupervisorScenario,
  unifiedAgent: [unifiedAgent],
};

export const defaultAgentSetKey = 'chatSupervisor';
