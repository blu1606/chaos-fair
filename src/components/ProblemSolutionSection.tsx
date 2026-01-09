import { motion } from 'framer-motion';
import { Lock, Waves, AlertTriangle, Check } from 'lucide-react';

const problemPoints = [
  { icon: AlertTriangle, text: '**Deterministic**: Hackers can predict outcomes with enough data' },
  { icon: AlertTriangle, text: '**Centralized**: Trust one entity—they can manipulate results' },
  { icon: AlertTriangle, text: '**Unverifiable**: Users have no proof of fairness' },
  { icon: AlertTriangle, text: '**Expensive**: Third-party services charge premium rates' },
];

const solutionPoints = [
  { icon: Check, text: '**Physical**: Randomness from real-world acoustic noise' },
  { icon: Check, text: '**Decentralized**: Anyone with a mic can contribute entropy' },
  { icon: Check, text: '**Verifiable**: All randomness on Solana blockchain, cryptographically proven' },
  { icon: Check, text: '**Affordable**: Direct integration, no middleman premium' },
];

const comparisonItems = [
  {
    label: 'Trust Model',
    centralized: 'Single provider',
    dekaos: 'Open network of nodes',
  },
  {
    label: 'Entropy Source',
    centralized: 'Algorithmic PRNG',
    dekaos: 'Physical acoustic noise',
  },
  {
    label: 'Verification',
    centralized: 'Opaque logs',
    dekaos: 'On-chain, cryptographic proofs',
  },
];

const renderBoldText = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
  );
};

const ProblemSolutionSection = () => {
  return (
    <section className="relative py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 relative">
          {/* Vertical divider (desktop only) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50" />

          {/* Problem Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:pr-16"
          >
            {/* Problem Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-red-950/50 border border-red-600/30 flex items-center justify-center">
                  <Lock className="w-12 h-12 sm:w-14 sm:h-14 text-red-500" />
                </div>
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-center lg:text-left mb-3">
              Predictable Machines Can't Be Fair
            </h2>
            <p className="text-muted-foreground text-lg text-center lg:text-left mb-8">
              Centralized randomness is...
            </p>

            <ul className="space-y-4" role="list">
              {problemPoints.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-red-400"
                >
                  <point.icon className="w-5 h-5 text-red-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-base sm:text-lg">{renderBoldText(point.text)}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Solution Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:pl-16"
          >
            {/* Solution Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-green-600/20 blur-2xl rounded-full" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-green-950/50 border border-green-600/30 flex items-center justify-center">
                  <Waves className="w-12 h-12 sm:w-14 sm:h-14 text-green-500" />
                </div>
              </div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-center lg:text-left mb-3">
              Physical Entropy is Unbiasable
            </h2>
            <p className="text-muted-foreground text-lg text-center lg:text-left mb-8">
              deKAOS brings...
            </p>

            <ul className="space-y-4" role="list">
              {solutionPoints.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 text-green-400"
                >
                  <point.icon className="w-5 h-5 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-base sm:text-lg">{renderBoldText(point.text)}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Comparison Snapshot Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 p-6 sm:p-8 rounded-2xl border border-slate-700/50 bg-[#0b1220]"
        >
          <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">
            TL;DR Comparison
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {comparisonItems.map((item, i) => (
              <div key={i} className="text-center">
                {/* Label */}
                <p className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-3">
                  {item.label}
                </p>
                
                {/* Pills container */}
                <div className="flex flex-col gap-2">
                  {/* Centralized pill */}
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-mono bg-red-950/50 border border-red-500/30 text-red-400">
                    {item.centralized}
                  </span>
                  
                  {/* deKAOS pill */}
                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-mono bg-emerald-950/50 border border-emerald-500/30 text-emerald-400">
                    {item.dekaos}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolutionSection;
