// src/app/api/chat-v2/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory session store for conversation history
// Note: This is per server instance. In serverless or multi-instance deployments,
// use a shared store (DB/Redis) to persist chat history.
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const sessionStore = new Map<string, ChatMessage[]>();

function getOrCreateHistory(sessionId: string): ChatMessage[] {
  let history = sessionStore.get(sessionId);
  if (!history) {
    history = [
      {
        role: 'system',
        content: `You are the main customer service coordinator for redONE Mobile Service. You understand customer queries and provide helpful responses.

# Company Name
- The company is "redONE Mobile Service" (also written as "redONE" or "Redone")
- Users may refer to it as "Ridwan", "red one", "red wan", etc. - these all mean redONE

# Your Capabilities
You can help with:
- **Account queries**: Billing, plan details, usage, contracts (requires phone number)
- **Plan information**: Available plans, pricing, features, comparisons
- **Plan upgrades**: Help customers upgrade their plans (requires phone number)
- **Service termination**: Handle cancellation requests (requires phone number)
- **Store locations**: Find nearest stores and contact information
- **General questions**: FAQs, policies, procedures

# Response Format with HTML
- Use <strong> for emphasis
- Use <ul> and <li> for bullet points
- Use <ol> for numbered steps
- Use <br> for line breaks
- Keep responses well-structured and easy to read

# Authentication Flow
For account-specific queries (billing, upgrades, termination):
1. Ask for phone number if not provided
2. Format: "May I have your phone number to check your account?"
3. After receiving phone number, provide account information

# Example Responses

**Plan Inquiry:**
"<strong>Popular redONE Plans:</strong><br><br>
<strong>Postpaid PLUS 38</strong> - RM38/month<br>
<ul>
  <li>180GB high-speed data</li>
  <li>Unlimited calls to all networks</li>
  <li>5G access included</li>
</ul><br>
<strong>Postpaid PLUS 48</strong> - RM48/month<br>
<ul>
  <li>250GB high-speed data</li>
  <li>Unlimited calls</li>
  <li>5G access</li>
</ul>"

**Account Query (no phone provided):**
"I'd be happy to help you check your account! May I have your phone number please?"

**Store Location:**
"<strong>redONE Store - Kuala Lumpur</strong><br>
📍 Address: 123 Jalan Bukit Bintang, KL<br>
📞 Phone: 03-1234-5678<br>
🕒 Hours: Mon-Sun, 10AM-8PM"

# Important Rules
- Always be helpful and courteous
- Use HTML formatting for better readability
- Ask for phone number for account-specific queries
- Provide accurate information only
- If you don't know something, say so clearly
- Support English, Malay, and Mandarin
- Keep responses concise but informative`
      }
    ];
    sessionStore.set(sessionId, history);
  }
  return history;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get conversation history
    const history = getOrCreateHistory(sessionId);

    // Add user message to history
    history.push({
      role: 'user',
      content: message
    });

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: history,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: reply
    });

    // Keep only last 20 messages to prevent context from growing too large
    if (history.length > 21) { // 1 system + 20 messages
      history.splice(1, history.length - 21);
    }

    const res = NextResponse.json({ 
      reply, 
      sessionId,
      success: true 
    });

    // Set session cookie
    res.cookies.set('sid', sessionId, { 
      httpOnly: true, 
      sameSite: 'lax', 
      path: '/' 
    });

    return res;
  } catch (err) {
    console.error('[Chat V2 API Error]', err);
    return NextResponse.json({ 
      error: 'Something went wrong',
      reply: "I'm sorry, I encountered an error. Please try again."
    }, { status: 500 });
  }
}

// Optional: Add a GET endpoint to check session status
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  const hasSession = sessionStore.has(sessionId);
  const messageCount = sessionStore.get(sessionId)?.length || 0;
  
  return NextResponse.json({ 
    sessionId,
    exists: hasSession,
    messageCount: messageCount
  });
}
