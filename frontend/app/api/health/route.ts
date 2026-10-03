import { NextResponse } from "next/server";
import { ALL_SCHEMES } from "@/lib/knowledgeData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "BharathVoice AI API & Knowledge Engine",
    vector_index_size: ALL_SCHEMES.length,
    languages_supported: ["en", "hi", "te", "kn"],
    supabase_configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}
