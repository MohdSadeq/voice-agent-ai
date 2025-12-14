import { getNextResponseFromSupervisor } from './supervisorAgent';

export interface ChatContext {
  userMobileNumber?: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export class ChatAgent {
  context: ChatContext;

  constructor() {
    this.context = { history: [] };
  }

  // Add message to history
  private addMessage(role: 'user' | 'assistant', content: string) {
    this.context.history.push({ role, content });
  }

  // Get last message from user
  private getLastUserMessage() {
    const reversed = [...this.context.history].reverse();
    return reversed.find((msg) => msg.role === 'user')?.content || '';
  }

  // Main function to handle user messages
  public async handleUserMessage(userMessage: string) {
    this.addMessage('user', userMessage);

    // Handle greetings locally
    const greetings = ['hi', 'hello', 'hey', 'hiya'];
    if (greetings.includes(userMessage.toLowerCase().trim())) {
      const greetingReply = "Hi, you've reached redONE Mobile Service, how can I help you?";
      this.addMessage('assistant', greetingReply);
      return greetingReply;
    }

    // Handle basic chitchat or thank you
    if (userMessage.toLowerCase().includes('thank')) {
      const reply = 'You’re welcome! Anything else I can help with?';
      this.addMessage('assistant', reply);
      return reply;
    }

    // Check if we need the mobile number
    if (!this.context.userMobileNumber && /bill|plan|account|subscription|line status/i.test(userMessage)) {
      const numberRequest = 'May I have your mobile number to assist with your account?';
      this.addMessage('assistant', numberRequest);
      return numberRequest;
    }

    // Call the supervisor agent for all non-trivial queries
    const fillerPhrases = [
      'Just a second.',
      'Let me check.',
      'One moment.',
      'Let me look into that.',
      'Give me a moment.',
      'Let me see.',
    ];
    const filler = fillerPhrases[Math.floor(Math.random() * fillerPhrases.length)];
    this.addMessage('assistant', filler);

    const relevantContext = this.getLastUserMessage();

    const supervisorResponse = await getNextResponseFromSupervisor(relevantContext);
    const finalResponse = supervisorResponse.nextResponse || "Sorry, something went wrong.";

    this.addMessage('assistant', finalResponse);
    return finalResponse;
  }

  // Optional: manually set/update mobile number
  public setMobileNumber(number: string) {
    this.context.userMobileNumber = number;
  }

  // Get conversation history
  public getHistory() {
    return this.context.history;
  }
}
export const chatAgent = new ChatAgent();
// Example usage
// const chatAgent = new ChatAgent();
// const reply = await chatAgent.handleUserMessage("Hi");
// console.log(reply);
