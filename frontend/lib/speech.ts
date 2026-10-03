"use client";

import { Language } from "./types";

// BCP-47 locale codes used by the Web Speech recognition API.
export const SPEECH_LOCALES: Record<Language, string> = {
  en: "en-IN",
  hi: "hi-IN",
  te: "te-IN",
  kn: "kn-IN",
};

let currentAudio: HTMLAudioElement | null = null;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/**
 * Plays the signature Google Assistant chime using the Web Audio API.
 * type 'start': high ascending two-tone beep when listening begins
 * type 'end': descending confirmation tone when listening concludes
 */
export function playAssistantChime(type: "start" | "end" = "start") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === "start") {
      // Iconic Google Assistant double-tone ping
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.09);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, now + 0.09); // A5
      gain2.gain.setValueAtTime(0.1, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.23);
    } else {
      // Soft Google Assistant completion chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(783.99, now); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.14); // C5
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.17);
    }
  } catch (err) {
    // Autoplay policy or unsupported audio context
  }
}

/**
 * Cleans markdown and formatting artifacts before synthesis.
 */
function cleanTextForSpeech(text: string, language: Language): string {
  let cleaned = text
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[*_#`~>]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[•\-\–\[\]\(\)\{\}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (language === "te") {
    cleaned = cleaned.replace(/రూ\.\s*/g, "రూపాయలు ").replace(/రూ\s+/g, "రూపాయలు ");
  } else if (language === "hi") {
    cleaned = cleaned.replace(/रु\.\s*/g, "रुपये ").replace(/रु\s+/g, "रुपये ");
  } else if (language === "kn") {
    cleaned = cleaned.replace(/ರೂ\.\s*/g, "ರೂಪಾಯಿ ");
  } else if (language === "en") {
    cleaned = cleaned.replace(/Rs\.\s*/gi, "Rupees ").replace(/Rs\s+/gi, "Rupees ");
    cleaned = cleaned.replace(/Govt\.\s*/gi, "Government ");
  }

  return cleaned;
}

/**
 * Scores a browser voice for quality as a fallback.
 */
function scoreVoice(v: SpeechSynthesisVoice, language: Language): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase().replace("_", "-");
  const targetLocale = (SPEECH_LOCALES[language] || "en-IN").toLowerCase().replace("_", "-");
  const langPrefix = language.toLowerCase();

  if (!lang.startsWith(langPrefix) && !(language === "en" && lang.startsWith("en"))) return -1;

  let score = 0;
  if (lang === targetLocale) score += 60;
  else if (lang.startsWith(langPrefix)) score += 35;

  if (name.includes("google")) score += 120;
  if (name.includes("natural") || name.includes("online")) score += 95;
  if (name.includes("female") || name.includes("heera") || name.includes("neerja") || name.includes("swara")) score += 20;

  if (language === "te" && (name.includes("telugu") || name.includes("mohan") || name.includes("shruti"))) score += 30;
  if (language === "hi" && (name.includes("hindi") || name.includes("swara") || name.includes("madhur"))) score += 30;
  if (language === "kn" && (name.includes("kannada") || name.includes("gagan") || name.includes("sapna"))) score += 30;
  if (language === "en" && (name.includes("india") || name.includes("neerja") || name.includes("ravi"))) score += 30;

  return score;
}

function getMatchingVoice(language: Language): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -1;

  for (const v of voices) {
    const s = scoreVoice(v, language);
    if (s > bestScore) {
      bestScore = s;
      bestVoice = v;
    }
  }

  return bestVoice;
}

/**
 * Starts browser-native speech recognition (Web Speech API).
 */
export function startListening(
  language: Language,
  onResult: (transcript: string) => void,
  onError: (message: string) => void,
  onEnd?: () => void
) {
  const SpeechRecognitionCtor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) {
    onError("Voice input is not supported in this browser. Please try Google Chrome or Microsoft Edge.");
    return null;
  }

  const recognition = new SpeechRecognitionCtor();
  recognition.lang = SPEECH_LOCALES[language] || "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        playAssistantChime("end");
        onResult(transcript.trim());
      }
    }
  };

  recognition.onerror = (event: any) => {
    if (event.error === "no-speech") {
      onEnd?.();
      return;
    }
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      onError("Microphone permission was denied. Please allow microphone access in your browser address bar.");
      return;
    }
    if (event.error === "network") {
      onError("Voice network error. Please check your internet connection.");
      return;
    }
    onError(`Voice input notice: ${event.error}. Please try again or type.`);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  try {
    playAssistantChime("start");
    recognition.start();
  } catch (err: any) {
    onError("Could not start microphone. Please ensure permissions are granted.");
    return null;
  }

  return recognition;
}

/**
 * Speaks text aloud using high-definition Neural TTS from backend (/api/voice/tts).
 * Delivers authentic, 100% fluent native regional accents for Telugu, Hindi, Kannada, and English.
 * Falls back seamlessly to browser SpeechSynthesis if offline.
 */
export async function speak(text: string, language: Language, onEnd?: () => void) {
  if (!text || !text.trim()) {
    onEnd?.();
    return;
  }

  stopSpeaking();
  const cleanedText = cleanTextForSpeech(text, language);

  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const customBackend = process.env.NEXT_PUBLIC_API_URL;

  // 1. Try high-definition Neural TTS from backend API if available and safe from mixed-content
  if (customBackend || !isHttps) {
    try {
      const backendUrl = customBackend || "http://localhost:8000";
      const audioUrl = `${backendUrl}/api/voice/tts?text=${encodeURIComponent(cleanedText)}&language=${language}`;

      const audio = new Audio(audioUrl);
      currentAudio = audio;

      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        currentAudio = null;
        // Fallback to browser synthesis
        fallbackBrowserSpeak(cleanedText, language, onEnd);
      };

      await audio.play();
      return;
    } catch (err) {
      console.warn("[TTS] Backend streaming notice, using browser fallback:", err);
    }
  }

  // 2. Fallback to browser SpeechSynthesis
  fallbackBrowserSpeak(cleanedText, language, onEnd);
}

function fallbackBrowserSpeak(cleanedText: string, language: Language, onEnd?: () => void) {
  if (!isSpeechSynthesisSupported()) {
    onEnd?.();
    return;
  }

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      onEnd?.();
    }
  };

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = SPEECH_LOCALES[language] || "en-IN";
    utterance.volume = 1.0;

    if (language === "te") {
      utterance.rate = 0.94;
      utterance.pitch = 1.02;
    } else if (language === "hi") {
      utterance.rate = 0.95;
      utterance.pitch = 1.03;
    } else if (language === "kn") {
      utterance.rate = 0.94;
      utterance.pitch = 1.02;
    } else {
      utterance.rate = 0.98;
      utterance.pitch = 1.04;
    }

    const voice = getMatchingVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = finish;
    utterance.onerror = finish;

    // Safety timeout in case speech engine hangs or drops event
    const estimatedDuration = Math.max(4000, Math.min(25000, cleanedText.length * 90));
    setTimeout(finish, estimatedDuration);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    finish();
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {}
    currentAudio = null;
  }
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}
