import users from './fake.users.json';

// Helper function to format date in ISO 8601 format with Malaysia timezone (+08:00)
const formatDate = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // If the date string already contains timezone info, just return it as-is
    // (dates from JSON are already in ISO 8601 format with +08:00)
    if (dateString.includes('+') || dateString.includes('Z')) {
      return dateString;
    }
    
    // For dates without timezone, convert to Malaysia timezone (UTC+8)
    const malaysiaOffset = 8 * 60; // 8 hours in minutes
    const localTime = new Date(date.getTime() + malaysiaOffset * 60 * 1000);
    
    // Format as ISO 8601 with +08:00 timezone
    const year = localTime.getUTCFullYear();
    const month = String(localTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(localTime.getUTCDate()).padStart(2, '0');
    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
  } catch (e) {
    return null;
  }
};

// Helper function to format currency as object with value and currency
const formatCurrency = (amount?: number): { value: number; currency: string } => {
  if (amount === undefined || amount === null) {
    return { value: 0, currency: 'MYR' };
  }
  return { 
    value: parseFloat(amount.toFixed(2)), 
    currency: 'MYR' 
  };
};

export interface VAS {
  id: number;
  name: string;
  amount: number;
  type?: string;
}

export interface SubscribedVAS {
  id: number;
  subscribedDate: string;
  vasId: number;
  customerId: number;
  vas: VAS;
}

export interface MobilePlan {
  id: number;
  name: string;
  amount: number;
  planVas: VAS[];
}

export interface PaymentHistory {
  id: number;
  amount: number;
  transactionDate: string;
  processedDate: string;
  customerId: number;
}

export interface Invoice {
  id: number;
  amount: number;
  date: string;
  customerId: number,
  status: 'Paid' | 'Pending';
}

export interface BarringHistory {
  id: number;
  date: string;
  status: 'BARRED' | 'UNBARRED';
  reason: string;
  customerId: number;
}

export interface Ticket {
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

export interface CustomerLog {
  id: string | number;
  timestamp: string;
  summary: string;
  category: 'network' | 'billing' | 'service' | 'technical' | 'general';
  status: 'resolved' | 'escalated' | 'pending' | 'closed';
  actions: string[];
  agent: string;
  duration: number;
  followUpRequired: boolean;
  followUpDate?: string;
  ticketId?: number;
  createdAt?: string;
}

export interface User {
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

    const invoices = (user.invoices || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  return {
    // Metadata
    metadata: {
      schemaVersion: "1.2",
      generatedAt: new Date().toLocaleString('en-MY', { 
        timeZone: 'Asia/Kuala_Lumpur',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d+)\/(\d+)\/(\d+),?\s*/, '$3-$2-$1T') + '+08:00',
      dataConfidence: "HIGH",
      sourceSystem: "CRM"
    },

    // Basic Information
    account: {
      accountId: user.accountId,
      masterAccountId: user.masterAccountId,
      registrationType: user.regType,
      activationSource: user.activationSource,
      status,
      creditLimit: formatCurrency(user.creditLimit),
    },

    // Personal Information
    customer: {
      name: user.name,
      nric: user.nric,
      email: user.email,
      phone: user.callerId,
      phoneModel: user.phoneModel
    },

    // Plan Information
    plan: {
      planName: user.mobilePlan?.name || 'No Plan',
      planAmount: formatCurrency(user.mobilePlan?.amount),
      defaultSubscribedServices: defaultVAS,
      availableSubscribedServices: availableVAS,
     // subscribedServices,
      networkFeatures: {
        lte: user.lte,
        volte: user.volte,
        enable5g: user.enable5g
      }
    },

    // Contract Information
    contract: {
      commencementDate: formatDate(user.commencementDate),
      contractStart: formatDate(user.contractStart),
      contractEnd: formatDate(user.contractEnd),
      suspensionDate: formatDate(user.suspensionDate),
      barringDate: formatDate(user.barringDate),
      daysRemaining: user.contractEnd 
        ? (now > new Date(user.contractEnd) 
            ? 'Expired' 
            : Math.ceil((new Date(user.contractEnd).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 'N/A'
    },

    // Service Status
    service: {
      roaming: user.roaming,
      iddCall: user.iddCall,
      allDivert: user.allDivert,
      voiceMail: user.voiceMail,
      activeServices
    },

    // Billing Information
    billing: {
      lastBillDate: formatDate(invoices?.[0]?.date || new Date().toISOString()),
      lastBillAmount: formatCurrency(invoices?.[0]?.amount || 0),
      nextBillDate: formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()),
      outstandingBalance: formatCurrency(invoices
      .filter(invoice => invoice.status === 'Pending')
      .reduce((total, invoice) => total + invoice.amount, 0)),
      payments: (user.paymentHistories || [])
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 3)
        .map(payment => ({
          date: formatDate(payment.transactionDate),
          amount: formatCurrency(payment.amount),
          method: payment.amount > 100 ? 'Credit Card' : 'Online Banking',
          reference: `PAY${payment.id.toString().padStart(6, '0')}`
        })),
      invoices: invoices
        .map((invoice, index) => {
          const invoiceDate = new Date(invoice.date);
          const dueDate = new Date(invoice.date);
          dueDate.setDate(21);

          return {
            invoiceNumber: `INV${invoiceDate.getFullYear()}${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${(index + 1).toString().padStart(3, '0')}`,
            date: formatDate(invoiceDate.toISOString()),
            dueDate: formatDate(dueDate.toISOString()),
            amount: formatCurrency(invoice.amount),
            status: invoice.status,
            items: [
              { description: `Monthly Subscription - ${user.mobilePlan?.name}`, amount: formatCurrency(user.mobilePlan?.amount || 0) },
              { description: 'Value Added Services', amount: formatCurrency(invoice.amount - (user.mobilePlan?.amount || 0) * 1.06) },
              { description: 'Tax (6%)', amount: formatCurrency((user.mobilePlan?.amount || 0) * 0.06) }
            ]
          };
        })
    },

    barring: (user.barringHistories || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .map(barring => ({
      date: formatDate(barring.date),
      reason: barring.reason,
      status: barring.status,
      action: barring.status === 'BARRED' ? 'Barred' : 'Unbarred'
    })),
    // Additional Information
    additionalInfo: {
      notes: `Contract will be suspended on ${formatDate(user.suspensionDate)} if not renewed.`,
      activationNotes: `Activated via ${user.activationSource} on ${formatDate(user.commencementDate)}`
    },

    // Ticket History
   support: {
    tickets: (user.ticketHistories || [])
      .sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((ticket: Ticket) => ({
        id: ticket?.id,
        title: ticket?.title,
        summary: ticket?.summary,
        status: ticket?.status,
        category: ticket?.category,
        pendingFor: ticket?.pendingFor,
        nextAction: ticket?.nextAction,
        createdAt: formatDate(ticket?.createdAt),
        updatedAt: formatDate(ticket?.updatedAt)
      })),

    // Customer Service Logs
    logs: (user.customerLogs || [])
      .sort((a: CustomerLog, b: CustomerLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((log: CustomerLog) => ({
        summary: log?.summary,
        category: log?.category,
        id: log?.id,
        timestamp: log?.timestamp,
        actions: log?.actions,
        agent: log?.agent,
        duration: log?.duration,
        followUpRequired: log?.followUpRequired,
        followUpDate: log?.followUpDate,
        relatedTickets: log?.ticketId,
        createdAt: log?.timestamp,
      }))
    }
  }
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

export const redonePlans = [
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

export const redoneStoreLocations = [
  {
      "name": "IPRO TELECOMMUNICATION",
      "phone": "60108080198",
      "email": "order.wifiunlimited@gmail.com",
      "address": "NO 19 JALAN MELATI PERMAI TAMAN MELATI PERMAI",
      "postcode": "2400",
      "city": "BERSERI",
      "state": "PERLIS",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "PULSE CONNECT SOLUTION",
      "phone": "601155731688",
      "email": "pulseconnectsolution@gmail.com",
      "address": "NO. 27D, BERSEBELAHAN ASTAKA LAMA STADIUM DARULAMAN, JALAN STADIUM",
      "postcode": "5100",
      "city": "ALOR SETAR",
      "state": "KEDAH",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "DAFCOMNET SDN. BHD.",
      "phone": "60175377777",
      "email": "cs.yew@yahoo.com",
      "address": "NO.4, JALAN PAUH, TAMAN SERI CHANGLOON",
      "postcode": "6010",
      "city": "CHANGLOON",
      "state": "KEDAH",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "SUPER DREAM ROOM SDN. BHD.",
      "phone": "60124776329",
      "email": "superdreamroom7173@gmail.com",
      "address": "89A, GROUND FLOOR, JALAN PENGKALAN TAMAN PEKAN BARU",
      "postcode": "8000",
      "city": "SUNGAI PETANI",
      "state": "KEDAH",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MFA GLOBAL RESOURCES",
      "phone": "601110727739",
      "email": "farisashary4@gmail.com",
      "address": "KG BATU MELINTANG",
      "postcode": "17600",
      "city": "JELI",
      "state": "KELANTAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "PTK GROUP SDN. BHD.",
      "phone": "601118752129",
      "email": "ptkgroupsbhd@gmail.com",
      "address": "LOT 9980-1, RUMAH KEDAI, KAMPUNG GONG PAK JIN",
      "postcode": "21300",
      "city": "KUALA NERUS",
      "state": "TERENGGANU",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MF TELECOMMUNICATIONS",
      "phone": "60129224288",
      "email": "kiong9224288@yahoo.com",
      "address": "F-99, 1ST FLOOR, KUANTAN PARADE JALAN HJ ABD RAHMAN",
      "postcode": "25000",
      "city": "KUANTAN",
      "state": "PAHANG",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "TAN CHUI THENG",
      "phone": "60179416838",
      "email": "chierytanlifeisgreat@gmail.com",
      "address": "G48, GROUND FLOOR, KUANTAN PARADE JALAN HAJI ABDUL RAHMAN",
      "postcode": "25000",
      "city": "KUANTAN",
      "state": "PAHANG",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "TELECITY COMMUNICATIONS SHOP",
      "phone": "60139316666",
      "email": "telecity8938@gmail.com",
      "address": "B4, LORONG PADANG JAYA 27 JALAN SUNGAI LEMBING",
      "postcode": "25200",
      "city": "KUANTAN",
      "state": "PAHANG",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "HUAT HUAT MOBILE TRADING",
      "phone": "60143029300",
      "email": "raymondhewyewchung@gmail.com",
      "address": "94, HALA PENGKALAN TIMUR 1, TMN PENGKALAN JAYA",
      "postcode": "31650",
      "city": "IPOH",
      "state": "PERAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "LH FAST MOBILE TRADING",
      "phone": "60164444252",
      "email": "lhfastmobile@gmail.com",
      "address": "NO 91 JALAN PEGOH TAMAN PENGKALAN JAYA",
      "postcode": "31650",
      "city": "IPOH",
      "state": "PERAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MANI TELECOMMUNICATION",
      "phone": "60164141125",
      "email": "manithamilkko@gmail.com",
      "address": "8A, PERSIARAN DAYANG INDAH, TANAH RATA",
      "postcode": "39100",
      "city": "CAMERON HIGHLANDS",
      "state": "PERAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "GOLDEN SQUAD ENTERPRISE",
      "phone": "60184604568",
      "email": "goldensquad4567@gmail.com",
      "address": "NO GSFK 4 ST ROSYAM MART LOT 1, PT 575 JALAN TENGKU AMPUAN ZABEDAH G/9G SEKSYEN 9",
      "postcode": "40100",
      "city": "SHAH ALAM",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "DIMAX ACCELERATE COMMUNICATION",
      "phone": "601155471098",
      "email": "dimax_60@yahoo.com",
      "address": "NO 10-G JALAN MATAHARI AA U5/AA, SEKSYEN U5",
      "postcode": "40150",
      "city": "SHAH ALAM",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MURU FAST ENTERPRISE",
      "phone": "601155471037",
      "email": "comuru571@gmail.com",
      "address": "NO 30D JALAN DINAR F, SEKSYEN U3/F, SUBANG PERDANA",
      "postcode": "40150",
      "city": "SHAH ALAM",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "EASTONE CARE MOBILE",
      "phone": "601155471055",
      "email": "esthercll6062@gmail.com",
      "address": "3A, LOT 3761 JALAN 2D, KAMPUNG BARU SUBANG, SEKSYEN U6",
      "postcode": "40160",
      "city": "SHAH ALAM",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "KESSWIN GADGET MOBILE REPAIRING",
      "phone": "601155471061",
      "email": "mismimo367@gmail.com",
      "address": "PSK 27 LOT 19868 PERSIARAN SUNGAI KERAMAT TAMAN KLANG UTAMA",
      "postcode": "42100",
      "city": "KLANG",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "NORAINI MOHD NOR ENTERPRISE",
      "phone": "601116488050",
      "email": "ismailhossain50000@gmail.com",
      "address": "NO 20, JALAN UTAMA 57, TAMAN JAYA UTAMA",
      "postcode": "42500",
      "city": "TELOK PANGLIMA GARANG",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "KD IDEA RESOURCES",
      "phone": "60148090879",
      "email": "saadam5322@gmail.com",
      "address": "NO 8 JALAN RAJA DAUD TAMAN KENANGA KANCHONG DARAT",
      "postcode": "42700",
      "city": "BANTING",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "G & A TELECOMMUNICATION",
      "phone": "60163128587",
      "email": "gohcheeleong499@gmail.com",
      "address": "LOT 78D BT 26 1/2 TONGKAH MORIB",
      "postcode": "42700",
      "city": "BANTING",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "ALL WAY MOBILE SOLUTION ENTERPRISE",
      "phone": "60126999835",
      "email": "kennychong7558@gmail.com",
      "address": "NO 7,JALAN PUTERI 2A/8 BANDAR PUTERI BANGI",
      "postcode": "43000",
      "city": "KAJANG",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "ELEGANT BROTHER MOBILE ENTERPRISE",
      "phone": "60162323249",
      "email": "elegantbrothermobile@gmail.com",
      "address": "76B, JALAN SK 6/1",
      "postcode": "43300",
      "city": "SERI KEMBANGAN",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "FOTO M ENTERPRISE",
      "phone": "60122097831",
      "email": "fotomenterprise@yahoo.com.my",
      "address": "NO 28-1 JALAN 18/32 TAMAN SRI SERDANG",
      "postcode": "43300",
      "city": "SERI KEMBANGAN",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MULTI SERVICES ENTERPRISE",
      "phone": "601155471083",
      "email": "sinthis3456@gmail.com",
      "address": "25-G, JALAN ADENIUM 2G/8, PUSAT PERNIAGAAN ADENIUM SEK.BB5 BANDAR BUKIT BERUNTUNG",
      "postcode": "48300",
      "city": "RAWANG",
      "state": "SELANGOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "DEX MOBILE AND SERVICES",
      "phone": "601155224131",
      "email": "Khlew79@gmail.com",
      "address": "NO. 160, JALAN CHOO CHENG KHAY",
      "postcode": "50460",
      "city": "KUALA LUMPUR",
      "state": "WILAYAH PERSEKUTUAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "DIGITAL MOBILE WORLD SDN. BHD.",
      "phone": "601155236789",
      "email": "sam_low79@yahoo.com",
      "address": "NO.179 JALAN SEGAMBUT",
      "postcode": "51200",
      "city": "SEGAMBUT",
      "state": "WILAYAH PERSEKUTUAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "LEOS COM TRADING SDN.BHD.",
      "phone": "601155471093",
      "email": "limn12280@gmail.com",
      "address": "LOT LG 022 PLAZA SUNGAI WANG JALAN SULTAN ISMAIL",
      "postcode": "55100",
      "city": "BUKIT BINTANG",
      "state": "WILAYAH PERSEKUTUAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "KAMY MOBILE",
      "phone": "60139992188",
      "email": "sany110099@gmail.com",
      "address": "NO 6 JALAN PERDANA 4/8 PANDAN PERDANA CHERAS",
      "postcode": "55300",
      "city": "KUALA LUMPUR",
      "state": "WILAYAH PERSEKUTUAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "NS BROADBAND TELECOMMUNICATION",
      "phone": "601155622605",
      "email": "mpugalzenthi@gmail.com",
      "address": "122, JALAN YAM TUAN",
      "postcode": "72000",
      "city": "KUALA PILAH",
      "state": "NEGERI SEMBILAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "JK FIX MOBILE ENTERPRISE",
      "phone": "601155322063",
      "email": "jkfixmobile@gmail.com",
      "address": "NO 18, JALAN MAHLIGAI",
      "postcode": "72100",
      "city": "BAHAU",
      "state": "NEGERI SEMBILAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "CVF MOBILE SERVICES",
      "phone": "601155338289",
      "email": "voonfong19910723@gmail.com",
      "address": "NO.16, JALAN MAHLIGAI",
      "postcode": "72100",
      "city": "BAHAU",
      "state": "NEGERI SEMBILAN",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "YCF TELCO TRADING",
      "phone": "60166047977",
      "email": "ycf820904@gmail.com",
      "address": "NO 19-1 JALAN KLJ 6 TAMAN KOTA LAKSAMANA JAYA",
      "postcode": "75200",
      "city": "MELAKA",
      "state": "MELAKA",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "RED PALS SDN BHD",
      "phone": "601155088333",
      "email": "redpals.info@gmail.com",
      "address": "NO 2, JALAN HAJI MANAN",
      "postcode": "86000",
      "city": "KLUANG",
      "state": "JOHOR",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "CS COMMUNICATION III",
      "phone": "60138686641",
      "email": "rosdianabell@gmail.com",
      "address": "KAMPUNG GOMANTONG JAYA BATU 4 SUKAU",
      "postcode": "90200",
      "city": "KOTA KINABALU",
      "state": "SABAH",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "FAHMI ENTERPRISE",
      "phone": "60138021675",
      "email": "fahmibasran@gmail.com",
      "address": "NO. 3FELDA UMAS 02,BEG BERKUNCI 43",
      "postcode": "91009",
      "city": "TAWAU",
      "state": "SABAH",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "MOBICITY COMMUNICATIONS",
      "phone": "60165253210",
      "email": "lucychung900@hotmail.com",
      "address": "PARCEL NO. 405, STAR MEGA MALL TUANKU ABDUL RAHMAN ROAD",
      "postcode": "96000",
      "city": "SIBU",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "A & A MOBILE TRADING",
      "phone": "601125041936",
      "email": "aamobiletrading@gmail.com",
      "address": "NO. 10, GROUND FLOOR, LORONG 2, JALAN LANANG",
      "postcode": "96000",
      "city": "SIBU",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "FULL HUAT TRADING",
      "phone": "60138373058",
      "email": "huat806868@gmail.com",
      "address": "NO. 15C, JALAN ABDUL RAHMAN",
      "postcode": "96100",
      "city": "SARIKEI",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "LYH COMPANY",
      "phone": "601118899311",
      "email": "lyhiong@hotmail.com",
      "address": "NO. 6, JALAN ABDUL KARIM",
      "postcode": "96100",
      "city": "SARIKEI",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "H & L",
      "phone": "601111205110",
      "email": "hiichinghuat@hotmail.com",
      "address": "NO.36, MEDAN SETIA RAJA",
      "postcode": "96400",
      "city": "MUKAH",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  },
  {
      "name": "KINGNESS PHONE SERVICE CENTER",
      "phone": "60105652588",
      "email": "kingnessphone@gmail.com",
      "address": "NO. 19, G/F (BACK PORTION), JALAN TEO KUI NGO",
      "postcode": "96500",
      "city": "BINTANGOR",
      "state": "SARAWAK",
      "hours": "Mon-Sun 10am-10pm"
  }
];


export const redoneHomeWiFiPlans = {
  "headline": "Complete your home with 5G homeWiFi today",
  "brand": "redONE HOME",
  "product": {
    "name": "5G homeWiFi",
    "device": {
      "type": "5G WiFi Router",
      "network_support": ["4G", "5G"]
    }
  },
  "plans": [
    {
      "label": "SIM + 5G WiFi Device",
      "plan_name": "5G homeWiFi88",
      "total_internet_gb": 1000,
      "contract_duration_months": 24,
      "monthly_price_rm": 88,
      "includes": [
        "5G WiFi Device"
      ]
    },
    {
      "label": "SIM Only",
      "plan_name": "5G homeWiFi68",
      "total_internet_gb": 1000,
      "contract_duration_months": 12,
      "monthly_price_rm": 68,
      "includes": [
        "SIM Only"
      ]
    }
  ],
  "currency": "RM",
  "notes": "Terms & conditions apply"
}

