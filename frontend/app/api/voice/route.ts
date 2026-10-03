import { NextRequest, NextResponse } from "next/server";
import { generateKnowledgeResponse } from "@/lib/knowledgeEngine";
import { Language } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, language = "en", conversation_id, user_id } = body;

    const text = transcript || body.query;
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ detail: "Transcript cannot be empty" }, { status: 422 });
    }

    const trimmedText = text.trim();
    const lang = (language as Language) || "en";

    // 1. If an external Python backend is explicitly set, attempt to proxy
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl && !backendUrl.includes("localhost")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${backendUrl}/api/voice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: trimmedText, language: lang, conversation_id, user_id }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall back gracefully to built-in knowledge engine
      }
    }

    // 2. Built-in Next.js Grounded RAG Knowledge Engine
    const result = generateKnowledgeResponse(trimmedText, lang, conversation_id);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "An error occurred while generating the response" },
      { status: 500 }
    );
  }
}
