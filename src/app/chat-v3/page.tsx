"use client"
import { ChatBotV2 } from "@/app/components/ChatBot/ChatBotV2";

const endpoint = process.env.NEXT_PUBLIC_CHAT_API_BASE_URL || "http://localhost:3010/chat2";
const ChatV3Page = () => {
  return (
    <div className="chat-red min-h-screen bg-background">
      {/* Demo page content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Chat Bot
          </h1>
        </div>
      </div>

      <ChatBotV2
        title="redONE Assistant"
        subtitle="Ask me anything!"
        welcomeMessage="Hi there! 👋 I'm your redONE assistant. How can I help you today?"
        apiEndpoint={endpoint}
      />
    </div>
  );
};

export default ChatV3Page;
