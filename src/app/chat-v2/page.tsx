"use client"
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="chat-red min-h-screen bg-background">
      {/* Demo page content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            redONE Chat Bot V2
          </h1>
          <p className="text-lg text-muted-foreground">
            Multi-agent customer service system with specialized agents
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>✨ <strong>Powered by textChatSupervisorV2</strong></p>
            <p>🤖 7 Specialized Agents: Account, Plans, Upgrades, Termination, Store Locator, FAQ</p>
            <p>📱 HTML-formatted responses for better readability</p>
          </div>
        </div>
      </div>

      <ChatBot
        title="redONE Assistant V2"
        subtitle="Multi-agent customer service"
        welcomeMessage="Hi! Welcome to redONE Mobile Service. How can I help you today?"
        apiEndpoint="/api/chat-v2"
      />
    </div>
  );
};

export default Index;
