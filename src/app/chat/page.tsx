"use client"
import { ChatBot } from "@/components/ChatBot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Demo page content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Chat Bot
          </h1>
          <p className="text-lg text-muted-foreground">
           Try our chat bot
          </p>
     
        </div>
      </div>

      <ChatBot
        title="AI Assistant"
        subtitle="Ask me anything!"
        welcomeMessage="Hi there! 👋 I'm your AI assistant. How can I help you today?"
      />
    </div>
  );
};

export default Index;
