/**
 * Reformatted Redone Plans - Clear and organized structure
 * Each plan contains all information in a standardized format for easy querying
 */

export interface PlanFeature {
  included: boolean;
  details?: string;
  amount?: number;
  unit?: string;
}

export interface DataAllocation {
  total: number;
  fastInternet?: number;
  hotspot?: number;
  unit: string;
}

export interface PlanPrice {
  monthly: number;
  currency: string;
  contractLength?: string;
}

export interface BundledServices {
  redSocial: PlanFeature;
  redVideo: PlanFeature;
}

export interface PhoneOffer {
  included: boolean;
  type?: string;
  conditions?: string;
}

export interface RedonePlan {
  // Basic Information
  id: string;
  name: string;
  category: 'postpaid' | 'family' | 'device' | 'prepaid';
  tagline: string;
  
  // Pricing
  price: PlanPrice;
  
  // Data Allocation
  data: DataAllocation;
  
  // Voice & SMS
  calls: PlanFeature;
  sms: PlanFeature;
  
  // Network
  network: {
    type: '4G' | '5G';
    speedCap?: string;
  };
  
  // Bundled Services
  bundledServices: BundledServices;
  
  // Special Features
  phoneOffer?: PhoneOffer;
  familyLines?: number;
  internationalRoaming?: PlanFeature;
  
  // Additional Benefits
  additionalBenefits: string[];
  
  // Restrictions or Notes
  notes?: string[];
}

export const reformattedRedonePlans: RedonePlan[] = [
  // POSTPAID PLANS
  {
    id: 'postpaid-plus-38',
    name: 'postpaidPLUS38',
    category: 'postpaid',
    tagline: 'The ultimate 5G postpaid',
    price: {
      monthly: 38,
      currency: 'RM'
    },
    data: {
      total: 180,
      fastInternet: 130,
      hotspot: 50,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Access to 5G network',
      'No contract required',
      'Free SIM card'
    ]
  },
  
  {
    id: 'postpaid-plus-48',
    name: 'postpaidPLUS48',
    category: 'postpaid',
    tagline: 'The ultimate 5G postpaid',
    price: {
      monthly: 48,
      currency: 'RM'
    },
    data: {
      total: 250,
      fastInternet: 150,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Access to 5G network',
      'Higher data allocation',
      'Double hotspot quota',
      'Priority customer service'
    ]
  },
  
  // FAMILY PLAN
  {
    id: 'postpaid-family-98',
    name: 'postpaidFAMILY98',
    category: 'family',
    tagline: 'The most affordable family plan for your whole family',
    price: {
      monthly: 98,
      currency: 'RM'
    },
    data: {
      total: 1000,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks for all lines'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    familyLines: 3,
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed per line'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day per line'
      }
    },
    additionalBenefits: [
      'Share 1TB data among 3 lines',
      'Each line gets bundled services',
      'Family account management',
      'Free additional SIM cards'
    ],
    notes: [
      'Data is shared among all family lines',
      'Primary account holder manages all lines'
    ]
  },
  
  // DEVICE PLANS
  {
    id: 'redplan-plus-38',
    name: 'redplanPLUS38',
    category: 'device',
    tagline: 'The fastest access to a FREE 5G Phone',
    price: {
      monthly: 38,
      currency: 'RM',
      contractLength: '6 months'
    },
    data: {
      total: 180,
      fastInternet: 130,
      hotspot: 50,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE 5G Phone',
      conditions: 'Sign up for 6 months contract AND add a supplementary line OR upgrade with loyalty plan'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Fast-track to free phone',
      'Short 6-month contract',
      'Same benefits as postpaidPLUS38'
    ],
    notes: [
      'Requires 6-month contract commitment',
      'Free phone requires additional line or loyalty upgrade'
    ]
  },
  
  {
    id: 'device-pro-68',
    name: 'devicePRO68',
    category: 'device',
    tagline: 'The best phone bundle plan with FREE 5G phone',
    price: {
      monthly: 68,
      currency: 'RM'
    },
    data: {
      total: 200,
      fastInternet: 150,
      hotspot: 50,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE Basic 5G Phone',
      conditions: 'Included with plan signup'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Free basic 5G phone included',
      'No additional requirements',
      'Higher data allocation than basic plans'
    ]
  },
  
  {
    id: 'device-pro-98',
    name: 'devicePRO98',
    category: 'device',
    tagline: 'The perfect postpaid plan with FREE 5G phone for everyone',
    price: {
      monthly: 98,
      currency: 'RM'
    },
    data: {
      total: 300,
      fastInternet: 200,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE High-Tech 5G Phone',
      conditions: 'Included with plan signup'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Premium 5G phone included',
      'Highest data allocation',
      'Double hotspot quota',
      'Premium customer support'
    ]
  },
  
  // Additional DEVICE PLAN
  {
    id: 'redplan-plus-48',
    name: 'redplanPLUS48',
    category: 'device',
    tagline: 'The fastest access to a FREE 5G Phone',
    price: {
      monthly: 48,
      currency: 'RM',
      contractLength: '6 months'
    },
    data: {
      total: 250,
      fastInternet: 150,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE 5G Phone',
      conditions: 'Sign up for 6 months contract AND add a supplementary line OR upgrade with loyalty plan'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'Higher data allocation than redplanPLUS38',
      'Fast-track to free phone',
      'Short 6-month contract',
      'Double hotspot quota'
    ],
    notes: [
      'Requires 6-month contract commitment',
      'Free phone requires additional line or loyalty upgrade'
    ]
  },
  
  // BASIC POSTPAID PLAN
  {
    id: '5g-postpaid-10',
    name: '5GPostpaid10',
    category: 'postpaid',
    tagline: 'The affordable basic postpaid plan in town',
    price: {
      monthly: 10,
      currency: 'RM'
    },
    data: {
      total: 3,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to redONE Postpaid only'
    },
    sms: {
      included: false,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'Most affordable postpaid plan',
      'Basic 5G access',
      'Perfect for light users'
    ],
    notes: [
      'Calls limited to redONE Postpaid network only',
      'No bundled services included'
    ]
  },
  
  // UNLIMITED PLAN
  {
    id: 'ux-50',
    name: 'UX50',
    category: 'postpaid',
    tagline: 'The best unlimited plan',
    price: {
      monthly: 50,
      currency: 'RM'
    },
    data: {
      total: 9999, // Representing unlimited
      fastInternet: 30,
      hotspot: 30,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited voice calls to all networks in Malaysia'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G',
      speedCap: 'Unlimited at 6 Mbps after 30GB (FUP 100GB/month, then 64kbps)'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 15,
        unit: 'GB',
        details: '500MB per day'
      }
    },
    additionalBenefits: [
      'Unlimited data at 6 Mbps',
      '30GB high-speed data',
      'Fair Usage Policy applies',
      'Perfect for heavy streamers'
    ],
    notes: [
      'Speed reduced to 6 Mbps after 30GB high-speed data',
      'Further reduced to 64kbps after 100GB total usage'
    ]
  },
  
  // SUPPLEMENTARY PLAN
  {
    id: 'family-38',
    name: 'Family38',
    category: 'family',
    tagline: 'The most affordable plan for your family',
    price: {
      monthly: 38,
      currency: 'RM'
    },
    data: {
      total: 180,
      fastInternet: 130,
      hotspot: 50,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'Supplementary line for masterline customers',
      'Same data allocation as postpaidPLUS38',
      'Available for RM38+ masterline plans'
    ],
    notes: [
      'Only available as supplementary line',
      'Requires eligible masterline (RM38 and above)'
    ]
  },
  
  // EXCLUSIVE PLANS
  {
    id: 'postpaid-sfc-48',
    name: 'PostpaidSFC48',
    category: 'postpaid',
    tagline: 'Exclusive postpaid with FREE jersey for football fans',
    price: {
      monthly: 48,
      currency: 'RM',
      contractLength: '6 months with RM10 rebate'
    },
    data: {
      total: 250,
      fastInternet: 150,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: true,
        amount: 10,
        unit: 'GB',
        details: '4G LTE speed'
      },
      redVideo: {
        included: true,
        amount: 30,
        unit: 'GB',
        details: '1GB per day'
      }
    },
    additionalBenefits: [
      'FREE 2x Sabah FC special edition jersey',
      'RM10 monthly rebate for 6 months',
      'Effective price: RM38/month',
      'Perfect for football fans'
    ],
    notes: [
      'Limited edition Sabah FC promotion',
      'RM10 rebate for first 6 months'
    ]
  },
  
  {
    id: 'redplan-km-48',
    name: 'redplanKM48',
    category: 'postpaid',
    tagline: 'Eksklusif postpaid for e-hailing drivers and food delivery riders',
    price: {
      monthly: 48,
      currency: 'RM'
    },
    data: {
      total: 250,
      fastInternet: 150,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'FREE RM120 Petrol Voucher',
      'Perfect for drivers and riders',
      'High data allocation for navigation',
      'Large hotspot quota'
    ],
    notes: [
      'Exclusive for e-hailing and delivery workers'
    ]
  },
  
  // MUKMIN PLANS (Government Servants)
  {
    id: 'mukmin-58',
    name: 'Mukmin58',
    category: 'postpaid',
    tagline: 'Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants',
    price: {
      monthly: 58,
      currency: 'RM'
    },
    data: {
      total: 200,
      fastInternet: 150,
      hotspot: 50,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE Smartphone',
      conditions: 'For government servants only'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'RM12,500 Takaful Coverage',
      'FREE Smartphone included',
      'Exclusive for government servants',
      '200GB total data'
    ],
    notes: [
      'Only available for government servants',
      'Includes Takaful protection'
    ]
  },
  
  {
    id: 'mukmin-88',
    name: 'Mukmin88',
    category: 'postpaid',
    tagline: 'Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants',
    price: {
      monthly: 88,
      currency: 'RM'
    },
    data: {
      total: 300,
      fastInternet: 200,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'FREE Smartphone',
      conditions: 'For government servants only'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'RM12,500 Takaful Coverage',
      'FREE Smartphone included',
      'Higher data allocation',
      'Double hotspot quota'
    ],
    notes: [
      'Only available for government servants',
      'Includes Takaful protection'
    ]
  },
  
  {
    id: 'mukmin-188',
    name: 'Mukmin188',
    category: 'postpaid',
    tagline: 'Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants',
    price: {
      monthly: 188,
      currency: 'RM',
      contractLength: '36 months installment'
    },
    data: {
      total: 300,
      fastInternet: 200,
      hotspot: 100,
      unit: 'GB'
    },
    calls: {
      included: true,
      details: 'Unlimited calls to all networks'
    },
    sms: {
      included: true,
      details: 'Standard SMS rates apply'
    },
    network: {
      type: '5G'
    },
    phoneOffer: {
      included: true,
      type: 'Phone Installment Plan',
      conditions: 'RM100 x 36 months installment'
    },
    bundledServices: {
      redSocial: {
        included: false
      },
      redVideo: {
        included: false
      }
    },
    additionalBenefits: [
      'RM12,500 Takaful Coverage',
      'Phone installment plan',
      'Post-contract price: RM88/month',
      'Premium device selection'
    ],
    notes: [
      'Only available for government servants',
      'RM188 = RM88 plan + RM100 device installment',
      'Price reduces to RM88 after 36 months'
    ]
  }
];

// Helper functions for easy querying
export const getPlanById = (id: string): RedonePlan | undefined => {
  return reformattedRedonePlans.find(plan => plan.id === id);
};

export const getPlansByCategory = (category: string): RedonePlan[] => {
  return reformattedRedonePlans.filter(plan => plan.category === category);
};

export const getPlansByPriceRange = (min: number, max: number): RedonePlan[] => {
  return reformattedRedonePlans.filter(plan => 
    plan.price.monthly >= min && plan.price.monthly <= max
  );
};

export const getPlansWithFreePhone = (): RedonePlan[] => {
  return reformattedRedonePlans.filter(plan => 
    plan.phoneOffer?.included === true
  );
};

export const getPlansByDataAmount = (minGB: number): RedonePlan[] => {
  return reformattedRedonePlans.filter(plan => 
    plan.data.total >= minGB
  );
};

// Quick comparison helper
export const comparePlans = (planIds: string[]): any => {
  const plans = planIds.map(id => getPlanById(id)).filter((plan): plan is RedonePlan => plan !== undefined);
  
  return {
    plans: plans.map(plan => ({
      name: plan.name,
      price: plan.price.monthly,
      data: plan.data.total,
      category: plan.category,
      hasPhone: plan.phoneOffer?.included || false
    })),
    cheapest: plans.length > 0 ? plans.reduce((min, plan) => 
      plan.price.monthly < min.price.monthly ? plan : min
    ) : null,
    mostData: plans.length > 0 ? plans.reduce((max, plan) => 
      plan.data.total > max.data.total ? plan : max
    ) : null
  };
};
