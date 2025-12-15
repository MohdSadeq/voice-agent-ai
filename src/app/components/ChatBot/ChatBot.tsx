import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { FaceIcon } from "@radix-ui/react-icons";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  apiEndpoint?: string;
}

export function ChatBot({
  title = "AI Assistant",
  subtitle = "How can I help you today?",
  welcomeMessage = "Hello! I'm here to help. Ask me anything!",
  apiEndpoint = "/api/chat",
}: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let existingSession = localStorage.getItem('chatSessionId');
    if (!existingSession) {
      existingSession = uuidv4();
      localStorage.setItem('chatSessionId', existingSession);
    }
    setSessionId(existingSession);
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    if (!sessionId) return; 

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, sessionId}),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that request." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center",
          "rounded-full bg-chat-accent text-chat-accent-foreground shadow-lg",
          "hover:bg-chat-accent-hover hover:scale-105 active:scale-95",
          "transition-all duration-300",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)]",
          "rounded-2xl bg-chat-window shadow-2xl border border-chat-border",
          "flex flex-col overflow-hidden",
          "transition-all duration-300 origin-bottom-right",
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ height: "min(720px, calc(100vh - 6rem))" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-chat-header border-b border-chat-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chat-accent/10">
          <Image src="/favicon.ico" alt="Logo" width={20} height={20}/>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-chat-header-foreground">{title}</h3>
            <p className="text-xs text-chat-header-muted">{subtitle}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-chat-header-muted">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-messages">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <ChatMessage role="assistant" content="" isTyping />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </>
  );
}
