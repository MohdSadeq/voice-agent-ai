import { NextResponse } from "next/server";
import { getSessionContext } from "@/app/agentConfigs/customerServiceV2/sessionContext";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-realtime-mini",
        }),
      }
    );
    const data = await response.json();
    
    // Initialize session in sessionContext at the very start
    const sessionId = data.id; // OpenAI session ID
    
    // This creates the session if it doesn't exist
    const session = getSessionContext(sessionId);
    
    console.log('[Session Initialized]', { 
      sessionId,
      timestamp: new Date().toISOString(),
      session: {
        isAuthenticated: session.isAuthenticated,
        timestamp: session.timestamp
      }
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
