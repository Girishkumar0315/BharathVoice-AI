"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import BrandLogo from "@/components/BrandLogo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/lib/useLanguage";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 glass backdrop-blur-2xl border-b border-white/10 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
        
        {/* TOP LEFT CORNER: Brand Logo & Tagline */}
        <Link href="/" className="block active:scale-[0.98] transition-transform shrink-0">
          <BrandLogo size="md" />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-mist">
          {!isLoggedIn ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 text-[11px] text-bone/90">
              <span className="w-2 h-2 rounded-full bg-cyber animate-pulse" />
              <span>{t.navLanguagePrompt}</span>
            </div>
          ) : (
            <>
              <Link href="/services" className="text-saffron hover:text-saffron-light transition-colors py-1 flex items-center gap-1.5 font-bold">
                <span>🏛️ {t.navServices}</span>
              </Link>
              <Link href="/dashboard" className="hover:text-bone transition-colors py-1">
                {t.navDashboard}
              </Link>
              <Link href="/assistant" className="hover:text-bone transition-colors py-1">
                {t.navAssistant}
              </Link>
              <Link href="/profile" className="hover:text-bone transition-colors py-1">
                {t.navProfile}
              </Link>
            </>
          )}
        </nav>

        {/* TOP RIGHT: Global Language Selector + Home + Sign In/Out */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Universal Language Selector embedded in Navbar */}
          <div className="glass px-1 py-0.5 rounded-full border border-white/10 shadow-inner-light scale-90 sm:scale-100 origin-right">
            <LanguageSelector value={language} onChange={setLanguage} compact />
          </div>

          {isLoggedIn ? (
            <>
              {/* Home Button */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/50 hover:bg-white/5 active:scale-95 transition-all shadow-sm"
              >
                <span>🏠</span>
                <span>{t.navHome}</span>
              </Link>

              {/* User Avatar Badge */}
              {user && (
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-full border border-white/10 hover:border-saffron/40 active:scale-95 transition-all"
                  title="My Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-saffron/30 text-saffron flex items-center justify-center text-[10px] font-bold">
                    {user.name?.charAt(0) || "C"}
                  </div>
                  <span className="text-xs font-medium text-bone max-w-[90px] truncate">
                    {user.name}
                  </span>
                </Link>
              )}

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/10 hover:border-red-500/40 active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">{t.navSignOut}</span>
              </button>
            </>
          ) : (
            <>
              {/* Guest State: Home Button + Sign In Button */}
              <Link
                href="/"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full glass border border-white/15 text-xs font-semibold text-bone hover:border-saffron/50 hover:bg-white/5 active:scale-95 transition-all"
              >
                <span>🏠</span>
                <span>{t.navHome}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    if (window.location.pathname === "/") {
                      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: "login" }));
                    } else {
                      window.location.href = "/login";
                    }
                  }
                }}
                className="text-xs font-semibold text-white bg-gradient-to-r from-saffron to-gulal px-4 py-1.5 rounded-full shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{t.navSignIn}</span>
                <span>→</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-saffron/30 to-transparent opacity-70" />
    </header>
  );
}
