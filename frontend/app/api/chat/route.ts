import { NextRequest, NextResponse } from "next/server";
import { generateKnowledgeResponse } from "@/lib/knowledgeEngine";
import { Language } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, language = "en", conversation_id, user_id } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ detail: "Query cannot be empty" }, { status: 422 });
    }

    const trimmedQuery = query.trim();
    const lang = (language as Language) || "en";

    // 1. If an external Python backend is configured, attempt to proxy first
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmedQuery, language: lang, conversation_id, user_id }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (proxyErr) {
        // Fall back gracefully to built-in knowledge engine
      }
    }

    // 2. Built-in Next.js Grounded RAG Knowledge Engine
    const result = generateKnowledgeResponse(trimmedQuery, lang, conversation_id);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || "An error occurred while generating the response" },
      { status: 500 }
    );
  }
}
