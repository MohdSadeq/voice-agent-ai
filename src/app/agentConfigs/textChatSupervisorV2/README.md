# Text Chat Supervisor V2

A text-optimized multi-agent customer service system for redONE Mobile Service, based on the customerServiceV2 architecture.

## Overview

This is a production-grade text chat system that uses specialized agents with HTML formatting support. It's adapted from the voice-optimized customerServiceV2 system.

## Architecture

### Multi-Agent System
- **Supervisor Agent**: Routes customers to the right specialist
- **Account Agent**: Handles account-specific queries (requires authentication)
- **Plans Agent**: Explains available plans and pricing
- **Plan Upgrade Agent**: Processes plan upgrades (requires authentication)
- **Termination Agent**: Handles service cancellations (requires authentication)
- **Store Locator Agent**: Finds store locations
- **FAQ Agent**: Answers general questions and policies

## Key Features

### 1. **HTML Formatting Support**
All agents are optimized to output HTML for better text chat readability:
- `<strong>` for emphasis
- `<ul>` and `<li>` for bullet points
- `<ol>` and `<li>` for numbered lists
- `<br>` for line breaks
- `<a>` for links

Example output:
```html
<strong>Your Current Plan:</strong><br>
Postpaid PLUS 38 - RM38/month<br><br>
<strong>Features:</strong><br>
<ul>
  <li>180GB high-speed data</li>
  <li>Unlimited calls to all networks</li>
  <li>5G access included</li>
</ul>
```

### 2. **Text-Optimized Instructions**
- Shorter, more concise responses suitable for text chat
- Structured formatting for easy scanning
- Clear visual hierarchy with HTML tags
- Better organization of information

### 3. **Specialized Agents**
Each agent is an expert in its domain:
- **Separation of concerns**: Easy to maintain and update
- **Focused prompts**: Better accuracy and performance
- **Independent testing**: Test each agent separately
- **Scalable**: Add new agents without affecting existing ones

### 4. **Authentication Flow**
- Public agents (Plans, Store Locator, FAQ): No authentication required
- Private agents (Account, Plan Upgrade, Termination): Require authentication
- Session management with context preservation

## Comparison: textChatSupervisorV2 vs textChatSupervisor

| Feature | textChatSupervisorV2 | textChatSupervisor (Original) |
|---------|---------------------|-------------------------------|
| **Architecture** | Multi-agent (7 specialized agents) | Monolithic (1 agent) |
| **Maintainability** | ✅ High - Each agent is independent | ❌ Low - All in one file |
| **Scalability** | ✅ Easy to add new agents | ❌ Hard - Must modify core agent |
| **Prompt Optimization** | ✅ Each agent has focused prompts | ❌ One large prompt for everything |
| **Testing** | ✅ Test each agent independently | ❌ Must test entire system |
| **Error Isolation** | ✅ Issues in one agent don't affect others | ❌ One error can break everything |
| **Team Collaboration** | ✅ Multiple devs can work on different agents | ❌ Conflicts when multiple devs edit |
| **HTML Formatting** | ✅ Built-in HTML support | ⚠️ Limited formatting |
| **Authentication** | ✅ Clear separation of public/private agents | ⚠️ Mixed in one agent |
| **Production Ready** | ✅ Yes - Enterprise-grade | ⚠️ Good for simple use cases |

## Comparison: textChatSupervisorV2 vs customerServiceV2

| Feature | textChatSupervisorV2 | customerServiceV2 |
|---------|---------------------|-------------------|
| **Target** | Text chat | Voice chat |
| **Formatting** | HTML tags | Voice-friendly prose |
| **Response Length** | Structured, scannable | Short, conversational |
| **Visual Elements** | Bullets, tables, bold | Spoken descriptions |
| **Architecture** | Same multi-agent system | Same multi-agent system |
| **Agents** | Same 7 agents | Same 7 agents |
| **Tools** | Same tools | Same tools |

## Usage

### Import the scenario
```typescript
import { textChatSupervisorV2Scenario } from './agentConfigs/textChatSupervisorV2';

// Use in your text chat application
const agents = textChatSupervisorV2Scenario;
```

### Individual agent access
```typescript
import { 
  supervisorAgent,
  accountAgent,
  plansAgent,
  planUpgradeAgent,
  terminationAgent,
  storeLocatorAgent,
  faqAgent
} from './agentConfigs/textChatSupervisorV2';
```

## Agent Responsibilities

### 1. Supervisor Agent
- **Role**: Router
- **Authentication**: Not required
- **Responsibilities**: 
  - Greet customers
  - Understand queries
  - Transfer to appropriate specialist
- **Transfer Rules**: Clear guidelines for routing

### 2. Account Agent
- **Role**: Account Management
- **Authentication**: Required
- **Responsibilities**:
  - Billing inquiries
  - Plan details
  - Contract information
  - Usage queries
  - Ticket history

### 3. Plans Agent
- **Role**: Plan Information
- **Authentication**: Not required
- **Responsibilities**:
  - Available plans
  - Pricing information
  - Plan comparisons
  - Home WiFi plans
  - Features and benefits

### 4. Plan Upgrade Agent
- **Role**: Plan Upgrades
- **Authentication**: Required
- **Responsibilities**:
  - Check current plan
  - Suggest upgrades
  - Calculate price differences
  - Process upgrades

### 5. Termination Agent
- **Role**: Service Cancellation
- **Authentication**: Required
- **Responsibilities**:
  - Check contract status
  - Calculate termination fees
  - Offer retention deals
  - Process cancellations

### 6. Store Locator Agent
- **Role**: Store Information
- **Authentication**: Not required
- **Responsibilities**:
  - Find nearest stores
  - Provide addresses
  - Share contact information
  - Operating hours

### 7. FAQ Agent
- **Role**: General Information
- **Authentication**: Not required
- **Responsibilities**:
  - Answer how-to questions
  - Explain policies
  - Troubleshooting guides
  - General service info

## Production Recommendation

### ✅ **Use textChatSupervisorV2 for Production**

**Reasons:**
1. **Scalable Architecture**: Easy to add new features (like you added plan upgrade and termination)
2. **Maintainable**: Each agent is independent and focused
3. **Team-Friendly**: Multiple developers can work simultaneously
4. **Better Testing**: Test each agent independently
5. **Error Isolation**: Issues in one agent don't affect others
6. **HTML Support**: Better formatting for text chat
7. **Clear Separation**: Public vs private agents
8. **Future-Proof**: Easy to extend and modify

### When to Use textChatSupervisor (Original)
- Quick prototypes
- Very simple use cases
- Single developer projects
- When you need to get something running quickly

## Example Interactions

### Plan Inquiry
```
User: "What plans do you offer?"
Supervisor: "Let me transfer you to our plans expert."
Plans Agent: 
"<strong>Popular Plans:</strong><br><br>
<strong>Postpaid PLUS 38</strong> - RM38/month<br>
• 180GB data<br>
• Unlimited calls<br><br>
<strong>Postpaid PLUS 48</strong> - RM48/month<br>
• 250GB data<br>
• Unlimited calls"
```

### Plan Upgrade
```
User: "I want to upgrade my plan"
Supervisor: "I'll connect you with our upgrade specialist."
Upgrade Agent: "I'll need to verify your identity first. May I have your phone number?"
User: "0123456789"
Upgrade Agent: 
"<strong>Your Current Plan:</strong> PLUS 38 (RM38/month)<br><br>
<strong>Available Upgrades:</strong><br><br>
<strong>PLUS 48</strong> - RM48/month (+RM10)<br>
• 250GB data (+70GB)<br>
• Unlimited calls"
```

### Service Termination
```
User: "I want to cancel my service"
Supervisor: "Let me connect you with our termination specialist."
Termination Agent: "I understand. Let me check your contract status."
[After authentication]
Termination Agent:
"<strong>Contract Status:</strong><br>
• Contract ends: Dec 31, 2025<br>
• Early termination fee: RM500<br>
• Outstanding balance: RM45.50<br>
• Total cost: RM545.50<br><br>
Before we proceed, have you considered our retention offers?"
```

## Best Practices

1. **Always authenticate** before providing sensitive information
2. **Use HTML formatting** for better readability
3. **Keep responses structured** with clear sections
4. **Provide clear next steps** for customers
5. **Offer to escalate** when needed
6. **Test each agent** independently

## Future Enhancements

Potential additions to the system:
- **Payment Agent**: Handle payment processing
- **Technical Support Agent**: Handle technical issues
- **Roaming Agent**: Manage roaming services
- **Device Agent**: Help with device-related queries
- **Loyalty Agent**: Manage rewards and loyalty programs

## Conclusion

**textChatSupervisorV2 is production-ready** and recommended for enterprise use. It combines the best of both worlds:
- Multi-agent architecture from customerServiceV2
- Text-optimized formatting for chat applications
- HTML support for better user experience
- Scalable and maintainable codebase

Use this system for your production text chat application!
