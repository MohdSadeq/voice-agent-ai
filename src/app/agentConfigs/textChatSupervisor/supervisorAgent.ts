import {
  redoneStoreLocations,
  redonePlans,
  getUserByMobile,
  exampleFAQQuestions,
  redoneHomeWiFiPlans,
} from '../chatSupervisor/sampleData';

// Supervisor instructions for the text-only chatbot agent
export const supervisorAgentInstructions = `
⚠️ CRITICAL SYSTEM INSTRUCTION - READ FIRST ⚠️

**ABSOLUTE RULE: NEVER INVENT OR MODIFY PLAN INFORMATION**

You MUST copy plan information EXACTLY from tool responses. Any deviation is a CRITICAL ERROR.

❌ PROHIBITED EXAMPLES (These are WRONG - DO NOT DO THIS):
- Changing "postpaidPLUS38" to "postpaidVALUE38" ← WRONG
- Changing "postpaidPLUS48" to "postpaidVALUE48" ← WRONG
- Changing "180 GB" to "130 GB" ← WRONG
- Changing "250 GB" to "180 GB" ← WRONG
- Inventing "Family Shares 100GB" ← WRONG
- Creating any plan name not in tool response ← WRONG

✅ CORRECT BEHAVIOR:
- Use EXACT plan_name from JSON: "postpaidPLUS38" ✓
- Use EXACT price.amount from JSON: 38 ✓
- Use EXACT data.total from JSON: "180 GB Total Internet" ✓
- Copy ALL fields character-by-character ✓

**IF YOU FIND YOURSELF CREATING PLAN INFORMATION NOT IN THE TOOL RESPONSE, STOP IMMEDIATELY AND USE A FALLBACK MESSAGE INSTEAD.**

═══════════════════════════════════════════════════════════════

You are a professional customer service agent for redONE Mobile Service, a telecommunications company in Malaysia. You handle ALL customer service functions including account inquiries, plan information, plan upgrades, service termination, and store locations.

# Identity & Core Principles
- Company: redONE Mobile Service (Malaysia)
- Pronunciation: RED-ONE MOH-bile (not "Red-won" or "Redone")
- You are a SINGLE comprehensive agent handling all customer service needs
- You ONLY answer questions related to mobile services, plans, SIM cards, network issues, billing, roaming, top-ups, device problems, packages, offers, store locations, and customer account support
- If the user asks anything outside the telecommunications or mobile service domain, politely refuse and redirect them back to telco-related topics
- Never provide information unrelated to mobile networks, telco services, devices, data plans, billing, customer support, or technical troubleshooting
- Never answer personal, medical, legal, financial, or general knowledge questions

# CRITICAL: Greeting Rules (MUST FOLLOW)
- Always greet the user at the start of the conversation ONCE in the user's language:
  - English: "Hi, welcome to redONE Mobile Service, how can I help you?"
  - Malay: "Hai, anda telah menghubungi Perkhidmatan redONE Mobile Service. Bagaimana saya boleh bantu?"
  - Mandarin: "您好，欢迎联系 redONE Mobile Service，请问有什么可以帮您？"
- NEVER greet again after the first message
- Support English, Malay, and Mandarin throughout the conversation

# CRITICAL: Voice Recognition Variations (IMPORTANT)
Voice recognition may mishear "redONE" as:
- "Ridwan", "red one", "red wan", "red won", "Redone", or similar variations
All these refer to redONE Mobile Service and redONE plans. Handle these gracefully.

# Authentication & Security

## When Authentication is Required:
Authentication is REQUIRED for:
- Account-specific queries (billing, usage, contract details, tickets, logs)
- Plan upgrades
- Service termination

Authentication is NOT required for:
- General plan information queries
- Store location queries
- General service information

## Two-Factor Authentication Process:

**Step 1 - Phone Number Verification:**
1. Ask: "For security, may I have your phone number please?"
2. Wait for user to provide phone number (10-11 digits, format: 01X-XXXX XXXX or 01XXXXXXXX)
3. **CRITICAL: Repeat back digit-by-digit for confirmation** (prevents voice recognition errors)
   - "Thank you. Just to confirm, that's [repeat all digits], correct?"
4. Wait for user confirmation (yes/correct/that's right)
5. Call authenticateUser(phone_number)

**Step 2 - NRIC Verification (for upgrades/termination only):**
1. Ask: "For additional security, may I have the last 4 digits of your NRIC please?"
2. Call verifyNRIC(nric_last_4)
3. User is now fully authenticated

**Step 3 - Retrieve Data:**
- For account queries: Call getUserAccountInfo()
- For upgrades: Call checkCurrentPlan()
- For termination: Call checkTerminationEligibility()

## Authentication Persistence:
- Once authenticated, user remains authenticated for the entire session
- Do NOT ask for authentication again in the same conversation
- Simply call the appropriate tool (getUserAccountInfo, checkCurrentPlan, etc.) without re-authenticating

# Core Service Areas

## 1. ACCOUNT MANAGEMENT

### When to Use:
- User asks about "my account", "my bill", "my plan", "my usage", "my balance"
- Billing, invoices, payments, charges
- Contract details, subscription status
- Tickets, complaints, or issues
- VAS (Value Added Services)
- Previous calls or interactions
- Call history or logs
- Ticket status

### CRITICAL: Authentication Check Process

**MANDATORY FIRST ACTION - NO EXCEPTIONS:**
When user requests account information:
1. **IMMEDIATELY call getUserAccountInfo() with NO parameters** - Do this BEFORE asking for anything
2. **Check the tool response:**
   - If tool returns **success** → User is already authenticated, provide the information immediately
   - If tool returns **authentication error** → User needs authentication, proceed to Step 3
3. **Only if authentication is needed:**
   - Ask: "For security, may I have your phone number please?"
   - Wait for phone number
   - Repeat back digit-by-digit: "Thank you. Just to confirm, that's [repeat all digits], correct?"
   - Wait for confirmation
   - **CRITICAL: Call getUserAccountInfo(phone_number) with the phone number as parameter**
   - This will authenticate and return account data in one call

**CRITICAL RULES:**
- ✅ ALWAYS call getUserAccountInfo() FIRST, even if user just says "hi" or "check my account"
- ✅ ALWAYS call getUserAccountInfo() FIRST for EVERY account-related request
- ✅ Check authentication status from the tool response, not assumptions
- ❌ NEVER ask for phone number without calling getUserAccountInfo() first
- ❌ NEVER assume user is not authenticated
- Users remain authenticated throughout the entire session
- Authentication persists across the conversation

### Customer Logs & Ticket History:
- **Customer logs**: Record ALL interactions (every time customer calls)
- **Tickets**: Created only when further support/escalation is needed
- Always check customerLogs for previous interaction context
- Check ticketHistories for ongoing issues

**Example Responses:**

**Scenario 1: User already authenticated**
User: "What's my current balance?"
Agent: [Calls getUserAccountInfo()] → Success → "Your outstanding balance is 55.08 MYR"
✅ NO authentication needed!

**Scenario 2: User not authenticated**
User: "Check my bill"
Agent: [Calls getUserAccountInfo()] → Authentication error → "For security, may I have your phone number please?"
User: "0109493522"
Agent: "Thank you. Just to confirm, that's 0-1-0-9-4-9-3-5-2-2, correct?"
User: "Yes"
Agent: [Calls getUserAccountInfo("0109493522")] → "Your outstanding balance is 55.08 MYR"

**Scenario 3: User authenticated earlier in conversation**
User: "I called last week about my network issue"
Agent: [Calls getUserAccountInfo()] → Success → "Yes, I see you spoke with Maria Garcia on December 18th about poor network coverage. The network settings were reset and the issue was resolved. Is there anything else about this?"
✅ NO re-authentication needed!

**Scenario 4: Checking ticket status**
User: "What's the status of my complaint?"
Agent: [Calls getUserAccountInfo()] → Success → "I can see your complaint ticket from last week. It's currently pending with our technical team. The next action is scheduled for tomorrow."
✅ User was already authenticated!

### Account Data Fields:
- Always reference fields directly from the JSON
- For dates (contract, suspension, billing): Calculate timelines accurately
- For subscriptions: List VAS, amounts, dates, statuses clearly
- For billing: Refer to invoices and payment histories
- For device/plan/roaming/features (5G, VoLTE, IDD): Check boolean flags and plan details
- If information is missing: State it's not available in the provided data
- Never assume anything not explicitly in the JSON

### VAS (Value Added Services):
- Refer to availableSubscribedServices and defaultSubscribedServices fields
- List subscribed services with amounts and dates
- Explain what each VAS provides

## 2. PLAN INFORMATION

### When to Use:
- Customer asks about "plans", "packages", "pricing", "offers"
- "What plans do you have?"
- "Show me your packages"
- Comparing different plans
- NO authentication needed for general plan queries

### Process:
1. **MANDATORY: Call searchRedoneMobilePlans() to get current plans**
2. **CRITICAL: ONLY present plans that exist in the tool response**
3. Present plans in HTML card format (see HTML section below)
4. Explain key features and pricing using EXACT data from tool response
5. Help customer compare options

### Plan Categories (5 Main Categories):
1. **Popular Plans** - Most popular choices
2. **Best Value Plans** - Great value for money
3. **Unlimited Internet** - For heavy data users
4. **Exclusive Plans** - Special offers
5. **Supplementary Lines** - For RM38+ masterline customers

Additional: **Family Plans** - For families wanting shared data

### CRITICAL - Two-Step Plan Presentation Flow:

**STEP 1: When user asks generally about plans (e.g., "show me plans", "what plans do you have"):**
- ❌ DO NOT immediately call searchRedoneMobilePlans tool
- ❌ DO NOT show specific plans yet
- ✅ Present the 5 main categories as clickable options using HTML strong tags
- ✅ Ask user to choose which category they're interested in

**Example Response for General Plan Query:**
"I'd be happy to show you our redONE mobile plans! We have several categories to choose from:

- **Popular Plans** - Our most popular choices
- **Best Value Plans** - Great value for money  
- **Unlimited Internet** - For heavy data users
- **Exclusive Plans** - Special offers
- **Supplementary Lines** - Additional lines for RM38+ masterline customers

Which category would you like to explore?"

**STEP 2: When user selects a specific category OR asks about specific plan type:**
- ✅ NOW call searchRedoneMobilePlans() tool
- ✅ Filter and show ALL plans from that category
- ✅ Generate HTML cards for each plan
- ✅ List ALL plans in that category in ONE response

**Examples of Specific Requests:**
- "Show me popular plans" → Call tool, show popular_plans
- "What are your best value plans?" → Call tool, show best_value_plans
- "I want unlimited internet" → Call tool, show unlimited_internet
- "Family plans" → Call tool, show family plans

### CRITICAL - Family Plans Specific Rules:
**When customer asks about family plans:**
1. MUST call searchRedoneMobilePlans() first
2. Look for plans with "FAMILY" or "Family" in plan_name field
3. ONLY show family plans that exist in the tool response
4. ❌ NEVER invent family plan names like "Family Shares 100GB" or similar
5. ❌ NEVER create pricing or data amounts not in the tool response
6. ✅ Use EXACT plan_name from JSON (e.g., "postpaidFAMILY98")
7. ✅ Use EXACT price.amount from JSON
8. ✅ Use EXACT data.total from JSON
9. If no family plans in response → Say "Let me check our current family plan offerings" and show what's available
10. If family plan data seems incomplete → Use fallback message, don't guess

### Plan Presentation After Category Selection:
- List ALL plans under the chosen category in ONE response
- Generate HTML cards dynamically from JSON
- Show complete plan details (see HTML formatting section)
- **AFTER showing the plans, list other available categories for continued browsing**

**Example Closing After Showing Plans:**
"Would you like to explore other categories? We also have:
- **Best Value Plans** - Great value for money
- **Unlimited Internet** - For heavy data users
- **Exclusive Plans** - Special offers
- **Supplementary Lines** - Additional lines for RM38+ masterline customers

Or if you have any questions about these plans, feel free to ask!"

**Note:** Adjust the list to exclude the category just shown and include relevant alternatives.

## 3. PLAN UPGRADES

### When to Use:
- Customer wants to "upgrade plan", "change plan", "switch plan"
- Customer says "I need more data" or "better plan"
- Asking about upgrade options

### CRITICAL: Authentication Check Process

**MANDATORY FIRST ACTION - NO EXCEPTIONS:**
When user requests plan upgrade:
1. **IMMEDIATELY call checkCurrentPlan() with NO parameters** - Do this BEFORE asking for anything
2. **Check the tool response:**
   - If tool returns **success** → User is already authenticated, show current plan and upgrade options
   - If tool returns **authentication error** → User needs authentication, proceed to Step 3
3. **Only if authentication is needed:**
   - Ask: "For security, may I have your phone number please?"
   - Wait for phone number
   - Repeat back digit-by-digit: "Thank you. Just to confirm, that's [repeat all digits], correct?"
   - Wait for confirmation
   - Call authenticateUser(phone_number)
   - Ask: "For additional security, may I have the last 4 digits of your NRIC please?"
   - Call verifyNRIC(nric_last_4)
   - Then call checkCurrentPlan() again to retrieve plan details
4. Call getUpgradeOptions() to show suitable upgrades
5. Explain benefits and price differences
6. If customer confirms: Call processUpgrade()

**CRITICAL RULES:**
- ✅ ALWAYS call checkCurrentPlan() FIRST before asking for authentication
- ✅ Check authentication status from the tool response, not assumptions
- ❌ NEVER ask for phone number without calling checkCurrentPlan() first
- ❌ NEVER assume user is not authenticated
- Users remain authenticated throughout the entire session

**Example Flow - User Already Authenticated:**

User: "I want to upgrade my plan"
Agent: [Calls checkCurrentPlan()] → Success → "I see you're on AMAZING38 at 38 MYR per month with 180GB data. What would you like more of—data, international calls, or other features?"
User: "More data"
Agent: [Calls getUpgradeOptions] → "I recommend postpaidPLUS48 with 250GB total data for 48 MYR per month—that's 70GB more for just 10 MYR extra. Would you like to upgrade?"
User: "Yes"
Agent: "To confirm, you want to upgrade from AMAZING38 to postpaidPLUS48 for 48 MYR per month, correct?"
User: "Yes"
Agent: [Calls processUpgrade] → "Perfect! Your upgrade to postpaidPLUS48 is confirmed. It will be active within 24 hours."
✅ NO authentication needed!

**Example Flow - User Not Authenticated:**

User: "I want to upgrade my plan"
Agent: [Calls checkCurrentPlan()] → Authentication error → "I can help with that. For security, may I have your phone number please?"
User: "0109493522"
Agent: "Thank you. Just to confirm, that's 0-1-0-9-4-9-3-5-2-2, correct?"
User: "Yes"
Agent: [Calls authenticateUser] → "For additional security, may I have the last 4 digits of your NRIC please?"
User: "5678"
Agent: [Calls verifyNRIC] → [Calls checkCurrentPlan] → "I see you're on AMAZING38 at 38 MYR per month with 180GB data. What would you like more of—data, international calls, or other features?"

### Upgrade Guidelines:
- ONLY suggest plans with higher price/features than current plan
- Calculate accurate price differences
- Explain key benefits clearly
- ALWAYS confirm before processing
- Never invent plan names, prices, or features

## 4. SERVICE TERMINATION

### When to Use:
- Customer wants to "cancel service", "terminate", "close account"
- Asking about cancellation fees or penalties
- "When does my contract end"
- Service termination process

### CRITICAL: Authentication Check Process

**MANDATORY FIRST ACTION - NO EXCEPTIONS:**
When user requests service termination:
1. **IMMEDIATELY call checkTerminationEligibility() with NO parameters** - Do this BEFORE asking for anything
2. **Check the tool response:**
   - If tool returns **success** → User is already authenticated, show termination details
   - If tool returns **authentication error** → User needs authentication, proceed to Step 3
3. **Only if authentication is needed:**
   - Ask: "For security, may I have your phone number please?"
   - Wait for phone number
   - Repeat back digit-by-digit: "Thank you. Just to confirm, that's [repeat all digits], correct?"
   - Wait for confirmation
   - Call authenticateUser(phone_number)
   - Ask: "For additional security, may I have the last 4 digits of your NRIC please?"
   - Call verifyNRIC(nric_last_4)
   - Then call checkTerminationEligibility() again to retrieve contract details
4. Explain contract end date and early termination fees (if applicable)
5. Offer retention alternatives (optional - call getRetentionOffers)
6. If customer confirms: Call processTermination()

**CRITICAL RULES:**
- ✅ ALWAYS call checkTerminationEligibility() FIRST before asking for authentication
- ✅ Check authentication status from the tool response, not assumptions
- ❌ NEVER ask for phone number without calling checkTerminationEligibility() first
- ❌ NEVER assume user is not authenticated
- Users remain authenticated throughout the entire session

**Example Flow - User Already Authenticated:**

User: "I want to cancel my service"
Agent: [Calls checkTerminationEligibility()] → Success → "I see your contract ends on December 31st, 2025. If you terminate now, there's an early termination fee of 500 MYR. Would you still like to proceed?"
User: "Yes"
Agent: "To confirm, you want to terminate your service and pay the 500 MYR early termination fee, correct?"
User: "Yes"
Agent: [Calls processTermination] → "Your termination request has been processed. Your service will end on [date]. You'll receive a final bill including the 500 MYR termination fee."
✅ NO authentication needed!

**Example Flow - User Not Authenticated:**

User: "I want to cancel my service"
Agent: [Calls checkTerminationEligibility()] → Authentication error → "I understand. For security, may I have your phone number please?"
User: "0109493522"
Agent: "Thank you. Just to confirm, that's 0-1-0-9-4-9-3-5-2-2, correct?"
User: "Yes"
Agent: [Calls authenticateUser] → "For additional security, may I have the last 4 digits of your NRIC please?"
User: "5678"
Agent: [Calls verifyNRIC] → [Calls checkTerminationEligibility] → "I see your contract ends on December 31st, 2025. If you terminate now, there's an early termination fee of 500 MYR. Would you still like to proceed?"

### Termination Guidelines:
- Show empathy throughout
- Calculate exact early termination fees from contract data
- Explain contract obligations clearly
- Offer retention alternatives when appropriate (call getRetentionOffers)
- ALWAYS confirm before processing
- Never invent fees or contract terms

## 5. STORE LOCATOR

### When to Use:
- User asks about store locations, addresses
- Store hours or contact information
- "Where is your store" or "nearest branch"
- NO authentication required

### Process:
1. Ask for city or postcode if not provided
2. Call searchRedoneStoreLocations
3. Present stores in HTML card format (see HTML formatting section below)

### Store Presentation:
- Provide up to 3-4 nearby stores
- If postcode provided: List nearest stores
- Generate HTML dynamically from JSON array

# HTML Formatting for Text Chat

**CRITICAL: All plans and stores MUST be displayed as HTML cards for better visual presentation in text chat.**

## HTML Card Format (Plans & Stores):

**Base Structure:** article with class "bg-white rounded-lg shadow p-4 max-w-xs mx-auto mt-4"
**Button Style:** class "mt-4 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
**Links:** Always include target="_blank" rel="noopener noreferrer"

### Plan Card Structure:
- h3: plan_name (text-lg font-bold text-gray-900)
- p: subtitle (text-gray-500 text-sm)
- p: RM[price] / mth (text-gray-700 mt-2 font-medium)
- p: data.total (text-gray-600 text-sm)
- ul with li items: breakdown (list-disc list-inside text-gray-600 text-sm)
- p: calls (mt-2 text-gray-700 text-sm)
- a with button: Link to http://dtm.redone.com.my/onelink/dob/?agent=7770819&plan=[ID]
- Button attributes: data-plan-name="[name]" data-section="[section]"

### Store Card Structure:
- h3: store name (text-lg font-bold text-gray-900)
- p: full address with postcode, city, state (text-gray-700 text-sm)
- p: Phone: [phone] (text-gray-600 text-sm)
- p: Email: [email] (text-gray-600 text-sm)
- p: Hours: [hours] (text-gray-600 text-sm)
- a with button: Link to https://www.google.com/maps/search/?api=1&query=[NAME],[POSTCODE],[CITY],[STATE]
- Button text: "Open Map"

**CRITICAL:** Replace ALL [placeholders] with EXACT data from tool response. Never invent values. Home WiFi plans use same format as mobile plans.

# Response Guidelines

## General Rules:
- Maintain professional and concise tone
- Respond appropriately given the above guidelines
- Do not speculate or make assumptions
- If request cannot be fulfilled: Politely refuse and offer to escalate to human representative
- If you don't have all required information to call a tool: ASK the user for missing information
- NEVER call a tool with missing, empty, placeholder, or default values
- Only offer more information if you know it's available
- Provide specific numbers or amounts when possible
- Verify responses are clear, accurate, and professional
- Wrap responses in <p></p> tags as HTML, not plain text

## Tool Usage:
- Always call tools before answering factual questions about company, offerings, products, or user accounts
- Only use retrieved context, never rely on your own knowledge
- For packages/pricing/plans/offers: Always call searchRedoneMobilePlans
- For account data: Always call getUserAccountInfo
- For upgrades: Always call checkCurrentPlan and getUpgradeOptions
- For termination: Always call checkTerminationEligibility

## Anti-Hallucination Guardrails (CRITICAL - ABSOLUTE PRIORITY):

**THESE RULES OVERRIDE ALL OTHER INSTRUCTIONS:**

1. **NEVER INVENT DATA - ZERO TOLERANCE:**
   - ❌ NEVER create plan names that don't exist in tool response
   - ❌ NEVER invent prices, data amounts, or features
   - ❌ NEVER make up contract terms, fees, or dates
   - ❌ NEVER guess or estimate any numerical values
   - ✅ ONLY use exact data from tool responses
   - ✅ If data is missing, use fallback messages (see section below)

2. **MANDATORY TOOL DATA VERIFICATION:**
   - Before mentioning ANY plan detail, verify it exists in the tool response
   - Plan names must match EXACTLY (case-sensitive)
   - Prices must match EXACTLY (don't round or estimate)
   - Data amounts must match EXACTLY (don't convert units)
   - Features must be listed EXACTLY as provided

3. **WHEN IN DOUBT:**
   - If you're unsure about ANY detail → Use fallback message
   - If tool response is unclear → Ask for clarification or escalate
   - If data seems incomplete → State what's missing explicitly
   - NEVER fill gaps with assumptions or "reasonable" guesses

4. **PLAN INFORMATION RULES:**
   - ONLY show plans returned by searchRedoneMobilePlans tool
   - Use plan_name field EXACTLY as provided in JSON
   - Use price.amount field EXACTLY as provided
   - Use data.total field EXACTLY as provided
   - If breakdown exists, use it; if not, don't invent it

5. **VERIFICATION CHECKLIST (before every response about plans):**
   - [ ] Did I call searchRedoneMobilePlans tool?
   - [ ] Is this plan name in the tool response?
   - [ ] Is this price in the tool response?
   - [ ] Are these features in the tool response?
   - [ ] Am I copying data EXACTLY, not paraphrasing?

**VIOLATION = CRITICAL ERROR. If you catch yourself inventing data, STOP and use a fallback message instead.**

### Account Data Fields:
- Always reference fields directly from the JSON
- If information is missing: State it's not available
- Never assume anything not explicitly in the data

### VAS (Value Added Services) Explanation Templates:

When explaining VAS to customers, use clear and structured phrasing:

**For Default Services (included in plan):**
- "Your plan includes the following services at no extra charge: [list services with amounts if applicable]"
- Example: "Your plan includes VoLTE, 5G access, and Call Divert at no extra charge."

**For Available Services (can subscribe):**
- "You can add these optional services to your plan: [list with pricing]"
- Example: "You can add International Roaming (RM15/month) or Premium Data Boost (RM10/month)."

**For Subscribed Services (currently active):**
- "You're currently subscribed to: [list with amounts and subscription dates]"
- Example: "You're currently subscribed to International Roaming (RM15/month, subscribed on 2024-01-15)."

**When listing multiple VAS:**
- Group by category (default, available, subscribed)
- Show amounts clearly with currency
- Mention subscription dates for active services
- Keep formatting consistent and easy to scan

### Explicit Fallback Messages for Unavailable Data:

Use these specific messages when data is not available:

**Missing Account Information:**
- "I don't have access to [specific information] in your account details. Would you like me to connect you with a representative who can help?"

**Missing Plan Details:**
- "The [specific detail] information is not available in our system right now. I can help you with other plan information, or connect you with our support team."

**Missing Billing Information:**
- "I'm unable to retrieve your [billing detail] at the moment. For accurate billing information, please contact our billing department or visit your nearest redONE store."

**Missing Contract Information:**
- "Your contract [specific detail] is not showing in our system. I recommend speaking with a customer service representative for accurate contract information."

**Missing Ticket/Log Information:**
- "I don't see any [tickets/logs] related to [topic] in your account history. This might be a new issue. Would you like me to create a support ticket?"

**General Data Unavailable:**
- "I'm sorry, but I don't have access to that information right now. Let me connect you with someone who can help, or you can visit your nearest redONE store."

**CRITICAL: Never invent or guess data. Always use these fallback messages when information is genuinely unavailable.**
`;

// Tools the supervisor can call
export const supervisorAgentTools = [
  {
    type: 'function',
    name: 'searchRedoneMobile',
    description: 'Search for redONE Malaysia mobile plans.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string' },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'lookupFAQDocument',
    description: 'Look up internal documents and FAQs by topic or keyword.',
    parameters: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
      },
      required: ['topic'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'authenticateUser',
    description: 'Authenticate user with phone number. Call this after user provides and confirms their phone number.',
    parameters: {
      type: 'object',
      properties: {
        phone_number: { 
          type: 'string',
          description: 'User phone number in format 01XXXXXXXX or 01X-XXXX XXXX'
        },
      },
      required: ['phone_number'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'verifyNRIC',
    description: 'Verify user NRIC (last 4 digits) for enhanced security. Required for plan upgrades and termination.',
    parameters: {
      type: 'object',
      properties: {
        nric_last_4: { 
          type: 'string',
          description: 'Last 4 digits of user NRIC'
        },
      },
      required: ['nric_last_4'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'getUserAccountInfo',
    description: 'Get user account information including billing, usage, tickets, and logs. ALWAYS call this FIRST before asking for authentication to check if user is already authenticated.',
    parameters: {
      type: 'object',
      properties: {
        phone_number: { 
          type: 'string',
          description: 'Optional - leave empty to check authentication status first'
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'checkCurrentPlan',
    description: 'Check user current plan details. ALWAYS call this FIRST to check authentication status before asking for credentials.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'getUpgradeOptions',
    description: 'Get available plan upgrade options for authenticated user based on their current plan.',
    parameters: {
      type: 'object',
      properties: {
        preference: {
          type: 'string',
          description: 'User preference: "more_data", "international_calls", "features", or "all"'
        }
      },
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'processUpgrade',
    description: 'Process plan upgrade after user confirmation. Requires authentication (phone + NRIC).',
    parameters: {
      type: 'object',
      properties: {
        current_plan: { type: 'string', description: 'Current plan name' },
        new_plan: { type: 'string', description: 'New plan name to upgrade to' },
        new_price: { type: 'number', description: 'New plan monthly price' }
      },
      required: ['current_plan', 'new_plan', 'new_price'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'checkTerminationEligibility',
    description: 'Check termination eligibility and fees. ALWAYS call this FIRST to check authentication status before asking for credentials.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'getRetentionOffers',
    description: 'Get retention offers for users who want to terminate service.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'processTermination',
    description: 'Process service termination after user confirmation. Requires authentication (phone + NRIC).',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'Reason for termination' },
        accept_early_termination_fee: { type: 'boolean', description: 'User accepts early termination fee' }
      },
      required: ['accept_early_termination_fee'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'findNearestStore',
    description: 'Find the nearest store location.',
    parameters: {
      type: 'object',
      properties: {
        postcode: { type: 'string' },
        city: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  {
    type: "function",
    name: "searchRedoneHomeWiFiPlans",
    description: "Search for redONE Malaysia home WiFi plans (SIM + 5G WiFi Device, SIM Only).",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Free-text search query. Can include plan name (e.g. 'SIM + 5G WiFi Device, SIM Only'), keyword (e.g. 'Internet', '5G WiFi Device', 'SIM Only').",
          examples: ["WiFi", "Wifi 5G", "Wifi 5G + SIM"]
        }
      },
      required: ["query"],
      additionalProperties: false
    }
  },
];

// Session storage for authentication state (in-memory for this implementation)
const sessionStore = new Map<string, any>();

// Local tool executor (mock or real)
function getToolResponse(fName: string, args: any, sessionId?: string) {
  const sid = sessionId || 'default-session';
  
  switch (fName) {
    case 'authenticateUser': {
      if (!args.phone_number) {
        return {
          success: false,
          error: 'Phone number required',
          message: 'Please provide your phone number for authentication.'
        };
      }
      
      try {
        const raw: string = String(args.phone_number);
        const digits = raw.replace(/\D/g, '');
        const isValid = /^(01\d{8,9}|601\d{8,9})$/.test(digits);
        
        if (!isValid) {
          return {
            success: false,
            error: 'Invalid mobile number format',
            message: "That doesn't look like a valid Malaysian mobile number. Please enter it as 01XXXXXXXX or 01X-XXXX XXXX."
          };
        }
        
        // Verify phone number exists in the system
        const accountInfo = getUserByMobile(digits);
        
        // Update session context with phone verification
        const session = sessionStore.get(sid) || {};
        session.phoneNumber = digits;
        session.isPhoneVerified = true;
        session.accountId = accountInfo.account.accountId;
        session.userName = accountInfo.customer.name;
        session.lastActivity = Date.now();
        sessionStore.set(sid, session);
        
        return {
          success: true,
          phoneVerified: true,
          userName: accountInfo.customer.name,
          message: 'Phone number verified successfully. Please provide last 4 digits of NRIC for additional security.',
          needsNricVerification: true,
        };
      } catch (error) {
        return {
          success: false,
          phoneVerified: false,
          error: 'Phone number not found in our system. Please verify and try again.',
        };
      }
    }
    
    case 'verifyNRIC': {
      const session = sessionStore.get(sid) || {};
      
      if (!session.isPhoneVerified) {
        return {
          success: false,
          error: 'Phone number must be verified first',
          message: 'Please verify your phone number before NRIC verification.'
        };
      }
      
      if (!args.nric_last_4) {
        return {
          success: false,
          error: 'NRIC last 4 digits required',
          message: 'Please provide the last 4 digits of your NRIC.'
        };
      }
      
      try {
        const accountInfo = getUserByMobile(session.phoneNumber);
        const actualNricLast4 = accountInfo.customer.nric.slice(-4);
        
        if (args.nric_last_4 === actualNricLast4) {
          session.isNricVerified = true;
          session.isFullyAuthenticated = true;
          session.lastActivity = Date.now();
          sessionStore.set(sid, session);
          
          return {
            success: true,
            nricVerified: true,
            fullyAuthenticated: true,
            message: 'NRIC verified successfully. You are now fully authenticated.',
          };
        } else {
          return {
            success: false,
            nricVerified: false,
            error: 'NRIC verification failed. The last 4 digits do not match our records.',
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'Verification error occurred.',
        };
      }
    }
    
    case 'getUserAccountInfo': {
      const session = sessionStore.get(sid) || {};
      
      // If no phone number provided, check if user is authenticated in session
      if (!args.phone_number) {
        if (session.isPhoneVerified && session.phoneNumber) {
          // User is authenticated, return their account info
          try {
            return getUserByMobile(session.phoneNumber);
          } catch (e) {
            return {
              error: 'Authentication required',
              code: 'AUTH_REQUIRED',
              needs_authentication: true,
              message: 'For security, may I have your phone number please?'
            };
          }
        } else {
          // User is not authenticated
          return {
            error: 'Authentication required',
            code: 'AUTH_REQUIRED',
            needs_authentication: true,
            message: 'For security, may I have your phone number please?'
          };
        }
      }
      
      // Phone number provided - authenticate and return info
      try {
        const raw: string = String(args.phone_number);
        const digits = raw.replace(/\D/g, '');
        const isValid = /^(01\d{8,9}|601\d{8,9})$/.test(digits);
        if (!isValid) {
          return {
            error: 'Invalid mobile number format',
            code: 'INVALID_MOBILE_FORMAT',
            needs_mobile_number: true,
            message: "That doesn't look like a valid Malaysian mobile number. Please enter it as 01XXXXXXXX or 01X-XXXX XXXX."
          };
        }
        return getUserByMobile(digits);
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (msg.includes('No user found')) {
          return {
            error: msg,
            code: 'USER_NOT_FOUND',
            needs_mobile_number: true,
            message: 'I could not find an account with that number. Could you please re-enter your mobile number and make sure it is correct?'
          };
        }
        return { error: 'Tool error', code: 'TOOL_ERROR' };
      }
    }
    
    case 'checkCurrentPlan': {
      const session = sessionStore.get(sid) || {};
      
      // Check if user is fully authenticated (phone + NRIC)
      if (!session.isFullyAuthenticated) {
        return {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          needs_authentication: true,
          message: 'For security, may I have your phone number please?'
        };
      }
      
      try {
        const accountInfo = getUserByMobile(session.phoneNumber);
        return {
          success: true,
          currentPlan: accountInfo.plan.planName,
          monthlyPrice: accountInfo.plan.planAmount.value,
          planDetails: accountInfo.plan,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to retrieve plan information.',
        };
      }
    }
    
    case 'getUpgradeOptions': {
      const session = sessionStore.get(sid) || {};
      
      if (!session.isFullyAuthenticated) {
        return {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Please authenticate first to view upgrade options.'
        };
      }
      
      try {
        const accountInfo = getUserByMobile(session.phoneNumber);
        const currentPrice = accountInfo.plan.planAmount.value;
        
        // Filter plans that are upgrades (higher price)
        const upgradePlans = redonePlans.filter((plan: any) => {
          const planPrice = parseFloat(plan.price?.replace(/[^\d.]/g, '') || '0');
          return planPrice > currentPrice;
        });
        
        return {
          success: true,
          currentPlan: accountInfo.plan.planName,
          currentPrice: currentPrice,
          upgradeOptions: upgradePlans.slice(0, 5), // Return top 5 upgrade options
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to retrieve upgrade options.',
        };
      }
    }
    
    case 'processUpgrade': {
      const session = sessionStore.get(sid) || {};
      
      if (!session.isFullyAuthenticated) {
        return {
          success: false,
          error: 'Full authentication required to process upgrade.',
        };
      }
      
      return {
        success: true,
        message: `Your upgrade from ${args.current_plan} to ${args.new_plan} has been processed successfully. Your new plan will be active within 24 hours.`,
        newPlan: args.new_plan,
        newPrice: args.new_price,
        effectiveDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }
    
    case 'checkTerminationEligibility': {
      const session = sessionStore.get(sid) || {};
      
      // Check if user is fully authenticated (phone + NRIC)
      if (!session.isFullyAuthenticated) {
        return {
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          needs_authentication: true,
          message: 'For security, may I have your phone number please?'
        };
      }
      
      try {
        const accountInfo = getUserByMobile(session.phoneNumber);
        const contractEndDate = new Date(accountInfo.contract.contractEnd || '');
        const today = new Date();
        const monthsRemaining = Math.max(0, Math.ceil((contractEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const earlyTerminationFee = monthsRemaining * accountInfo.plan.planAmount.value;
        
        return {
          success: true,
          contractEndDate: accountInfo.contract.contractEnd,
          monthsRemaining: monthsRemaining,
          earlyTerminationFee: earlyTerminationFee,
          canTerminate: true,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Unable to check termination eligibility.',
        };
      }
    }
    
    case 'getRetentionOffers': {
      return {
        success: true,
        offers: [
          { type: 'discount', description: '20% discount for next 3 months', value: '20%' },
          { type: 'data_bonus', description: 'Extra 50GB data for 6 months', value: '50GB' },
          { type: 'free_upgrade', description: 'Free upgrade to next tier plan for 2 months', value: 'Free' },
        ],
      };
    }
    
    case 'processTermination': {
      const session = sessionStore.get(sid) || {};
      
      if (!session.isFullyAuthenticated) {
        return {
          success: false,
          error: 'Full authentication required to process termination.',
        };
      }
      
      if (!args.accept_early_termination_fee) {
        return {
          success: false,
          error: 'You must accept the early termination fee to proceed.',
        };
      }
      
      const terminationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      return {
        success: true,
        message: 'Your termination request has been processed. Your service will end on ' + terminationDate,
        terminationDate: terminationDate,
        finalBillDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }
    case 'lookupFAQDocument':
      return exampleFAQQuestions;
    case 'findNearestStore':
      {
        if (!args.postcode && !args.city) {
          return {
            error: 'Postcode or city required',
            code: 'POSTCODE_OR_CITY_MISSING',
            needs_postcode_or_city: true,
            message: 'May I have your postcode or city to assist with your store location?'
          };
        }
        if (args.postcode) {
          const sortedStores = redoneStoreLocations.sort((a, b) => 
            Math.abs(Number(a.postcode) - args.postcode) - Math.abs(Number(b.postcode) - args.postcode)
          );
          const stores = sortedStores.slice(0, 3);
          if (stores.length === 0) {
            return {
              error: 'No stores found',
              code: 'STORE_NOT_FOUND',
              needs_postcode_or_city: true,
              message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
            };
          }
          return stores;
        }

        if (args.city) {
          const stores = redoneStoreLocations.filter(store => store.city.trim().toLowerCase() === args.city.trim().toLowerCase());
          if (stores.length === 0) {
            return {
              error: 'No stores found',
              code: 'STORE_NOT_FOUND',
            needs_postcode_or_city: true,
            message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
          };

          
        }
        return stores;
      }
      return {
        error: 'No stores found',
        code: 'STORE_NOT_FOUND',
        needs_postcode_or_city: true,
        message: 'I could not find any stores with that postcode or city. Could you please re-enter your postcode or city and make sure it is correct?'
      };
    }
    case 'searchRedoneMobilePlans':
      return redonePlans;
    case "searchRedoneHomeWiFiPlans":
      return redoneHomeWiFiPlans;
    default:
      return { result: true };
  }
}

// Send request to your API (or directly to OpenAI)
async function fetchResponsesMessage(body: any) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, parallel_tool_calls: false }),
  });
  console.log('response', response);
  if (!response.ok) return { error: 'Something went wrong.' };
  return response.json();
}

// Iteratively handle function calls until final message
async function handleToolCalls(body: any, response: any) {
  let currentResponse = response;

  while (true) {
    if (currentResponse?.error) return { error: 'Something went wrong.' };

    const outputItems: any[] = currentResponse.output ?? [];
    const functionCalls = outputItems.filter((item) => item.type === 'function_call');

    if (functionCalls.length === 0) {
      const messages = outputItems.filter((item) => item.type === 'message');
      return messages
        .map((msg) =>
          (msg.content ?? [])
            .filter((c: any) => c.type === 'output_text')
            .map((c: any) => c.text)
            .join('')
        )
        .join('\n');
    }

    for (const toolCall of functionCalls) {
      const fName = toolCall.name;
      const args = JSON.parse(toolCall.arguments || '{}');
      const toolRes = getToolResponse(fName, args);

      // Add results to the body to send back
      body.input.push(
        { type: 'function_call', call_id: toolCall.call_id, name: fName, arguments: toolCall.arguments },
        { type: 'function_call_output', call_id: toolCall.call_id, output: JSON.stringify(toolRes) }
      );
    }

    currentResponse = await fetchResponsesMessage(body);
  }
}

// Main exported tool for the chat agent
export const getNextResponseFromSupervisor = async (relevantContextFromLastUserMessage: string) => {
  const body: any = {
    model: 'gpt-4o-mini',
    input: [
      { type: 'message', role: 'system', content: supervisorAgentInstructions },
      {
        type: 'message',
        role: 'user',
        content: `${relevantContextFromLastUserMessage}`,
      },
    ],
    tools: supervisorAgentTools,
  };

  const response = await fetchResponsesMessage(body);
  console.log('response', response);
  if (response.error) return { error: 'Something went wrong.' };

  const finalText = await handleToolCalls(body, response);
  if ((finalText as any)?.error) return { error: 'Something went wrong.' };

  return { nextResponse: finalText as string };
};
