import { getNextResponseFromSupervisor } from './supervisorAgent';

export interface ChatContext {
  sessionId?: string; // added session id
  userMobileNumber?: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export class ChatAgent {
  context: ChatContext;

  constructor(sessionId?: string) {
    this.context = { sessionId, history: [] };
  }

  public setSessionId(sessionId: string) {
    this.context.sessionId = sessionId;
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    this.context.history.push({ role, content });
  }

  private getLastUserMessage() {
    const reversed = [...this.context.history].reverse();
    return reversed.find((msg) => msg.role === 'user')?.content || '';
  }

  public async handleUserMessage(userMessage: string) {
    this.addMessage('user', userMessage);
console.log(this.context.history);
    // Local greeting handling
    const greetings = ['hi', 'hello', 'hey', 'hiya'];
    if (greetings.includes(userMessage.toLowerCase().trim())) {
      const greetingReply = "Hi, you've reached redONE Mobile Service, how can I help you?";
      this.addMessage('assistant', greetingReply);
      return greetingReply;
    }

    // Local chitchat
    if (userMessage.toLowerCase().includes('thank')) {
      const reply = 'You’re welcome! Anything else I can help with?';
      this.addMessage('assistant', reply);
      return reply;
    }
/*
    if (!this.context.userMobileNumber && /bill|plan|account|subscription|line status/i.test(userMessage)) {
      const numberRequest = 'May I have your mobile number to assist with your account?';
      this.addMessage('assistant', numberRequest);
      return numberRequest;
    }
*/
    // Call supervisor agent

    // Build chat history
    const relevantContextFromLastUserMessage = this.getHistory();
    const chatHistory = relevantContextFromLastUserMessage
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');

    // 1) Extract user intent from the latest user message via our API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let userIntent = '';
    /*try {
      const intentRes = await fetch(`${baseUrl}/api/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
      });
      if (intentRes.ok) {
       const intentJson = await intentRes.json();
        userIntent = intentJson?.userIntent || '';
      }
    } catch (e) {
      // Non-fatal: proceed without intent
      console.warn('intent API failed', e);
    }*/

    // 2) Pass intent + history to supervisor in ChatSupervisor-style format
    const supervisorInput = `==== Conversation History ====\n${chatHistory}\n\n==== Relevant Context From Last User Message ===\n${this.getLastUserMessage()}`;
    const supervisorResponse = await getNextResponseFromSupervisor(supervisorInput);
    const finalResponse = supervisorResponse.nextResponse || "Sorry, something went wrong.";

    this.addMessage('assistant', finalResponse);
    return finalResponse;
  }

  public setMobileNumber(number: string) {
    this.context.userMobileNumber = number;
  }

  public getHistory() {
    return this.context.history;
  }
}

export const chatAgent = new ChatAgent();
// Example usage
// const chatAgent = new ChatAgent();
// const reply = await chatAgent.handleUserMessage("Hi");
// console.log(reply);
