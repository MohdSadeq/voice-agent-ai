/**
 * Plan Query Utilities - Helper functions for answering questions about plans
 */

import { RedonePlan, reformattedRedonePlans } from './reformattedPlans';

/**
 * Natural language plan descriptions
 */
export const describePlan = (plan: RedonePlan): string => {
  const phoneInfo = plan.phoneOffer?.included 
    ? ` Includes a ${plan.phoneOffer.type}${plan.phoneOffer.conditions ? ' (conditions apply)' : ''}.`
    : '';
    
  const familyInfo = plan.familyLines 
    ? ` Supports up to ${plan.familyLines} family lines sharing ${plan.data.total}${plan.data.unit}.`
    : '';

  return `${plan.name} (RM${plan.price.monthly}/month): ${plan.tagline}. 
    Offers ${plan.data.total}${plan.data.unit} total data${plan.data.hotspot ? ` (${plan.data.hotspot}${plan.data.unit} hotspot)` : ''}, 
    unlimited calls, and includes redSocial (${plan.bundledServices.redSocial.amount}${plan.bundledServices.redSocial.unit}) 
    and redVideo (${plan.bundledServices.redVideo.amount}${plan.bundledServices.redVideo.unit}).${phoneInfo}${familyInfo}`;
};

/**
 * Answer common questions about plans
 */
export const planQuestionAnswers = {
  // What's included in a specific plan?
  getWhatIsIncluded: (planId: string): string => {
    const plan = reformattedRedonePlans.find(p => p.id === planId);
    if (!plan) return "Plan not found.";
    
    const includes = [
      `RM${plan.price.monthly} per month`,
      `${plan.data.total}${plan.data.unit} total data`,
      plan.data.hotspot ? `${plan.data.hotspot}${plan.data.unit} hotspot` : null,
      plan.calls.included ? plan.calls.details : null,
      `${plan.bundledServices.redSocial.amount}${plan.bundledServices.redSocial.unit} redSocial`,
      `${plan.bundledServices.redVideo.amount}${plan.bundledServices.redVideo.unit} redVideo (${plan.bundledServices.redVideo.details})`,
      plan.phoneOffer?.included ? plan.phoneOffer.type : null,
      plan.familyLines ? `Up to ${plan.familyLines} lines` : null,
      `${plan.network.type} network access`
    ].filter(Boolean);
    
    return `${plan.name} includes:\n${includes.map(item => `• ${item}`).join('\n')}`;
  },

  // Which plan has the most data?
  getMostDataPlan: (): string => {
    const sorted = [...reformattedRedonePlans].sort((a, b) => b.data.total - a.data.total);
    const top = sorted[0];
    return `The ${top.name} offers the most data with ${top.data.total}${top.data.unit} for RM${top.price.monthly}/month.`;
  },

  // Which plans include free phones?
  getPlansWithPhones: (): string => {
    const phonePlans = reformattedRedonePlans.filter(p => p.phoneOffer?.included);
    const descriptions = phonePlans.map(p => 
      `• ${p.name} (RM${p.price.monthly}/month): ${p.phoneOffer!.type}${p.phoneOffer!.conditions ? '*' : ''}`
    );
    
    const conditions = phonePlans
      .filter(p => p.phoneOffer?.conditions)
      .map(p => `*${p.phoneOffer!.conditions}`);
    
    return `Plans with free phones:\n${descriptions.join('\n')}${conditions.length ? '\n\n' + conditions.join('\n') : ''}`;
  },

  // What's the cheapest plan?
  getCheapestPlan: (): string => {
    const sorted = [...reformattedRedonePlans].sort((a, b) => a.price.monthly - b.price.monthly);
    const cheapest = sorted[0];
    return `The cheapest plan is ${cheapest.name} at RM${cheapest.price.monthly}/month, offering ${cheapest.data.total}${cheapest.data.unit} of data.`;
  },

  // Which plan is best for families?
  getBestFamilyPlan: (): string => {
    const familyPlans = reformattedRedonePlans.filter(p => p.category === 'family' || p.familyLines);
    if (familyPlans.length === 0) return "No specific family plans available.";
    
    const best = familyPlans[0];
    return `The ${best.name} is perfect for families at RM${best.price.monthly}/month. It offers ${best.data.total}${best.data.unit} shared among ${best.familyLines} lines, with each line getting unlimited calls and bundled services.`;
  },

  // Compare two plans
  compareTwoPlans: (planId1: string, planId2: string): string => {
    const plan1 = reformattedRedonePlans.find(p => p.id === planId1);
    const plan2 = reformattedRedonePlans.find(p => p.id === planId2);
    
    if (!plan1 || !plan2) return "One or both plans not found.";
    
    const comparison = [
      `Price: ${plan1.name} (RM${plan1.price.monthly}) vs ${plan2.name} (RM${plan2.price.monthly})`,
      `Data: ${plan1.name} (${plan1.data.total}${plan1.data.unit}) vs ${plan2.name} (${plan2.data.total}${plan2.data.unit})`,
      `Hotspot: ${plan1.name} (${plan1.data.hotspot || 0}${plan1.data.unit}) vs ${plan2.name} (${plan2.data.hotspot || 0}${plan2.data.unit})`,
      plan1.phoneOffer?.included || plan2.phoneOffer?.included 
        ? `Phone: ${plan1.name} (${plan1.phoneOffer?.included ? plan1.phoneOffer.type : 'None'}) vs ${plan2.name} (${plan2.phoneOffer?.included ? plan2.phoneOffer.type : 'None'})`
        : null
    ].filter(Boolean);
    
    return `Comparison:\n${comparison.join('\n')}`;
  },

  // Get plans by budget
  getPlansByBudget: (maxBudget: number): string => {
    const affordablePlans = reformattedRedonePlans.filter(p => p.price.monthly <= maxBudget);
    
    if (affordablePlans.length === 0) {
      return `No plans available within RM${maxBudget} budget. The cheapest plan starts at RM${Math.min(...reformattedRedonePlans.map(p => p.price.monthly))}.`;
    }
    
    const sorted = affordablePlans.sort((a, b) => b.data.total - a.data.total);
    const recommendations = sorted.slice(0, 3).map(p => 
      `• ${p.name}: RM${p.price.monthly}/month with ${p.data.total}${p.data.unit}`
    );
    
    return `Plans within RM${maxBudget} budget:\n${recommendations.join('\n')}`;
  },

  // Get plan recommendations based on usage
  getRecommendationByUsage: (dataNeededGB: number, needsPhone: boolean = false): string => {
    let suitable = reformattedRedonePlans.filter(p => p.data.total >= dataNeededGB);
    
    if (needsPhone) {
      suitable = suitable.filter(p => p.phoneOffer?.included);
    }
    
    if (suitable.length === 0) {
      return `No plans found matching your requirements (${dataNeededGB}GB data${needsPhone ? ' with phone' : ''}).`;
    }
    
    // Sort by price to find most economical
    suitable.sort((a, b) => a.price.monthly - b.price.monthly);
    const recommended = suitable[0];
    
    return `Based on your needs (${dataNeededGB}GB data${needsPhone ? ' with phone' : ''}), I recommend ${recommended.name} at RM${recommended.price.monthly}/month. It offers ${recommended.data.total}${recommended.data.unit} of data${recommended.phoneOffer?.included ? ` and includes a ${recommended.phoneOffer.type}` : ''}.`;
  }
};

/**
 * Quick facts generator for customer service
 */
export const getQuickFacts = (planId: string): string[] => {
  const plan = reformattedRedonePlans.find(p => p.id === planId);
  if (!plan) return ["Plan not found"];
  
  const facts = [
    `Monthly cost: RM${plan.price.monthly}`,
    `Total data: ${plan.data.total}${plan.data.unit}`,
    plan.data.hotspot ? `Hotspot data: ${plan.data.hotspot}${plan.data.unit}` : null,
    `Network: ${plan.network.type}`,
    plan.phoneOffer?.included ? `Free phone: ${plan.phoneOffer.type}` : 'No phone included',
    plan.familyLines ? `Family lines: Up to ${plan.familyLines}` : null,
    `Bundled services: redSocial (${plan.bundledServices.redSocial.amount}${plan.bundledServices.redSocial.unit}) + redVideo (${plan.bundledServices.redVideo.amount}${plan.bundledServices.redVideo.unit})`
  ].filter(Boolean) as string[];
  
  return facts;
};

/**
 * Generate a summary table for all plans
 */
export const generatePlanSummaryTable = (): string => {
  const headers = ['Plan', 'Price', 'Data', 'Hotspot', 'Phone', 'Category'];
  const rows = reformattedRedonePlans.map(plan => [
    plan.name,
    `RM${plan.price.monthly}`,
    `${plan.data.total}${plan.data.unit}`,
    plan.data.hotspot ? `${plan.data.hotspot}${plan.data.unit}` : '-',
    plan.phoneOffer?.included ? '✓' : '-',
    plan.category
  ]);
  
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
