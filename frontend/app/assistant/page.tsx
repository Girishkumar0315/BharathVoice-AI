"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";
import LanguageSelector from "@/components/LanguageSelector";
import SourceCard from "@/components/SourceCard";
import DocumentUploader from "@/components/DocumentUploader";
import EligibilityFlow from "@/components/EligibilityFlow";
import BrandLogo from "@/components/BrandLogo";
import { Language, SourceRef } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const LANGUAGE_ONBOARDING_KEY = "bharathvoice_onboarded";

function AssistantContent() {
  const { logout } = useAuth();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>("en");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [sources, setSources] = useState<SourceRef[]>([]);
  const [followups, setFollowups] = useState<string[]>([]);
  const [rightTab, setRightTab] = useState<"sources" | "documents" | "guide">("sources");
  const [externalQuery, setExternalQuery] = useState<{ text: string; nonce: number } | null>(null);

  useEffect(() => {
    const onboarded = localStorage.getItem(LANGUAGE_ONBOARDING_KEY);
    if (!onboarded) setShowOnboarding(true);

    const lang = searchParams.get("lang") as Language;
    if (lang && ["en", "hi", "te", "kn"].includes(lang)) {
      setLanguage(lang);
      setShowOnboarding(false);
    }

    const category = searchParams.get("category");
    if (category) {
      setExternalQuery({ text: `Tell me about ${category.replace("_", " ")} related services.`, nonce: Date.now() });
    }
  }, [searchParams]);

  function completeOnboarding(lang: Language) {
    setLanguage(lang);
    localStorage.setItem(LANGUAGE_ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-transparent text-bone">
      {/* Subtle gradient mesh background behind main content area */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-amethyst/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-saffron/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        <Sidebar />
      </div>

      <div className="flex-1 grid lg:grid-cols-[1fr_320px] min-h-screen relative z-10">
        <main className="px-6 py-6 flex flex-col min-h-screen relative">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="md:hidden block">
                <BrandLogo size="sm" showText={false} />
              </Link>
              <h1 className="font-display text-2xl font-bold bg-gradient-to-r from-bone to-mist bg-clip-text text-transparent drop-shadow-sm">
                BharathVoice Assistant
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="glass px-2 py-1 rounded-full border border-white/10 shadow-inner-light">
                <LanguageSelector value={language} onChange={setLanguage} compact />
              </div>
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all duration-300 shadow-sm"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Home</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 glass-strong rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-5 min-h-[70vh] relative overflow-hidden group">
            {/* Neon border hint on hover */}
            <div className="absolute inset-0 rounded-[2rem] border border-transparent group-hover:border-saffron/20 transition-colors duration-700 pointer-events-none"></div>
            
            <ChatWindow
              language={language}
              externalQuery={externalQuery}
              onSourcesChange={setSources}
              onFollowupsChange={setFollowups}
            />
          </div>
        </main>

        <aside className="hidden lg:flex flex-col gap-5 border-l border-white/5 px-5 py-6 bg-void/40 backdrop-blur-md">
          <div className="flex gap-2 p-1 glass rounded-xl border border-white/5">
            {(["sources", "documents", "guide"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightTab(tab)}
                className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium capitalize transition-all duration-300 ${
                  rightTab === tab 
                    ? "bg-saffron/15 text-saffron border border-saffron/30 shadow-[0_0_15px_rgba(255,153,51,0.15)]" 
                    : "border border-transparent text-mist hover:text-bone hover:bg-white/5"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {rightTab === "sources" && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-display font-semibold text-sm text-mist flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-amethyst"></span>
                  Source References
                </h3>
                {sources.length === 0 ? (
                  <div className="glass p-4 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-2 min-h-[120px]">
                    <span className="text-2xl opacity-50">📚</span>
                    <p className="text-sm text-mist/60">Ask a question to see the trusted sources behind the answer here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sources.map((s) => <SourceCard key={s.doc_id} source={s} />)}
                  </div>
                )}
                
                {followups.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-white/5">
                    <h3 className="font-display font-semibold text-sm text-mist mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 rounded-full bg-saffron"></span>
                      Suggested Follow-ups
                    </h3>
                    <div className="flex flex-col gap-2">
                      {followups.map((f) => (
                        <button
                          key={f}
                          onClick={() => setExternalQuery({ text: f, nonce: Date.now() })}
                          className="text-left text-xs glass-strong rounded-xl px-4 py-3 border border-white/10 hover:border-saffron/40 hover:shadow-[0_0_15px_rgba(255,153,51,0.1)] transition-all group"
                        >
                          <span className="text-mist group-hover:text-bone transition-colors">{f}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {rightTab === "documents" && (
              <div className="animate-fade-in">
                <DocumentUploader />
              </div>
            )}

            {rightTab === "guide" && (
              <div className="animate-fade-in">
                <EligibilityFlow onComplete={(query) => setExternalQuery({ text: query, nonce: Date.now() })} />
              </div>
            )}
          </div>
        </aside>
      </div>

      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-void/80 backdrop-blur-xl flex items-center justify-center px-6 transition-all duration-500">
          <div className="glass-neon rounded-3xl p-8 max-w-md w-full text-center border border-saffron/30 shadow-[0_0_50px_rgba(255,153,51,0.15)] animate-scaleIn">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst animate-spinSlow opacity-70 blur-md"></div>
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-saffron via-gulal to-amethyst border-2 border-void flex items-center justify-center shadow-glow">
                <span className="text-xl text-void font-bold">🗣️</span>
              </div>
            </div>
            
            <h2 className="font-display text-2xl font-bold mb-3 text-bone">Choose your language</h2>
            <p className="text-sm text-mist/90 mb-8 font-medium">BharathVoice will speak, listen and respond in your language.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {(["en", "hi", "te", "kn"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => completeOnboarding(lang)}
                  className="glass-strong rounded-2xl py-3.5 px-3 text-sm font-semibold border border-white/10 hover:border-saffron hover:bg-saffron/10 hover:shadow-[0_0_20px_rgba(255,153,51,0.2)] transition-all duration-300 transform hover:-translate-y-1"
                >
                  {{ en: "English", hi: "हिन्दी", te: "తెలుగు", kn: "ಕನ್ನಡ" }[lang]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void text-bone flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-saffron border-t-transparent animate-spin"></div>
            <p className="text-sm font-medium text-mist">Loading BharathVoice Assistant...</p>
          </div>
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  );
}
