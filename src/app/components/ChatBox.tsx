"use client"
import { useEffect, useState } from 'react';

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  // Load existing history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/chat', { method: 'GET', credentials: 'include' });
        const data = await res.json();
        if (Array.isArray(data.history)) {
          setMessages(data.history);
        }
      } catch (e) {
        // non-fatal
        console.warn('Failed to load history', e);
      }
    };
    loadHistory();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    const userMessage = input;
    setInput('');

    // Call API
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await res.json();

    // Prefer server history to keep in sync across refreshes/tabs
    if (Array.isArray(data.history)) {
      setMessages(data.history);
    } else if (data.reply) {
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto border rounded p-4 bg-white">
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block p-2 rounded ${
                msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          className="flex-1 border p-2 rounded-l"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="bg-blue-500 text-white p-2 rounded-r" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
