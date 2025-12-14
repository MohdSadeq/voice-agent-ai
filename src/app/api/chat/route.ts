// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { chatAgent } from '../../agentConfigs/textChatSupervisor/index';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const reply = await chatAgent.handleUserMessage(message);
    return NextResponse.json({ reply, history: chatAgent.getHistory() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
