"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AIOrb from "./AIOrb";
import Interactive3DScene from "./Interactive3DScene";
import { AssistantState } from "@/lib/types";
import { speak, stopSpeaking, startListening, playAssistantChime } from "@/lib/speech";

export default function HeroSection() {
  const [orbState, setOrbState] = useState<AssistantState>("idle");
  const [typedText, setTypedText] = useState("");
  const [viewMode, setViewMode] = useState<"orb" | "globe">("orb");
  const [statusMessage, setStatusMessage] = useState("");
  const fullText = "AI that speaks Bharat's languages.";

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50);
    return () => clearInterval(typingInterval);
  }, [fullText]);

  const handleStateClick = (state: AssistantState) => {
    stopSpeaking();
    setOrbState(state);

    if (state === "idle") {
      setStatusMessage("Assistant is standing by.");
    } else if (state === "listening") {
      setStatusMessage("Listening... Speak into your microphone now.");
      playAssistantChime("start");
      startListening(
        "te",
        (transcript) => {
          setStatusMessage(`Heard: "${transcript}"`);
          setOrbState("understanding");
          setTimeout(() => {
            setOrbState("speaking");
            speak(`మీరు అడిగారు: ${transcript}. ప్రభుత్వ పథకాల వివరాలు అందిస్తున్నాను.`, "te", () => {
              setOrbState("idle");
              setStatusMessage("");
            });
          }, 600);
        },
        (err) => {
          setStatusMessage("Microphone closed or silence detected.");
          setOrbState("idle");
        },
        () => {
          setOrbState("idle");
        }
      );
    } else if (state === "understanding") {
      setStatusMessage("Analyzing citizen context and query intent...");
      speak("నేను మీ అర్హతలు మరియు ప్రభుత్వ మార్గదర్శకాలను విశ్లేషిస్తున్నాను.", "te", () => {
        setOrbState("idle");
        setStatusMessage("");
      });
    } else if (state === "generating") {
      setStatusMessage("Synthesizing verified RAG knowledge base data...");
      speak("జ్ఞాన బాండాగారం నుండి అధికారిక సమాచారాన్ని సంగ్రహిస్తున్నాను.", "te", () => {
        setOrbState("idle");
        setStatusMessage("");
      });
    } else if (state === "speaking") {
      setStatusMessage("Streaming high-definition Neural voice response...");
      speak(
        "నమస్కారం! భారతవాయిస్ AI ద్వారా మీరు విద్యార్థుల స్కాలర్‌షిప్‌లు, రైతు పథకాలు మరియు సంక్షేమ సేవలను మీ మాతృభాషలోనే సులభంగా తెలుసుకోవచ్చు.",
        "te",
        () => {
          setOrbState("idle");
          setStatusMessage("");
        }
      );
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void text-white font-sans pt-20">
      {/* Interactive 3D Ambient Canvas in Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-35">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-saffron/20 blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[30%] -right-[10%] w-[45%] h-[45%] rounded-full bg-amethyst/20 blur-[130px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-gulal/15 blur-[160px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      {/* Floating 3D Star Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-40 animate-particleFloat"
            style={{
              width: (i % 3) + 2 + "px",
              height: (i % 3) + 2 + "px",
              left: ((i * 17) % 100) + "%",
              top: ((i * 23) % 100) + "%",
              animationDuration: 4 + (i % 5) + "s",
              animationDelay: (i % 4) * 0.5 + "s",
              boxShadow: "0 0 8px 1px rgba(0, 212, 255, 0.4)",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4 lg:px-8 py-16 flex flex-col items-center text-center">
        
        {/* Track Badge */}
        <div className="mb-8 inline-flex items-center justify-center px-6 py-2.5 rounded-full glass border border-saffron/30 shadow-[0_0_25px_rgba(255,122,61,0.2)] backdrop-blur-md relative overflow-hidden group cursor-default">
          <div className="absolute inset-0 bg-gradient-to-r from-saffron/20 via-gulal/20 to-amethyst/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <span className="relative z-10 text-xs md:text-sm font-semibold tracking-wide text-bone uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-saffron animate-ping" />
            Voice-First AI for Bharat in Indian Languages
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 drop-shadow-2xl">
          <span className="text-gradient">
            BharathVoice AI
          </span>
        </h1>

        {/* Typewriter Tagline */}
        <p className="text-xl md:text-2xl text-gray-300 mb-10 h-8 font-light flex items-center justify-center space-x-1">
          <span>{typedText}</span>
          <span className="w-0.5 h-6 bg-saffron animate-pulse" />
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-14">
          <Link 
            href="/assistant"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-saffron via-gulal to-amethyst text-white font-bold text-lg shadow-[0_0_35px_rgba(255,122,61,0.45)] hover:shadow-[0_0_50px_rgba(255,122,61,0.7)] hover:scale-105 transition-all duration-300 flex items-center gap-2"
          >
            <span>🎙️ Talk to BharathVoice</span>
            <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">Live</span>
          </Link>
          <Link 
            href="/about"
            className="px-8 py-4 rounded-full glass text-white font-semibold text-lg border border-white/20 hover:border-saffron/50 hover:bg-white/10 hover:scale-105 transition-all duration-300"
          >
            About Application
          </Link>
        </div>

        {/* Supported Languages (English, Hindi, Telugu, Kannada) */}
        <div className="flex flex-wrap justify-center gap-3 mb-14 max-w-2xl">
          {[
            { code: "en", name: "English" },
            { code: "hi", name: "हिन्दी" },
            { code: "te", name: "తెలుగు" },
            { code: "kn", name: "ಕನ್ನಡ" },
          ].map((lang) => (
            <Link 
              key={lang.code}
              href={`/assistant?lang=${lang.code}`}
              className="px-5 py-2.5 rounded-2xl glass-strong border border-white/10 text-sm text-bone font-medium hover:border-saffron hover:bg-saffron/15 hover:shadow-[0_0_20px_rgba(255,122,61,0.3)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-saffron font-bold text-xs">●</span>
              <span>{lang.name}</span>
            </Link>
          ))}
        </div>

        {/* Interactive 3D Showcase Container */}
        <div className="relative w-full max-w-3xl mx-auto mb-16 p-6 md:p-8 rounded-3xl glass-strong border border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-amethyst/10 pointer-events-none" />

          {/* Mode Switcher: 3D AI Voice Orb vs 3D Neural Globe */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4 border-b border-white/10 pb-4">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-bold text-bone flex items-center gap-2">
                <span>Experience Interactive Voice AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyber/20 text-cyber border border-cyber/30">
                  Neural Voice Engine
                </span>
              </h3>
              <p className="text-xs md:text-sm text-mist mt-1">
                Click any state button below to trigger real audio and live voice recognition
              </p>
            </div>

            <div className="flex items-center p-1 glass rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode("orb")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  viewMode === "orb"
                    ? "bg-gradient-to-r from-saffron to-gulal text-white shadow-glow"
                    : "text-mist hover:text-bone"
                }`}
              >
                🎙️ 3D Voice Orb
              </button>
              <button
                onClick={() => setViewMode("globe")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  viewMode === "globe"
                    ? "bg-gradient-to-r from-amethyst to-neon text-white shadow-glowNeon"
                    : "text-mist hover:text-bone"
                }`}
              >
                🌐 3D Neural Globe
              </button>
            </div>
          </div>

          {/* 3D Viewport */}
          <div className="relative flex flex-col items-center justify-center min-h-[340px]">
            {viewMode === "orb" ? (
              <div className="w-full flex flex-col items-center">
                <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
                  <AIOrb state={orbState} size="lg" />
                </div>

                {statusMessage && (
                  <div className="mb-4 text-xs font-medium text-cyber bg-void/60 px-4 py-1.5 rounded-full border border-cyber/30 animate-fadeIn">
                    {statusMessage}
                  </div>
                )}

                {/* State selector pills — now FULLY FUNCTIONAL */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {(["listening", "understanding", "generating", "speaking", "idle"] as AssistantState[]).map((state) => (
                    <button
                      key={state}
                      onClick={() => handleStateClick(state)}
                      className={`px-4 py-2 rounded-xl font-semibold text-xs tracking-wide transition-all duration-300 capitalize flex items-center gap-1.5 ${
                        orbState === state 
                          ? "bg-saffron text-white shadow-[0_0_20px_rgba(255,122,61,0.5)] scale-105" 
                          : "glass border border-white/15 text-mist hover:bg-white/15 hover:text-white"
                      }`}
                    >
                      {state === "listening" && "🎤 "}
                      {state === "understanding" && "🧠 "}
                      {state === "generating" && "⚡ "}
                      {state === "speaking" && "🔊 "}
                      {state === "idle" && "⏹️ "}
                      {state}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full h-[360px] rounded-2xl overflow-hidden glass border border-white/10 relative">
                <Interactive3DScene interactive={true} showLabels={true} />
              </div>
            )}

            {/* Live Regional Voice Test Buttons (Telugu, Hindi, Kannada, English) */}
            <div className="pt-6 border-t border-white/10 w-full">
              <div className="text-xs text-mist font-medium mb-3 flex items-center justify-center gap-2">
                <span>🔊 Hear fluent native regional pronunciation:</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => {
                    setOrbState("speaking");
                    speak("నమస్కారం! నేను భారతవాయిస్ AI ని. విద్యార్థుల స్కాలర్‌షిప్‌లు మరియు ప్రభుత్వ పథకాల గురించి నేను మీకు ఎలా సహాయపడగలను?", "te", () => setOrbState("idle"));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass border border-white/15 hover:border-saffron hover:bg-saffron/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>🔊</span>
                  <span>Telugu (తెలుగు)</span>
                </button>
                <button
                  onClick={() => {
                    setOrbState("speaking");
                    speak("नमस्ते! मैं भारतवॉयस AI हूँ। सरकारी योजनाओं और छात्रवृत्ति के बारे में मैं आपकी क्या सहायता कर सकता हूँ?", "hi", () => setOrbState("idle"));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass border border-white/15 hover:border-gulal hover:bg-gulal/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>🔊</span>
                  <span>Hindi (हिन्दी)</span>
                </button>
                <button
                  onClick={() => {
                    setOrbState("speaking");
                    speak("ನಮಸ್ಕಾರ! ನಾನು ಭಾರತವಾಯ್ಸ್ AI. ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಮತ್ತು ಸರ್ಕಾರದ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", "kn", () => setOrbState("idle"));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass border border-white/15 hover:border-amethyst hover:bg-amethyst/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>🔊</span>
                  <span>Kannada (ಕನ್ನಡ)</span>
                </button>
                <button
                  onClick={() => {
                    setOrbState("speaking");
                    speak("Namaste! Welcome to BharathVoice AI. How can I assist you with government scholarships, welfare schemes, and citizen services today?", "en", () => setOrbState("idle"));
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold glass border border-white/15 hover:border-neon hover:bg-neon/20 transition-all flex items-center gap-2 shadow-sm"
                >
                  <span>🔊</span>
                  <span>English (India)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto border-t border-white/10 pt-10">
          {[
            { label: "Supported Languages", value: "4 Languages" },
            { label: "Welfare Categories", value: "6+ Domains" },
            { label: "Voice Latency", value: "Real-time" },
            { label: "Grounding", value: "100% RAG Verified" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-bone via-saffron to-amethyst mb-1 group-hover:scale-105 transition-transform duration-300">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-mist uppercase tracking-widest text-center">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
