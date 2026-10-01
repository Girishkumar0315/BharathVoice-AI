import { StructuredAnswer, SourceRef } from "@/lib/types";
import SourceCard from "./SourceCard";

interface SchemeCardProps {
  answer: StructuredAnswer;
  sources: SourceRef[];
}

export default function SchemeCard({ answer, sources }: SchemeCardProps) {
  if (!answer.grounded) {
    return (
      <div className="glass rounded-2xl p-6 border border-amethyst/30 shadow-glow3D animate-fade-in transition-all">
        <p className="text-sm leading-relaxed text-bone">{answer.summary}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn">
      <div className="glass-strong rounded-2xl overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl transition-all duration-300 hover:border-saffron/40 hover:shadow-glow3D relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {answer.scheme_name && (
          <div className="px-6 py-5 bg-gradient-to-r from-saffron/20 via-gulal/15 to-amethyst/20 border-b border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[bg-shift_3s_linear_infinite]" />
            <div className="relative z-10">
              <div className="text-[11px] font-bold uppercase tracking-widest text-mist mb-1 drop-shadow-sm">AI Answer</div>
              <h3 className="font-display font-bold text-xl text-bone drop-shadow-md">{answer.scheme_name}</h3>
            </div>
          </div>
        )}

        <div className="p-6 space-y-6 text-sm relative z-10">
          <p className="text-bone/95 leading-relaxed text-base">{answer.summary}</p>

          {answer.eligibility.length > 0 && (
            <Section title="Who can apply?">
              <ul className="space-y-2">
                {answer.eligibility.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2 rounded-lg border border-white/5 hover:border-saffron/30 transition-colors">
                    <span className="text-saffron font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {answer.benefits.length > 0 && (
            <Section title="Benefits">
              <ul className="space-y-2">
                {answer.benefits.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2 rounded-lg border border-white/5 hover:border-gulal/30 transition-colors">
                    <span className="text-gulal font-bold text-lg leading-none mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {answer.documents_required.length > 0 && (
            <Section title="Required Documents">
              <ul className="grid sm:grid-cols-2 gap-2">
                {answer.documents_required.map((item, i) => (
                  <li key={i} className="flex gap-2 text-mist/90 text-sm bg-black/20 p-2.5 rounded-lg border border-white/5 hover:border-amethyst/30 transition-colors">
                    <span className="text-amethyst font-bold text-lg leading-none">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {answer.application_steps.length > 0 && (
            <Section title="How to Apply">
              <ol className="space-y-2">
                {answer.application_steps.map((item, i) => (
                  <li key={i} className="flex gap-3 text-mist/90 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <span className="text-bone/80 font-bold bg-white/10 w-6 h-6 rounded-full flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="mt-0.5">{item}</span>
                  </li>
                ))}
              </ol>
            </Section>
          )}
        </div>

        {sources.length > 0 && (
          <div className="px-6 pb-6 grid gap-3 relative z-10">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />
            {sources.map((s) => (
              <SourceCard key={s.doc_id} source={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'both' }}>
      <div className="text-xs font-bold uppercase tracking-wider text-bone/60 mb-3 flex items-center gap-2">
        {title}
        <div className="flex-1 h-px bg-white/10" />
      </div>
      {children}
    </div>
  );
}
