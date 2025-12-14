import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-chat-user-avatar" : "bg-chat-bot-avatar"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-chat-user-avatar-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-chat-bot-avatar-foreground" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : "bg-chat-bot text-chat-bot-foreground rounded-bl-md"
        )}
      >
        {isTyping ? (
          <div className="flex items-center gap-1 py-1">
            <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-current opacity-60 animate-bounce" />
          </div>
        ) : (
         <div dangerouslySetInnerHTML={{ __html: content }} />
        )}
      </div>
    </div>
  );
}
