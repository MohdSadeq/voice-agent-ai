// src/app/api/summarize-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { userMessage } = await req.json();
    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     const supervisorAgentInstructions = `Extract the user intent in a concise sentence. Only return the intent, no greetings or extra text. - You support English, Malay, and Mandarin Language. If user ask in Malay or Mandarin, you should reply in Malay or Mandarin.
     - You must reply in the language that the user asked in last message or messages before if last messages are numbers or input.
     - You are a Redone Mobile Support Agent for a telecommunications company.
     - Please focus on which language the user asked in last message or messages before if last messages are numbers. `;

    const intentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: supervisorAgentInstructions,
        },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    const userIntent = intentResponse.choices[0]?.message?.content?.trim() || '';
    console.log('userIntent', userIntent);

    return NextResponse.json({ userIntent });
  } catch (err: any) {
    console.error('summarize-intent error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
