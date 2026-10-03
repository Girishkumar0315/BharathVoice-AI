"use client";

import { useEffect, useRef, useState } from "react";
import { v4 as uuidLike } from "@/lib/utils";
import { ChatMessage, AssistantState, Language, SourceRef } from "@/lib/types";
import { sendChat, sendVoiceTranscript } from "@/lib/api";
import { generateKnowledgeResponse } from "@/lib/knowledgeEngine";
import { startListening, speak, isSpeechRecognitionSupported } from "@/lib/speech";
import MessageBubble from "./MessageBubble";
import ThinkingAnimation from "./ThinkingAnimation";
import VoiceButton from "./VoiceButton";
import AIOrb from "./AIOrb";

const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    "What scholarships are available for students?",
    "Explain this government notification",
    "Tell me about agriculture support",
    "Find employment-related schemes",
  ],
  hi: [
    "छात्रों के लिए कौन-कौन सी छात्रवृत्तियां उपलब्ध हैं?",
    "मुझे इस सरकारी अधिसूचना के बारे में बताएं",
    "कृषि सहायता के बारे में बताएं",
    "रोजगार से जुड़ी योजनाएं खोजें",
  ],
  te: [
    "విద్యార్థులకు ఏమైనా స్కాలర్‌షిప్‌లు ఉన్నాయా?",
    "ఈ ప్రభుత్వ నోటిఫికేషన్‌ను వివరించండి",
    "వ్యవసాయ మద్దతు గురించి చెప్పండి",
    "ఉద్యోగ సంబంధిత పథకాలను కనుగొనండి",
  ],
  kn: [
    "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿವೆ?",
    "ಈ ಸರ್ಕಾರಿ ಅಧಿಸೂಚನೆಯನ್ನು ವಿವರಿಸಿ",
    "ಕೃಷಿ ಬೆಂಬಲದ ಬಗ್ಗೆ ಹೇಳಿ",
    "ಉದ್ಯೋಗ ಸಂಬಂಧಿತ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
  ],
};

interface ChatWindowProps {
  language: Language;
  externalQuery?: { text: string; nonce: number } | null;
  onSourcesChange?: (sources: SourceRef[]) => void;
  onFollowupsChange?: (followups: string[]) => void;
}

export default function ChatWindow({ language, externalQuery, onSourcesChange, onFollowupsChange }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [errorText, setErrorText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastFailedQuery = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, assistantState]);

  useEffect(() => {
    if (externalQuery && externalQuery.text) {
      sendMessage(externalQuery.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalQuery?.nonce]);

  async function sendMessage(text: string, viaVoice = false) {
    const query = text.trim();
    if (!query) return;

    setErrorText("");
    const userMessage: ChatMessage = { id: uuidLike(), role: "user", content: query, language };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAssistantState("understanding");

    try {
      setAssistantState("searching");
      let result;
      try {
        result = viaVoice
          ? await sendVoiceTranscript(query, language, conversationId)
          : await sendChat(query, language, conversationId);
      } catch (networkErr) {
        console.warn("[ChatWindow] Network unavailable, using built-in knowledge engine:", networkErr);
        result = generateKnowledgeResponse(query, language, conversationId);
      }

      setAssistantState("generating");
      setConversationId(result.conversation_id);
      const assistantMessage: ChatMessage = {
        id: result.message_id || uuidLike(),
        role: "assistant",
        content: result.answer?.summary || "Here is the verified information.",
        language: result.language || language,
        structured: result.answer,
        sources: result.sources || [],
        followups: result.suggested_followups || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      onSourcesChange?.(result.sources || []);
      onFollowupsChange?.(result.suggested_followups || []);

      setAssistantState("speaking");
      speak(result.answer?.summary || "", result.language || language, () => setAssistantState("idle"));
      lastFailedQuery.current = null;
    } catch (e: any) {
      console.warn("[ChatWindow] Fallback recovery:", e);
      // Emergency zero-failure fallback: always show the grounded answer
      try {
        const fallback = generateKnowledgeResponse(query, language, conversationId);
        const fallbackMessage: ChatMessage = {
          id: uuidLike(),
          role: "assistant",
          content: fallback.answer.summary,
          language: fallback.language,
          structured: fallback.answer,
          sources: fallback.sources,
          followups: fallback.suggested_followups,
        };
        setMessages((prev) => [...prev, fallbackMessage]);
        onSourcesChange?.(fallback.sources);
        onFollowupsChange?.(fallback.suggested_followups);
      } catch {}
      setAssistantState("idle");
      lastFailedQuery.current = null;
    }
  }

  function handleVoiceStart() {
    if (!isSpeechRecognitionSupported()) {
      setAssistantState("error");
      setErrorText("Voice input is not supported in this browser. Please try Chrome, or type your question instead.");
      return;
    }
    setIsListening(true);
    setAssistantState("listening");
    startListening(
      language,
      (transcript) => {
        setIsListening(false);
        sendMessage(transcript, true);
      },
      (message) => {
        setIsListening(false);
        setAssistantState("error");
        setErrorText(message);
      },
      () => setIsListening(false)
    );
  }

  function handleVoiceStop() {
    setIsListening(false);
    setAssistantState("idle");
  }

  function handleReadAloud(text: string, msgLanguage?: Language) {
    setAssistantState("speaking");
    speak(text, msgLanguage || language, () => setAssistantState("idle"));
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-1 py-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-10">
            <AIOrb state={assistantState} size="md" />
            <div>
              <h2 className="font-display text-xl font-semibold mb-1">How can I help you today?</h2>
              <p className="text-sm text-mist">Ask about scholarships, schemes, documents, or eligibility.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2 max-w-lg">
              {SUGGESTED_QUESTIONS[language].map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm glass rounded-xl px-4 py-2.5 border border-white/10 hover:border-saffron/40 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`w-full flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <MessageBubble message={m} />
            {m.role === "assistant" && (
              <div className="flex gap-1.5 sm:gap-2 mt-2 flex-wrap pl-1 sm:pl-11 max-w-full">
                <button
                  onClick={() => handleReadAloud(m.content, m.language)}
                  className="text-xs text-mist hover:text-bone hover:bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:border-saffron/30 transition-all duration-200"
                >
                  🔊 Read Aloud
                </button>
                {(m.followups || []).map((f) => (
                  <button
                    key={f}
                    onClick={() => sendMessage(f)}
                    className="text-xs text-mist hover:text-bone hover:bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 hover:border-amethyst/30 transition-all duration-200"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {(assistantState === "understanding" || assistantState === "searching" || assistantState === "generating") && (
          <ThinkingAnimation state={assistantState} />
        )}

        {assistantState === "error" && errorText && (
          <div className="w-full flex justify-start pl-1 sm:pl-11 my-2">
            <div className="glass-strong rounded-2xl px-4 py-3 border border-red-400/30 text-xs sm:text-sm text-red-200 w-fit max-w-[95%] sm:max-w-[85%] shadow-lg">
              {errorText}
              {lastFailedQuery.current && (
                <button
                  onClick={() => sendMessage(lastFailedQuery.current as string)}
                  className="ml-3 underline text-red-100 font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-3 sm:pt-4 mt-1 sm:mt-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <VoiceButton isListening={isListening} onStart={handleVoiceStart} onStop={handleVoiceStop} />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask in your language…"
            className="flex-1 bg-panel2 border border-white/10 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-saffron/50 placeholder:text-mist/70"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="rounded-full bg-gradient-to-r from-saffron to-gulal px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold disabled:opacity-30 hover:brightness-110 active:scale-95 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
