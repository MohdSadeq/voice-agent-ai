import { authenticationAgent } from './authentication';
import { simulatedHumanAgent } from './simulatedHuman';
import { changePlanAgent } from './changePlan';

// Cast to `any` to satisfy TypeScript until the core types make RealtimeAgent
// assignable to `Agent<unknown>` (current library versions are invariant on
// the context type).
(authenticationAgent.handoffs as any).push(changePlanAgent, simulatedHumanAgent);
(changePlanAgent.handoffs as any).push(authenticationAgent, simulatedHumanAgent);
(simulatedHumanAgent.handoffs as any).push(authenticationAgent, changePlanAgent);

export const customerServiceScenario = [
  authenticationAgent,
  changePlanAgent,
  simulatedHumanAgent,
];

export const customerServiceCompanyName = 'redONE Mobile Service';
