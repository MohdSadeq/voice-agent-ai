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
          <div className="bg-card rounded-xl border border-border p-6 text-left space-y-4">
            <h2 className="font-semibold text-foreground">Features:</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Smooth open/close animations
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Typing indicator with bouncing dots
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Auto-expanding textarea input
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Message animations with fade + slide
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Fully themed with CSS variables
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-chat-accent" />
                Dark mode support
              </li>
            </ul>
          </div>
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
