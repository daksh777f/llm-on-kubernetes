import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Convert messages to a single prompt string for tinyllama
  const prompt = messages
    .map((m: { role: string; content: string }) =>
      m.role === "user" ? `User: ${m.content}` : `Assistant: ${m.content}`
    )
    .join("\n") + "\nAssistant:";

  try {
    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tinyllama",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      response: data.response || "No response from model.",
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Ollama error:", message);
    return NextResponse.json(
      { response: `Error: ${message}` },
      { status: 500 }
    );
  }
}