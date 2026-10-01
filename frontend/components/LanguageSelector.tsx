"use client";

import { Language } from "@/lib/types";

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

interface LanguageSelectorProps {
  value: Language;
  onChange: (lang: Language) => void;
  compact?: boolean;
}

export default function LanguageSelector({ value, onChange, compact }: LanguageSelectorProps) {
  return (
    <div className={`flex ${compact ? "gap-2" : "gap-3"} flex-wrap`}>
      {LANGUAGES.map((l) => {
        const isActive = value === l.code;
        return (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`relative overflow-hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-gradient-to-r from-saffron/30 to-gulal/30 text-bone border-saffron shadow-glow"
                : "bg-white/5 border-white/10 text-mist hover:border-white/30 hover:bg-white/10 hover:text-bone hover:-translate-y-0.5 hover:shadow-lg"
            } border backdrop-blur-md`}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-full shadow-[inset_0_0_12px_rgba(255,153,51,0.4)] pointer-events-none" />
            )}
            <span className="relative z-10">{l.native}</span>
          </button>
        );
      })}
    </div>
  );
}
