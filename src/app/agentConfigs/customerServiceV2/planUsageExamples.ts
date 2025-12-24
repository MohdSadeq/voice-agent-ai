/**
 * Usage Examples for Reformatted Plans
 * This file demonstrates how to use the reformatted plans for customer service
 */

import { 
  reformattedRedonePlans, 
  getPlanById, 
  getPlansByCategory,
  getPlansByPriceRange,
  getPlansWithFreePhone,
  comparePlans
} from './reformattedPlans';

import { 
  planQuestionAnswers, 
  getQuickFacts,
  generatePlanSummaryTable,
  describePlan
} from './planQueryUtils';

// Example 1: Customer asks "What's included in postpaidPLUS38?"
export const example1_whatIsIncluded = () => {
  console.log("Customer: What's included in postpaidPLUS38?");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.getWhatIsIncluded('postpaid-plus-38'));
};

// Example 2: Customer asks "Which plan has the most data?"
export const example2_mostData = () => {
  console.log("Customer: Which plan has the most data?");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.getMostDataPlan());
};

// Example 3: Customer asks "I need a plan with a free phone"
export const example3_freePhone = () => {
  console.log("Customer: I need a plan with a free phone");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.getPlansWithPhones());
};

// Example 4: Customer asks "What's the difference between postpaidPLUS38 and devicePRO68?"
export const example4_comparison = () => {
  console.log("Customer: What's the difference between postpaidPLUS38 and devicePRO68?");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.compareTwoPlans('postpaid-plus-38', 'device-pro-68'));
};

// Example 5: Customer asks "I have a budget of RM50, what can you recommend?"
export const example5_budget = () => {
  console.log("Customer: I have a budget of RM50, what can you recommend?");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.getPlansByBudget(50));
};

// Example 6: Customer asks "I use about 200GB per month, what plan should I get?"
export const example6_usage = () => {
  console.log("Customer: I use about 200GB per month, what plan should I get?");
  console.log("\nAgent Response:");
  console.log(planQuestionAnswers.getRecommendationByUsage(200, false));
};

// Example 7: Get quick facts for customer service agents
export const example7_quickFacts = () => {
  console.log("Agent needs quick facts about devicePRO98:");
  const facts = getQuickFacts('device-pro-98');
  console.log("\nQuick Facts:");
  facts.forEach(fact => console.log(`• ${fact}`));
};

// Example 8: Generate a comparison table
export const example8_summaryTable = () => {
  console.log("Generate a summary table of all plans:");
  console.log("\n" + generatePlanSummaryTable());
};

// Example 9: Natural language plan description
export const example9_describePlan = () => {
  console.log("Describe the family plan in natural language:");
  const familyPlan = getPlanById('postpaid-family-98');
  if (familyPlan) {
    console.log("\n" + describePlan(familyPlan));
  }
};

// Example 10: Complex query - "I need a 5G plan under RM70 with at least 150GB"
export const example10_complexQuery = () => {
  console.log("Customer: I need a 5G plan under RM70 with at least 150GB");
  
  // Filter plans
  const eligiblePlans = reformattedRedonePlans.filter(plan => 
    plan.price.monthly <= 70 && 
    plan.data.total >= 150 && 
    plan.network.type === '5G'
  );
  
  console.log("\nAgent Response:");
  if (eligiblePlans.length === 0) {
    console.log("I couldn't find any 5G plans under RM70 with at least 150GB.");
  } else {
    console.log(`I found ${eligiblePlans.length} plans that match your requirements:\n`);
    eligiblePlans.forEach(plan => {
      console.log(`• ${plan.name}: RM${plan.price.monthly}/month`);
      console.log(`  - ${plan.data.total}GB total data (${plan.data.hotspot || 0}GB hotspot)`);
      console.log(`  - ${plan.network.type} network`);
      console.log(`  - ${plan.tagline}`);
      if (plan.phoneOffer?.included) {
        console.log(`  - Bonus: ${plan.phoneOffer.type}`);
      }
      console.log();
    });
  }
};

// Run all examples
export const runAllExamples = () => {
  const examples = [
    example1_whatIsIncluded,
    example2_mostData,
    example3_freePhone,
    example4_comparison,
    example5_budget,
    example6_usage,
    example7_quickFacts,
    example8_summaryTable,
    example9_describePlan,
    example10_complexQuery
  ];
  
  examples.forEach((example, index) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`EXAMPLE ${index + 1}`);
    console.log(`${'='.repeat(60)}\n`);
    example();
  });
};

// Export for use in customer service agent
export const handlePlanQuery = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  // Pattern matching for common queries
  if (lowerQuery.includes('what') && lowerQuery.includes('included')) {
    // Extract plan name from query
    const plans = reformattedRedonePlans.map(p => p.name.toLowerCase());
    const foundPlan = plans.find(plan => lowerQuery.includes(plan));
    if (foundPlan) {
      const plan = reformattedRedonePlans.find(p => p.name.toLowerCase() === foundPlan);
      return planQuestionAnswers.getWhatIsIncluded(plan!.id);
    }
  }
  
  if (lowerQuery.includes('cheapest')) {
    return planQuestionAnswers.getCheapestPlan();
  }
  
  if (lowerQuery.includes('most data')) {
    return planQuestionAnswers.getMostDataPlan();
  }
  
  if (lowerQuery.includes('family')) {
    return planQuestionAnswers.getBestFamilyPlan();
  }
  
  if (lowerQuery.includes('phone')) {
    return planQuestionAnswers.getPlansWithPhones();
  }
  
  // Budget queries
  const budgetMatch = lowerQuery.match(/budget.*?(\d+)|under.*?(\d+)|less than.*?(\d+)/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]);
    return planQuestionAnswers.getPlansByBudget(budget);
  }
  
  // Data usage queries  
  const dataMatch = lowerQuery.match(/(\d+)\s*gb/);
  if (dataMatch && (lowerQuery.includes('use') || lowerQuery.includes('need'))) {
    const dataNeeded = parseInt(dataMatch[1]);
    const needsPhone = lowerQuery.includes('phone');
    return planQuestionAnswers.getRecommendationByUsage(dataNeeded, needsPhone);
  }
  
  return "I'm not sure what you're asking about. Could you please be more specific about which plan or feature you'd like to know about?";
};
