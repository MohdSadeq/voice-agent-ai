// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ChatAgent } from '../../agentConfigs/textChatSupervisor/index';

// In-memory session store for ChatAgent instances
// Note: This is per server instance. In serverless or multi-instance deployments,
// use a shared store (DB/Redis) to persist chat history.
const sessionAgents = new Map<string, ChatAgent>();

function getOrCreateSessionId(req: NextRequest): string {
  let sid = req.cookies.get('sid')?.value;
  if (!sid) {
    sid = crypto.randomUUID();
  }
  return sid;
}

function getAgentForSession(sessionId: string): ChatAgent {
  let agent = sessionAgents.get(sessionId);
  if (!agent) {
    agent = new ChatAgent(sessionId);
    sessionAgents.set(sessionId, agent);
  }
  return agent;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Derive or create a session id from cookie
   // const sessionId = getOrCreateSessionId(req);
    const agent = getAgentForSession(sessionId);

    const reply = await agent.handleUserMessage(message);
    const res = NextResponse.json({ reply, history: agent.getHistory(), sessionId });
    // Ensure the session cookie is set for subsequent requests
    res.cookies.set('sid', sessionId, { httpOnly: true, sameSite: 'lax', path: '/' });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
