import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotV2Props {
  title?: string;
  subtitle?: string;
  welcomeMessage?: string;
  apiEndpoint?: string;
}

export function ChatBotV2({
  title = "AI Assistant",
  subtitle = "How can I help you today?",
  welcomeMessage = "Hello! I'm here to help. Ask me anything!",
  apiEndpoint = "http://localhost:3010/chat",
}: ChatBotV2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Prepare request body - include sessionId if we have one
      const requestBody: { message: string; sessionId?: string } = {
        message: content,
      };
      
      if (sessionId) {
        requestBody.sessionId = sessionId;
      }

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const data = await res.json();

      // Extract sessionId from the first response
      if (data.success && data.data) {
        // Store sessionId if this is the first message
        if (!sessionId && data.data.sessionId) {
          setSessionId(data.data.sessionId);
          console.log("Session ID received:", data.data.sessionId);
        }

        // Extract the message from the response
        const assistantMessage = data.data.message || "I received your message.";
        setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process that request." },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops! Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      // Ensure the input is focused after we finish processing
      requestAnimationFrame(() => inputRef.current?.focus());
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
        <ChatInput onSend={sendMessage} disabled={isLoading} inputRef={inputRef} />
      </div>
    </>
  );
}
