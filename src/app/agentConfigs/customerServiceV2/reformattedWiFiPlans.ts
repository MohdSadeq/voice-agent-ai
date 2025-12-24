/**
 * Reformatted Home WiFi Plans - Clear and organized structure
 * Each plan contains all information in a standardized format for easy querying
 */

export interface WiFiDevice {
  included: boolean;
  type?: string;
  networkSupport?: string[];
  value?: number;
}

export interface WiFiDataAllocation {
  total: number;
  unit: string;
  speedCap?: string;
}

export interface WiFiPlanPrice {
  monthly: number;
  currency: string;
  contractLength: string;
}

export interface WiFiFeature {
  included: boolean;
  details?: string;
}

export interface RedoneWiFiPlan {
  // Basic Information
  id: string;
  name: string;
  category: 'sim-only' | 'device-bundle';
  tagline: string;
  
  // Pricing
  price: WiFiPlanPrice;
  
  // Data Allocation
  data: WiFiDataAllocation;
  
  // Device Information
  device: WiFiDevice;
  
  // Network
  network: {
    type: string[];
    coverage: string;
  };
  
  // Contract Details
  contract: {
    duration: number;
    unit: string;
    earlyTerminationFee?: string;
  };
  
  // Installation
  installation: WiFiFeature;
  
  // Additional Benefits
  additionalBenefits: string[];
  
  // Restrictions or Notes
  notes?: string[];
}

export const reformattedWiFiPlans: RedoneWiFiPlan[] = [
  {
    id: 'homewifi-88-device',
    name: '5G homeWiFi88',
    category: 'device-bundle',
    tagline: 'Complete home WiFi solution with 5G router',
    price: {
      monthly: 88,
      currency: 'RM',
      contractLength: '24 months'
    },
    data: {
      total: 1000,
      unit: 'GB',
      speedCap: '5G speeds where available'
    },
    device: {
      included: true,
      type: '5G WiFi Router',
      networkSupport: ['4G', '5G'],
      value: 500 // Estimated device value
    },
    network: {
      type: ['4G', '5G'],
      coverage: 'Nationwide where available'
    },
    contract: {
      duration: 24,
      unit: 'months',
      earlyTerminationFee: 'Device cost pro-rated'
    },
    installation: {
      included: true,
      details: 'Self-installation with guide provided'
    },
    additionalBenefits: [
      'FREE 5G WiFi Router included',
      '1TB (1000GB) monthly data',
      'Support for 4G and 5G networks',
      'Connect multiple devices',
      'No installation fee'
    ],
    notes: [
      '24-month contract required',
      'Router remains property of redONE during contract',
      'Terms & conditions apply'
    ]
  },
  {
    id: 'homewifi-68-sim',
    name: '5G homeWiFi68',
    category: 'sim-only',
    tagline: 'Flexible home WiFi for your own router',
    price: {
      monthly: 68,
      currency: 'RM',
      contractLength: '12 months'
    },
    data: {
      total: 1000,
      unit: 'GB',
      speedCap: '5G speeds where available'
    },
    device: {
      included: false,
      type: 'Bring your own router'
    },
    network: {
      type: ['4G', '5G'],
      coverage: 'Nationwide where available'
    },
    contract: {
      duration: 12,
      unit: 'months',
      earlyTerminationFee: 'Standard early termination charges apply'
    },
    installation: {
      included: true,
      details: 'SIM card provided, self-installation'
    },
    additionalBenefits: [
      'SIM only - use your own router',
      '1TB (1000GB) monthly data',
      'Shorter 12-month contract',
      'Lower monthly cost',
      'Flexibility to change routers'
    ],
    notes: [
      '12-month contract required',
      'Customer must have compatible 4G/5G router',
      'Terms & conditions apply'
    ]
  }
];

// Helper functions for easy querying
export const getWiFiPlanById = (id: string): RedoneWiFiPlan | undefined => {
  return reformattedWiFiPlans.find(plan => plan.id === id);
};

export const getWiFiPlansByCategory = (category: string): RedoneWiFiPlan[] => {
  return reformattedWiFiPlans.filter(plan => plan.category === category);
};

export const getWiFiPlansByPriceRange = (min: number, max: number): RedoneWiFiPlan[] => {
  return reformattedWiFiPlans.filter(plan => 
    plan.price.monthly >= min && plan.price.monthly <= max
  );
};

export const getWiFiPlansWithDevice = (): RedoneWiFiPlan[] => {
  return reformattedWiFiPlans.filter(plan => plan.device.included === true);
};

// Comparison helper
export const compareWiFiPlans = (): any => {
  const devicePlan = reformattedWiFiPlans.find(p => p.category === 'device-bundle');
  const simOnlyPlan = reformattedWiFiPlans.find(p => p.category === 'sim-only');
  
  return {
    comparison: [
      {
        feature: 'Monthly Price',
        deviceBundle: `RM${devicePlan?.price.monthly}`,
        simOnly: `RM${simOnlyPlan?.price.monthly}`,
        difference: `RM${(devicePlan?.price.monthly || 0) - (simOnlyPlan?.price.monthly || 0)} more for device`
      },
      {
        feature: 'Contract Length',
        deviceBundle: `${devicePlan?.contract.duration} months`,
        simOnly: `${simOnlyPlan?.contract.duration} months`,
        difference: 'SIM only has shorter contract'
      },
      {
        feature: 'Data Allocation',
        deviceBundle: `${devicePlan?.data.total}${devicePlan?.data.unit}`,
        simOnly: `${simOnlyPlan?.data.total}${simOnlyPlan?.data.unit}`,
        difference: 'Same data for both plans'
      },
      {
        feature: '5G Router',
        deviceBundle: 'Included FREE',
        simOnly: 'Not included (BYO)',
        difference: 'Device plan includes router'
      }
    ],
    recommendation: {
      forNewCustomers: 'homeWiFi88 - includes everything you need',
      forExistingRouterOwners: 'homeWiFi68 - save money with your own router'
    }
  };
};

// Natural language descriptions
export const describeWiFiPlan = (plan: RedoneWiFiPlan): string => {
  const deviceInfo = plan.device.included 
    ? ` Includes a FREE ${plan.device.type}.`
    : ' SIM only - bring your own router.';
    
  return `${plan.name} (RM${plan.price.monthly}/month): ${plan.tagline}. 
    Offers ${plan.data.total}${plan.data.unit} of home internet data with ${plan.network.type.join('/')} support.${deviceInfo}
    Requires a ${plan.contract.duration}-month contract.`;
};
