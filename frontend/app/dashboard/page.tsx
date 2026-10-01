"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BrandLogo from "@/components/BrandLogo";
import { fetchConversations } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    fetchConversations().then(setConversations).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-transparent relative overflow-hidden text-bone">
      <div className="relative z-10">
        <Sidebar />
      </div>
      
      <main className="flex-1 px-6 sm:px-10 py-6 max-w-5xl mx-auto relative z-10 min-h-screen overflow-y-auto">
        
        {/* Top Header Bar: Logo on mobile & Home + Sign Out on top right */}
        <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden block">
              <BrandLogo size="sm" showText={false} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-bone">Citizen Dashboard</h1>
              <p className="text-mist text-xs">Overview &amp; voice-first intelligence hub</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/40 hover:bg-white/5 active:scale-95 transition-all duration-300 shadow-sm"
            >
              <span>🏠</span>
              <span>Home</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Quick Action Cards (Focused Citizen Hub) */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          <Link
            href="/assistant"
            className="glass-strong rounded-2xl p-6 border border-white/8 hover:border-saffron/40 transition-all duration-500 group active:scale-[0.97] hover:shadow-masterpiece hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-saffron/15 via-gulal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-saffron/15 text-saffron flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow">
                🎙️
              </div>
              <h3 className="font-display font-bold text-base text-bone mb-1">Live Voice Assistant</h3>
              <p className="text-xs text-mist/80 leading-relaxed mb-4">
                Ask anything in Telugu, Hindi, Kannada, or English. Sub-second vocal replies verified against government records.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-saffron group-hover:translate-x-1 transition-transform">
                <span>Start Talking</span>
                <span>→</span>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="glass-strong rounded-2xl p-6 border border-white/8 hover:border-amethyst/40 transition-all duration-500 group active:scale-[0.97] hover:shadow-masterpiece hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amethyst/15 via-neon/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-amethyst/15 text-amethyst flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glowPurple">
                👤
              </div>
              <h3 className="font-display font-bold text-base text-bone mb-1">Citizen Profile &amp; Preferences</h3>
              <p className="text-xs text-mist/80 leading-relaxed mb-4">
                Manage your preferred language, verified citizen credentials, and saved service records.
              </p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amethyst group-hover:translate-x-1 transition-transform">
                <span>Manage Profile</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Conversations */}
        <div className="glass-strong rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-sm text-mist tracking-wide uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amethyst" />
              Recent Conversations
            </h2>
            {conversations.length > 0 && (
              <span className="text-xs text-mist/70">{conversations.length} sessions</span>
            )}
          </div>
          
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 glass rounded-2xl border border-white/5 border-dashed">
              <span className="text-3xl mb-3 opacity-40">💬</span>
              <p className="text-sm text-mist/70 mb-4">No conversations yet. Speak or type a question to start.</p>
              <Link
                href="/assistant"
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-saffron to-gulal text-white text-xs font-bold shadow-glow hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Launch Voice Assistant →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  href="/assistant"
                  className="flex items-center justify-between text-sm px-4 py-3 rounded-xl hover:bg-white/6 border border-transparent hover:border-white/8 transition-all duration-300 active:scale-[0.98] group cursor-pointer"
                >
                  <span className="font-medium text-bone/90 truncate mr-4 group-hover:text-saffron transition-colors">{c.title}</span>
                  <span className="glass px-2.5 py-1 rounded-lg text-mist/70 text-[11px] whitespace-nowrap border border-white/5">{c.message_count} msgs</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
