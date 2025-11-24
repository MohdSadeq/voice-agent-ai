export const exampleAccountInfo = {
  accountId: "RT-123456",
  name: "Alex Johnson",
  phone: "0123456789",
  email: "alex.johnson@email.com",
  plan: "Unlimited Plus",
  balanceDue: "RM42.17",
  lastBillDate: "2024-05-15",
  lastPaymentDate: "2024-05-20",
  lastPaymentAmount: "RM42.17",
  status: "Active",
  address: {
    street: "1234 Pine St",
    city: "Seattle",
    state: "WA",
    zip: "98101"
  },
  lastBillDetails: {
    basePlan: "RM30.00",
    internationalCalls: "RM8.00",
    dataOverage: "RM4.00",
    taxesAndFees: "RM0.17",
    notes: "Higher than usual due to international calls and data overage."
  }
};

export const examplePolicyDocs = [
  {
    id: "ID-010",
    name: "Family Plan Policy",
    topic: "family plan options",
    content:
      "The family plan allows up to 5 lines per account. All lines share a single data pool. Each additional line after the first receives a 10% discount. All lines must be on the same account.",
  },
  {
    id: "ID-020",
    name: "Promotions and Discounts Policy",
    topic: "promotions and discounts",
    content:
      "The Summer Unlimited Data Sale provides a 20% discount on the Unlimited Plus plan for the first 6 months for new activations completed by July 31, 2024. The Refer-a-Friend Bonus provides a $50 bill credit to both the referring customer and the new customer after 60 days of active service, for activations by August 31, 2024. A maximum of 5 referral credits may be earned per account. Discounts cannot be combined with other offers.",
  },
  {
    id: "ID-030",
    name: "International Plans Policy",
    topic: "international plans",
    content:
      "International plans are available and include discounted calling, texting, and data usage in over 100 countries.",
  },
  {
    id: "ID-040",
    name: "Handset Offers Policy",
    topic: "new handsets",
    content:
      "Handsets from brands such as iPhone and Google are available. The iPhone 16 is $200 and the Google Pixel 8 is available for $0, both with an additional 18-month commitment. These offers are valid while supplies last and may require eligible plans or trade-ins. For more details, visit one of our stores.",
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
  // Kuala Lumpur
  {
    name: "Redone Kuala Lumpur",
    address: "123 Jalan Bukit Bintang, Level 1, Pavilion Mall",
    zip_code: "55100",
    phone: "(03) 555-1234",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },
  {
    name: "Redone Mid Valley",
    address: "456 Mid Valley Megamall, Ground Floor",
    zip_code: "59200",
    phone: "(03) 555-5678",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },

  // Penang
  {
    name: "Redone Georgetown",
    address: "789 Lebuh Light, Suite 200, Gurney Plaza",
    zip_code: "10200",
    phone: "(04) 555-9101",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },
  {
    name: "Redone Penang Times Square",
    address: "101 Jalan Datuk Keramat, Level 3, Penang Times Square",
    zip_code: "10150",
    phone: "(04) 555-1122",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },

  // Johor Bahru
  {
    name: "Redone Johor Bahru",
    address: "202 Jalan Tebrau, Level 2, KSL City Mall",
    zip_code: "81100",
    phone: "(07) 555-3344",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },
  {
    name: "Redone Aeon Tebrau City",
    address: "303 Jalan Pantai, Aeon Tebrau City, Ground Floor",
    zip_code: "81750",
    phone: "(07) 555-7788",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  },

  // Langkawi
  {
    name: "Redone Langkawi",
    address: "404 Jalan Pantai Cenang, Langkawi Mall",
    zip_code: "07000",
    phone: "(04) 555-2211",
    hours: "Mon-Sat 10am-7pm, Sun 11am-5pm"
  }
];
