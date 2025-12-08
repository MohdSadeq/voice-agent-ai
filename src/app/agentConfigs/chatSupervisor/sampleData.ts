import users from './fake.users.json';

// Helper function to format currency in Malaysian Ringgit (RM)
const formatCurrency = (amount?: number): string => {
  if (amount === undefined || amount === null) return 'RM 0.00';
  return `RM ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

interface VAS {
  id: number;
  name: string;
  amount: number;
  type?: string;
}

interface SubscribedVAS {
  id: number;
  subscribedDate: string;
  vasId: number;
  customerId: number;
  vas: VAS;
}

interface MobilePlan {
  id: number;
  name: string;
  amount: number;
  planVas: VAS[];
}

interface PaymentHistory {
  id: number;
  amount: number;
  transactionDate: string;
  processedDate: string;
  customerId: number;
}

interface Invoice {
  id: number;
  amount: number;
  date: string;
  customerId: number;
}

interface BarringHistory {
  id: number;
  date: string;
  status: 'BARRED' | 'UNBARRED';
  reason: string;
  customerId: number;
}

interface Ticket {
  id: number;
  title: string;
  summary: string;
  status: string;
  category: string;
  pendingFor: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
}

interface CustomerLog {
  id: string;
  timestamp: string;
  summary: string;
  category: 'network' | 'billing' | 'service' | 'technical' | 'general';
  status: 'resolved' | 'escalated' | 'pending' | 'closed';
  actions: string[];
  agent: string;
  duration: number;
  followUpRequired: boolean;
  followUpDate?: string;
}

interface User {
  id: number;
  callerId: string;
  name: string;
  email: string;
  nric: string;
  accountId: string;
  phoneModel: string;
  mobilePlanId: number;
  commencementDate: string;
  contractStart: string;
  contractEnd: string;
  suspensionDate: string;
  barringDate: string;
  roaming: boolean;
  iddCall: boolean;
  lte: boolean;
  volte: boolean;
  enable5g: boolean;
  allDivert: boolean;
  voiceMail: boolean;
  masterAccountId: string;
  creditLimit: number;
  regType: string;
  activationSource: string;
  puk: string;
  serial: string;
  mobilePlan: MobilePlan;
  subscribedVasses: SubscribedVAS[];
  paymentHistories: PaymentHistory[];
  invoices: Invoice[];
  barringHistories: BarringHistory[];
  ticketHistories: Ticket[];
  customerLogs?: CustomerLog[];
}

export const getAccountInfo = (userId: number = 1) => {
  const user = (users as User[]).find(u => u.id === userId);
  if (!user) throw new Error(`User with ID ${userId} not found`);
  
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate contract status
  const now = new Date();
  const contractEnd = new Date(user.contractEnd);
  const suspensionDate = new Date(user.suspensionDate);
  const barringDate = new Date(user.barringDate);
  
  let status = 'Active';
  if (now > barringDate) status = 'Barred';
  else if (now > suspensionDate) status = 'Suspended';
  else if (now > contractEnd) status = 'Expired';

  // Get active services
  const activeServices = [
    user.roaming && 'Roaming',
    user.iddCall && 'IDD Calls',
    user.volte && 'VoLTE',
    user.enable5g && '5G',
    user.allDivert && 'Call Divert',
    user.voiceMail && 'Voicemail'
  ].filter(Boolean);

  // Get subscribed VAS
  const subscribedServices = user.subscribedVasses?.map(sv => ({
    name: sv.vas.name,
    amount: sv.vas.amount,
    subscribedDate: formatDate(sv.subscribedDate)
  })) || [];

  // Get available plan VAS
  const availableVAS = user.mobilePlan?.planVas
    .filter(v => v.type === 'AVAILABLE')
    .map(v => ({
      name: v.name,
      amount: v.amount
    })) || [];

  // Get default plan VAS
  const defaultVAS = user.mobilePlan?.planVas
    .filter(v => v.type === 'DEFAULT')
    .map(v => ({
      name: v.name,
      amount: v.amount
    })) || [];

  return {
    // Basic Information
    accountInfo: {
      accountId: user.accountId,
      masterAccountId: user.masterAccountId,
      registrationType: user.regType,
      activationSource: user.activationSource,
      status,
      creditLimit: formatCurrency(user.creditLimit),
      puk: user.puk,
      serial: user.serial
    },
    
    // Personal Information
    personalInfo: {
      name: user.name,
      nric: user.nric,
      email: user.email,
      phone: user.callerId,
      phoneModel: user.phoneModel
    },
    
    // Plan Information
    planInfo: {
      planName: user.mobilePlan?.name || 'No Plan',
      planAmount: formatCurrency(user.mobilePlan?.amount),
      defaultServices: defaultVAS,
      availableServices: availableVAS,
      subscribedServices,
      networkFeatures: {
        lte: user.lte,
        volte: user.volte,
        enable5g: user.enable5g
      }
    },
    
    // Contract Information
    contractInfo: {
      commencementDate: formatDate(user.commencementDate),
      contractStart: formatDate(user.contractStart),
      contractEnd: formatDate(user.contractEnd),
      suspensionDate: formatDate(user.suspensionDate),
      barringDate: formatDate(user.barringDate),
      daysRemaining: Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    },
    
    // Service Status
    serviceStatus: {
      roaming: user.roaming,
      iddCall: user.iddCall,
      allDivert: user.allDivert,
      voiceMail: user.voiceMail,
      activeServices
    },
    
    // Billing Information
    billingInfo: {
      lastBillDate: formatDate(user.invoices?.[user.invoices.length - 1]?.date || new Date().toISOString()),
      lastBillAmount: formatCurrency(user.invoices?.[user.invoices.length - 1]?.amount || 0),
      nextBillDate: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()),
      outstandingBalance: formatCurrency(user.creditLimit * 0.8),
      paymentHistory: (user.paymentHistories || [])
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 3)
        .map(payment => ({
          date: formatDate(payment.transactionDate),
          amount: formatCurrency(payment.amount),
          method: payment.amount > 100 ? 'Credit Card' : 'Online Banking',
          reference: `PAY${payment.id.toString().padStart(6, '0')}`
        })),
      barringHistory: (user.barringHistories || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map(barring => ({
          date: formatDate(barring.date),
          reason: barring.reason,
          status: barring.status,
          action: barring.status === 'BARRED' ? 'Barred' : 'Unbarred'
        })),
      invoices: (user.invoices || [])
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map((invoice, index) => {
          const invoiceDate = new Date(invoice.date);
          const dueDate = new Date(invoice.date);
          dueDate.setDate(21);
          
          return {
            invoiceNumber: `INV${invoiceDate.getFullYear()}${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${(index + 1).toString().padStart(3, '0')}`,
            date: formatDate(invoiceDate.toISOString()),
            dueDate: formatDate(dueDate.toISOString()),
            amount: formatCurrency(invoice.amount),
            status: new Date() > dueDate ? 'Paid' : 'Pending',
            items: [
              { description: `Monthly Subscription - ${user.mobilePlan?.name}`, amount: formatCurrency(user.mobilePlan?.amount || 0) },
              { description: 'Value Added Services', amount: formatCurrency(invoice.amount - (user.mobilePlan?.amount || 0) * 1.06) },
              { description: 'Tax (6%)', amount: formatCurrency((user.mobilePlan?.amount || 0) * 0.06) }
            ]
          };
        })
    },
    
    // Additional Information
    additionalInfo: {
      notes: `Contract will be suspended on ${formatDate(user.suspensionDate)} if not renewed.`,
      activationNotes: `Activated via ${user.activationSource} on ${formatDate(user.commencementDate)}`
    },
    
    // Ticket History
    ticketHistory: (user.ticketHistories || [])
      .sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((ticket: Ticket) => ({
        id: ticket.id,
        title: ticket.title,
        summary: ticket.summary,
        status: ticket.status,
        category: ticket.category,
        pendingFor: ticket.pendingFor,
        nextAction: ticket.nextAction,
        createdAt: formatDate(ticket.createdAt),
        updatedAt: formatDate(ticket.updatedAt)
      })),

    // Customer Service Logs
    customerLogs: (user.customerLogs || [])
      .sort((a: CustomerLog, b: CustomerLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((log: CustomerLog) => ({
        summary: log.summary,
        category: log.category,
      }))
  };
};

export const getUserByMobile = (mobileNumber: string) => {
  // First, remove all non-digit characters including brackets
  const digitsOnly = mobileNumber.replace(/[^\d]/g, '');
  
  // Check if the number starts with 60 (country code for Malaysia)
  // If not, add it
 
  
  const user = (users as User[]).find(u => {
    // Clean the stored number for comparison
    const storedNumber = u.callerId.replace(/\D/g, '');
    return storedNumber === digitsOnly;
  });
  
  if (!user) {
    throw new Error(`No user found with mobile number: ${mobileNumber}`);
  }
  
  return getAccountInfo(user.id);
};

//export const exampleAccountInfo = getUserByMobile("60123456789"); // Default to first user for backward compatibility

export const exampleFAQQuestions = [
  {
    id: "ID-010",
    name: "Family Plan Policy",
    topic: "family plan options",
    content:
      "",
  },
  {
    id: "ID-020",
    name: "Promotions and Discounts Policy",
    topic: "promotions and discounts",
    content:
      "",
  },
  {
    id: "ID-030",
    name: "International Plans Policy",
    topic: "international plans",
    content:
      ""
  },
  {
    id: "ID-040",
    name: "Handset Offers Policy",
    topic: "new handsets",
    content:
      "",
  },
];

export const exampleRedoneSearchResults = [
  {
    "popular_plans": [
      {
        "plan_name": "postpaidPLUS38",
        "subtitle": "The ultimate 5G postpaid",
        "price": {
          "amount": 38,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "total": "180 GB Total Internet",
          "breakdown": {
            "fast_internet": "130 GB Fast Internet",
            "hotspot": "50 GB Hotspot"
          }
        },
        "calls": "Unlimited Calls to all network",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        }
      },
      {
        "plan_name": "postpaidPLUS48",
        "subtitle": "The ultimate 5G postpaid",
        "price": {
          "amount": 48,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "total": "250 GB Total Internet",
          "breakdown": {
            "fast_internet": "150 GB Fast Internet",
            "hotspot": "100 GB Hotspot"
          }
        },
        "calls": "Unlimited Calls to all network",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        }
      },
      {
        "plan_name": "postpaidFAMILY98",
        "subtitle": "The most affordable family plan for your whole family",
        "price": {
          "amount": 98,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "total": "1,000 GB Total Internet"
        },
        "calls": "Unlimited Calls to all network",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        },
        "lines": "Up to 3 lines",
      },
      {
        "plan_name": "redplanPLUS38",
        "subtitle": "The fastest access to a FREE 5G Phone",
        "price": {
          "amount": 38,
          "currency": "RM",
          "period": "/ mth"
        },
        "contract": "6-Month Contrac  t",
        "data": {
          "total": "180 GB Total Internet",
          "breakdown": {
            "fast_internet": "130 GB Fast Internet",
            "hotspot": "50 GB Hotspot"
          }
        },
        "calls": "Unlimited Calls to all networks",
        "free_phone": {
          "title": "Fast-Track to FREE 5G Phone",
          "condition": "*Sign up for this plan for 6 months contract and add a supplementary line or upgrade with loyalty plan"
        },
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        }
      },
      {
        "plan_name": "devicePRO68",
        "subtitle": "The best phone bundle plan with FREE 5G phone",
        "price": {
          "amount": 68,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "total": "200 GB Total Internet",
          "breakdown": {
            "internet": "150 GB Internet",
            "hotspot": "50 GB Hotspot"
          }
        },
        "calls": "Unlimited Calls to all networks",
        "free_phone": "FREE Basic 5G Phone",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        }
      },
      {
        "plan_name": "devicePRO98",
        "subtitle": "The perfect postpaid plan with FREE 5G phone for everyone",
        "price": {
          "amount": 98,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "total": "300 GB Total Internet",
          "breakdown": {
            "internet": "200 GB Internet",
            "hotspot": "100 GB Hotspot"
          }
        },
        "calls": "Unlimited Calls to all networks",
        "free_phone": "FREE High-Tech 5G Phone",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "30GB redVIDEO (1GB/day) **"
        }
      }
    ],
    "best_value_plans": [
        {
          "plan_name": "postpaidPLUS38",
          "subtitle": "The ultimate 5G postpaid",
          "price": {
            "amount": 38,
            "currency": "RM",
            "period": "/ mth"
          },
          "data": {
            "total": "180 GB Total Internet",
            "breakdown": {
              "fast_internet": "130 GB Fast Internet",
              "hotspot": "50 GB Hotspot"
            }
          },
          "calls": "Unlimited Calls to all network",
          "bundled_vas": {
            "social": "10GB 4G LTE redSOCIAL",
            "video": "30GB redVIDEO (1GB/day) **"
          }   
        },
        {
          "plan_name": "postpaidPLUS48",
          "subtitle": "The ultimate 5G postpaid",
          "price": {
            "amount": 48,
            "currency": "RM",
            "period": "/ mth"
          },
          "data": {
            "total": "250 GB Total Internet",
            "breakdown": {
              "fast_internet": "150 GB Fast Internet",
              "hotspot": "100 GB Hotspot"
            }
          },
          "calls": "Unlimited Calls to all network",
          "bundled_vas": {
            "social": "10GB 4G LTE redSOCIAL",
            "video": "30GB redVIDEO (1GB/day) **"
          }
        },
        {
          "plan_name": "postpaidFAMILY98",
          "subtitle": "The most affordable family plan for your whole family",
          "price": {
            "amount": 98,
            "currency": "RM",
            "period": "/ mth"
          },
          "data": {
            "total": "1,000 GB Total Internet"
          },
          "calls": "Unlimited Calls to all network",
          "bundled_vas": {
            "social": "10GB 4G LTE redSOCIAL",
            "video": "30GB redVIDEO (1GB/day) **"
          },
          "lines": "Up to 3 lines",
        },
        {
          "plan_name": "redplanPLUS38",
          "subtitle": "The fastest access to a FREE 5G Phone",
          "price": {
            "amount": 38,
            "currency": "RM",
            "period": "/ mth"
          },
          "contract": "6-Month Contract",
          "data": {
            "total": "180 GB Total Internet",
            "breakdown": {
              "fast_internet": "130 GB Fast Internet",
              "hotspot": "50 GB Hotspot"
            }
          },
          "calls": "Unlimited Calls to all networks",
          "free_phone": {
            "title": "Fast-Track to FREE 5G Phone",
            "condition": "*Sign up for this plan for 6 months contract and add a supplementary line or upgrade with loyalty plan"
          },
          "bundled_vas": {
            "social": "10GB 4G LTE redSOCIAL",
            "video": "30GB redVIDEO (1GB/day) **"
          },
        },
        {
          "plan_name": "redplanPLUS48",
          "subtitle": "The fastest access to a FREE 5G Phone",
          "price": {
            "amount": 48,
            "currency": "RM",
            "period": "/ mth"
          },
          "contract": "6-Month Contract",
          "data": {
            "total": "250 GB Total Internet",
            "breakdown": {
              "fast_internet": "150 GB Fast Internet",
              "hotspot": "100 GB Hotspot"
            }
          },
          "calls": "Unlimited Calls to all networks",
          "free_phone": {
            "title": "Fast-Track to FREE 5G Phone",
            "condition": "*Sign up for this plan for 6 months contract and add a supplementary line or upgrade with loyalty plan"
          },
          "bundled_vas": {
            "social": "10GB 4G LTE redSOCIAL",
            "video": "30GB redVIDEO (1GB/day) **"
          },
        },
        {
          "plan_name": "5GPostpaid10",
          "subtitle": "The affordable basic postpaid plan in town",
          "price": {
            "amount": 10,
            "currency": "RM",
            "period": "/ mth"
          },
          "data": {
            "total": "3 GB Fast Data"
          },
          "calls": {
            "title": "Unlimited Calls",
            "description": "to redONE Postpaid"
          },
          "sign_up": {
            "button_text": "SIGN UP",
            "action": "popup:open",
            "popup_id": 63662,
            "title": "hybrid50u"
          },
        }
      ],
    "unlimited_internet": [
      {
        "plan_name": "UX50",
        "subtitle": "The best unlimited plan",
        "price": {
          "amount": 50,
          "currency": "RM",
          "period": "/ mth"
        },
        "data": {
          "high_speed": "30 GB high-speed data",
          "unlimited": "Unlimited at 6 Mbps (FUP 100GB/month, then 64kbps)",
          "hotspot": "30 GB shareable"
        },
        "calls": "Unlimited voice calls to all networks in Malaysia",
        "bundled_vas": {
          "social": "10GB 4G LTE redSOCIAL",
          "video": "15GB redVIDEO (500MB/day) **"
        },
      }
    ],
    "supplementary": {
        "title": "For RM38 and Above Masterline Customers",
        "applies_to_masterlines": [
          "postpaidPLUS38",
          "postpaidPLUS48",
          "postpaidFAMILY98",
          "redplanPLUS38",
          "redplanPLUS48",
          "devicePRO68",
          "devicePRO98"
        ],
        "plans": [
          {
            "plan_name": "Family38",
            "subtitle": "The most affordable plan for your family",
            "price": {
              "amount": 38,
              "currency": "RM",
              "period": "/ mth"
            },
            "data": {
              "total": "180 GB Total Internet",
              "breakdown": {
                "fast_internet": "130 GB Fast Internet",
                "hotspot": "50 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls",
            "sign_up": {
              "button_text": "Sign Up",
              "action": "popup:open",
              "popup_id": 63682,
              "title": "hybrid50u"
            },
            "images": {
              "data_icon": "https://www.redonemobile.com.my/wp-content/uploads/2025/09/Asset-2.png",
              "calls_icon": "https://www.redonemobile.com.my/wp-content/uploads/2021/12/Asset-3.png"
            }
          }
        ],
        "note": "Supplementary lines available for eligible masterline plans priced at RM38/month and above"
      },
      "exclusive": [
          {
            "plan_name": "PostpaidSFC48",
            "subtitle": "Exclusive postpaid with FREE jersey for football fans",
            "price": {
              "original": 48,
              "discounted": 38,
              "currency": "RM",
              "period": "monthly",
              "rebate": "RM10 bill rebate for 6 months"
            },
            "data": {
              "total": "250 GB Total Internet",
              "breakdown": {
                "internet": "150 GB Internet",
                "hotspot": "100 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls to all network",
            "bundled_vas": {
              "social": "10GB 4G LTE redSOCIAL",
              "video": "30GB redVIDEO (1GB/day) **"
            },
            "free_gift": "FREE 2x Sabah FC special edition jersey"
          },
          {
            "plan_name": "PrepaidSFC",
            "subtitle": "Exclusive prepaid with FREE jersey for football fans",
            "starter_pack": {
              "price": 8,
              "currency": "RM"
            },
            "activation_bonus": "1 GB Activation Bonus",
            "port_in_benefits": {
              "free_credit": "FREE RM5 Credit",
              "monthly_bonus": "RM5 Credit Bonus for 6 Months",
              "note": "exclusively for port-in customers"
            },
            "free_jersey": {
              "title": "FREE 1x Sabah FC special edition jersey",
              "condition": "top up RM50 and purchase the ULTRAplus35 internet plan"
            },
            "bundled_vas": {
              "social": "10GB 4G LTE redSOCIAL",
              "video": "30GB redVIDEO (1GB/day) **"
            }
          },
          {
            "plan_name": "redplanKM48",
            "subtitle": "Eksklusif postpaid for e-hailing drivers and food delivery riders",
            "price": {
              "amount": 48,
              "currency": "RM",
              "period": "/ mth"
            },
            "data": {
              "total": "250 GB Total Internet",
              "breakdown": {
                "fast_internet": "150 GB Fast Internet",
                "hotspot": "100 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls to all network",
            "free_gift": "FREE RM120 Petrol Voucher",
            "sign_up": {
              "button_text": "Sign Up",
              "action": "popup:open",
              "popup_id": 22278,
              "title": "hybrid50u"
            }
          },
          {
            "plan_name": "Mukmin58",
            "subtitle": "Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants",
            "price": {
              "amount": 58,
              "currency": "RM",
              "period": "/ mth"
            },
            "data": {
              "total": "200 GB Total Internet",
              "breakdown": {
                "fast_internet": "150 GB Fast Internet",
                "hotspot": "50 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls to all network",
            "takaful_coverage": "RM12,500 Takaful Coverage",
            "free_phone": "FREE Smartphone"
          },
          {
            "plan_name": "Mukmin88",
            "subtitle": "Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants",
            "price": {
              "amount": 88,
              "currency": "RM",
              "period": "/ mth"
            },
            "data": {
              "total": "300 GB Total Internet",
              "breakdown": {
                "fast_internet": "200 GB Fast Internet",
                "hotspot": "100 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls to all network",
            "takaful_coverage": "RM12,500 Takaful Coverage",
            "free_phone": "FREE Smartphone"
          },
          {
            "plan_name": "Mukmin188",
            "subtitle": "Exclusive postpaid with Takaful protection and FREE 5G Phone for government servants",
            "price": {
              "amount": 188,
              "currency": "RM",
              "period": "/ mth",
              "post_contract": 88,
              "installment": "RM100 x 36 Months"
            },
            "data": {
              "total": "300 GB Total Internet",
              "breakdown": {
                "fast_internet": "200 GB Fast Internet",
                "hotspot": "100 GB Hotspot"
              }
            },
            "calls": "Unlimited Calls to all network",
            "takaful_coverage": "RM12,500 Takaful Coverage",
            "free_phone": "Phone Installment RM100 x 36 Months"
          }
        ]
      
    }
];

export const exampleStoreLocations = [
  {
    name: "redONE Mobile Store Kuala Lumpur 1",
    address: "189 Jalan Kuala Lumpur",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    postcode: "50050",
    phone: "03-3107989",
    email: "store1@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Kuala Lumpur 2",
    address: "9 Jalan Kuala Lumpur",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    postcode: "50050",
    phone: "03-9990220",
    email: "store2@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Sungai Petani 3",
    address: "137 Jalan Sungai Petani",
    city: "Sungai Petani",
    state: "Kedah",
    postcode: "08000",
    phone: "04-8302823",
    email: "store3@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Kuala Lumpur 4",
    address: "74 Jalan Kuala Lumpur",
    city: "Kuala Lumpur",
    state: "WP Kuala Lumpur",
    postcode: "50050",
    phone: "03-5415349",
    email: "store4@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Taiping 5",
    address: "187 Jalan Taiping",
    city: "Taiping",
    state: "Perak",
    postcode: "34000",
    phone: "05-2022670",
    email: "store5@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Tawau 6",
    address: "46 Jalan Tawau",
    city: "Tawau",
    state: "Sabah",
    postcode: "91000",
    phone: "088-2988955",
    email: "store6@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Kuala Terengganu 7",
    address: "2 Jalan Kuala Terengganu",
    city: "Kuala Terengganu",
    state: "Terengganu",
    postcode: "20050",
    phone: "09-2058665",
    email: "store7@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Subang Jaya 8",
    address: "37 Jalan Subang Jaya",
    city: "Subang Jaya",
    state: "Selangor",
    postcode: "47500",
    phone: "03-6588557",
    email: "store8@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Kuching 9",
    address: "47 Jalan Kuching",
    city: "Kuching",
    state: "Sarawak",
    postcode: "93050",
    phone: "082-3564109",
    email: "store9@redone.my",
    hours: "Mon-Sun 10am-10pm"
  },
  {
    name: "redONE Mobile Store Melaka 10",
    address: "110 Jalan Melaka",
    city: "Melaka",
    state: "Melaka",
    postcode: "75000",
    phone: "06-6885970",
    email: "store10@redone.my",
    hours: "Mon-Sun 10am-10pm"
  }
];
