import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="mt-20 relative">
      <div className="bg-gradient-to-r from-saffron via-gulal to-amethyst h-px w-full opacity-60 shadow-glow" />
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-mist">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showText={false} />
          <span className="font-medium">BharathVoice AI — Voice-First Multilingual Citizen Intelligence Platform</span>
        </div>
        <div className="flex gap-4">
          {["English", "हिन्दी", "తెలుగు", "ಕನ್ನಡ"].map(lang => (
            <span key={lang} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-saffron/50 hover:shadow-glow transition-all animate-breathe cursor-pointer">
              {lang}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
