import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type a message..." }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-chat-border bg-chat-input-bg">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 resize-none rounded-xl border border-chat-border bg-background px-4 py-3",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-chat-accent focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "transition-all duration-200 min-h-[48px] max-h-32"
        )}
        style={{
          height: "auto",
          minHeight: "48px",
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = Math.min(target.scrollHeight, 128) + "px";
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          "bg-chat-accent text-chat-accent-foreground",
          "hover:bg-chat-accent-hover active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          "transition-all duration-200 shadow-md hover:shadow-lg"
        )}
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
