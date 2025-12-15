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

    const intentResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Extract the user intent in a concise sentence. Only return the intent, no greetings or extra text.',
        },
        { role: 'user', content: userMessage },
      ],
      temperature: 0,
      max_tokens: 50,
    });

    const userIntent = intentResponse.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ userIntent });
  } catch (err: any) {
    console.error('summarize-intent error', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
