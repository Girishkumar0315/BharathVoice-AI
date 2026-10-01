import { ChatResponse, Language, CategoryItem } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = "Something went wrong while generating the response. Please try again.";
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore parse errors, use default message */
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function sendChat(
  query: string,
  language: Language,
  conversationId?: string,
  userId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language, conversation_id: conversationId, user_id: userId }),
  });
  return handle<ChatResponse>(res);
}

export async function sendVoiceTranscript(
  transcript: string,
  language: Language,
  conversationId?: string,
  userId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/voice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, language, conversation_id: conversationId, user_id: userId }),
  });
  return handle<ChatResponse>(res);
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch(`${API_BASE}/categories`);
  return handle<CategoryItem[]>(res);
}

export async function uploadDocument(file: File, language: Language) {
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  const res = await fetch(`${API_BASE}/document`, { method: "POST", body: form });
  return handle<any>(res);
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handle<any>(res);
}

export async function fetchConversations(userId?: string) {
  const url = userId ? `${API_BASE}/conversations?user_id=${userId}` : `${API_BASE}/conversations`;
  const res = await fetch(url);
  return handle<any>(res);
}

export async function saveProfile(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<any>(res);
}
