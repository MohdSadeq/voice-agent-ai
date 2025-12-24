/**
 * WiFi Plan Query Utilities - Helper functions for answering questions about home WiFi plans
 */

import { RedoneWiFiPlan, reformattedWiFiPlans, describeWiFiPlan } from './reformattedWiFiPlans';

/**
 * Answer common questions about WiFi plans
 */
export const wifiPlanQuestionAnswers = {
  // What's included in each plan?
  getWhatIsIncluded: (planId: string): string => {
    const plan = reformattedWiFiPlans.find(p => p.id === planId);
    if (!plan) return "WiFi plan not found.";
    
    const includes = [
      `RM${plan.price.monthly} per month`,
      `${plan.data.total}${plan.data.unit} monthly data`,
      `${plan.network.type.join(' and ')} network support`,
      plan.device.included ? `FREE ${plan.device.type}` : 'SIM card only (bring your own router)',
      `${plan.contract.duration}-month contract`,
      plan.installation.included ? plan.installation.details : null
    ].filter(Boolean);
    
    return `${plan.name} includes:\n${includes.map(item => `• ${item}`).join('\n')}`;
  },

  // Which plan is cheaper?
  getCheaperPlan: (): string => {
    const sorted = [...reformattedWiFiPlans].sort((a, b) => a.price.monthly - b.price.monthly);
    const cheaper = sorted[0];
    const expensive = sorted[sorted.length - 1];
    
    return `The ${cheaper.name} is cheaper at RM${cheaper.price.monthly}/month (SIM only). 
The ${expensive.name} costs RM${expensive.price.monthly}/month but includes a FREE 5G router.
You save RM${expensive.price.monthly - cheaper.price.monthly}/month with the SIM-only plan if you already have a router.`;
  },

  // Which plan should I choose?
  getRecommendation: (hasRouter: boolean, preferShortContract: boolean = false): string => {
    if (hasRouter) {
      return `Since you already have a router, I recommend the ${reformattedWiFiPlans[1].name} (SIM only) at RM${reformattedWiFiPlans[1].price.monthly}/month. 
You'll save RM20/month and have a shorter 12-month contract. Both plans offer the same 1TB data.`;
    } else {
      if (preferShortContract) {
        return `You need a router but prefer a shorter contract. Consider:
• Buy your own 5G router + homeWiFi68 (12-month contract)
• OR accept the 24-month contract with homeWiFi88 for a FREE router
The homeWiFi88 might be more economical as 5G routers can cost RM300-600.`;
      }
      return `Since you need a router, I recommend the ${reformattedWiFiPlans[0].name} at RM${reformattedWiFiPlans[0].price.monthly}/month. 
It includes a FREE 5G WiFi router (worth ~RM500) and provides everything you need to get started.`;
    }
  },

  // What's the difference between the plans?
  getComparison: (): string => {
    const device = reformattedWiFiPlans.find(p => p.category === 'device-bundle');
    const simOnly = reformattedWiFiPlans.find(p => p.category === 'sim-only');
    
    if (!device || !simOnly) return "Plans not found for comparison.";
    
    return `Comparison between WiFi plans:

${device.name} (RM${device.price.monthly}/month):
• Includes FREE 5G WiFi Router
• ${device.contract.duration}-month contract
• ${device.data.total}${device.data.unit} monthly data
• Best for: New customers without router

${simOnly.name} (RM${simOnly.price.monthly}/month):
• SIM only (bring your own router)
• ${simOnly.contract.duration}-month contract
• ${simOnly.data.total}${simOnly.data.unit} monthly data
• Best for: Customers with existing router

Both plans offer the same data and network coverage. The main difference is the router inclusion and contract length.`;
  },

  // How much data is 1TB?
  explainDataAllocation: (): string => {
    return `1TB (1000GB) monthly data is sufficient for:
• Streaming 4K content: ~400 hours
• HD video calls: ~3,000 hours  
• Online gaming: ~20,000 hours
• General browsing: Virtually unlimited
• Work from home: More than enough

This is suitable for heavy internet usage by multiple family members simultaneously.`;
  },

  // Contract questions
  getContractInfo: (planId: string): string => {
    const plan = reformattedWiFiPlans.find(p => p.id === planId);
    if (!plan) return "Plan not found.";
    
    return `${plan.name} Contract Details:
• Duration: ${plan.contract.duration} months
• Monthly fee: RM${plan.price.monthly}
• Total contract value: RM${plan.price.monthly * plan.contract.duration}
${plan.device.included ? '• Router included (must return if contract terminated early)' : '• No device commitment'}
• After contract: Continue month-to-month at same rate
• Early termination: ${plan.contract.earlyTerminationFee || 'Standard fees apply'}`;
  }
};

/**
 * Quick facts generator for WiFi plans
 */
export const getWiFiQuickFacts = (planId: string): string[] => {
  const plan = reformattedWiFiPlans.find(p => p.id === planId);
  if (!plan) return ["WiFi plan not found"];
  
  const facts = [
    `Monthly cost: RM${plan.price.monthly}`,
    `Data allocation: ${plan.data.total}${plan.data.unit}`,
    `Contract: ${plan.contract.duration} months`,
    plan.device.included ? `Includes: FREE ${plan.device.type}` : 'Type: SIM only',
    `Network: ${plan.network.type.join(' and ')} support`,
    `Coverage: ${plan.network.coverage}`
  ];
  
  return facts;
};

/**
 * Generate comparison table for WiFi plans
 */
export const generateWiFiComparisonTable = (): string => {
  const headers = ['Feature', '5G homeWiFi88', '5G homeWiFi68'];
  const rows = [
    ['Monthly Price', 'RM88', 'RM68'],
    ['Contract Length', '24 months', '12 months'],
    ['Data Allocation', '1TB (1000GB)', '1TB (1000GB)'],
    ['5G Router', 'FREE (included)', 'Not included'],
    ['Network Support', '4G & 5G', '4G & 5G'],
    ['Installation', 'Self-install', 'Self-install'],
    ['Best For', 'New customers', 'Router owners']
  ];
  
  // Simple text table
  const colWidths = headers.map((h, i) => 
    Math.max(h.length, ...rows.map(r => r[i].length))
  );
  
  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |';
  const dataRows = rows.map(row => 
    '| ' + row.map((cell, i) => cell.padEnd(colWidths[i])).join(' | ') + ' |'
  );
  
  return [separator, headerRow, separator, ...dataRows, separator].join('\n');
};

/**
 * Calculate potential savings
 */
export const calculateSavings = (monthsOfUse: number = 24): string => {
  const devicePlan = reformattedWiFiPlans.find(p => p.category === 'device-bundle');
  const simOnlyPlan = reformattedWiFiPlans.find(p => p.category === 'sim-only');
  
  if (!devicePlan || !simOnlyPlan) return "Unable to calculate savings.";
  
  const deviceTotal = devicePlan.price.monthly * monthsOfUse;
  const simOnlyTotal = simOnlyPlan.price.monthly * monthsOfUse;
  const savings = deviceTotal - simOnlyTotal;
  
  return `Cost comparison over ${monthsOfUse} months:
• ${devicePlan.name}: RM${deviceTotal} (includes FREE router)
• ${simOnlyPlan.name}: RM${simOnlyTotal} (router not included)
• Difference: RM${savings}

Note: The RM${savings} difference essentially covers the cost of the 5G router in the device plan.`;
};
