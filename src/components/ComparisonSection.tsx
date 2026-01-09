import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  centralized: string;
  defiRng: string;
  dekaos: string;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Decentralized',
    centralized: '❌',
    defiRng: '✅',
    dekaos: '✅✅',
  },
  {
    feature: 'Physical entropy',
    centralized: '❌',
    defiRng: '❌',
    dekaos: '✅',
  },
  {
    feature: 'On-chain proofs',
    centralized: '❌',
    defiRng: '✅',
    dekaos: '✅',
  },
  {
    feature: 'Trust required',
    centralized: '⚠️ High',
    defiRng: '⚠️ Medium',
    dekaos: '✅ Low',
  },
  {
    feature: 'API cost',
    centralized: '💰 High',
    defiRng: '💰💰 Very high',
    dekaos: '✅ Affordable',
  },
  {
    feature: 'Latency',
    centralized: '✅ Low',
    defiRng: '⚠️ Medium',
    dekaos: '✅ Low',
  },
  {
    feature: 'SLA / Uptime',
    centralized: '⚠️ Good',
    defiRng: '⚠️ Variable',
    dekaos: '✅ 99.97%',
  },
  {
    feature: 'Community support',
    centralized: '❌ Closed',
    defiRng: '⚠️ Mixed',
    dekaos: '✅ Active',
  },
];

const ComparisonSection = () => {
  return (
    <section id="comparison" className="relative py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">
            Why choose <span className="text-gradient-primary">deKAOS</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            How we compare to centralized RNG services and typical DeFi RNG.
          </p>
        </motion.div>

        {/* Desktop Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="hidden md:block overflow-hidden rounded-xl border border-slate-700/50"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900">
                <th className="text-left p-4 font-display text-sm text-muted-foreground font-medium">
                  Feature
                </th>
                <th className="text-center p-4 font-display text-sm text-muted-foreground font-medium">
                  Centralized RNG
                </th>
                <th className="text-center p-4 font-display text-sm text-muted-foreground font-medium">
                  Typical DeFi RNG
                </th>
                <th className="text-center p-4 font-display text-sm text-primary font-semibold bg-primary/5 border-x border-primary/20">
                  deKAOS ✨
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, index) => (
                <tr
                  key={row.feature}
                  className={`border-t border-slate-800 ${
                    index % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-900/60'
                  }`}
                >
                  <td className="p-4 font-medium text-foreground text-sm">
                    {row.feature}
                  </td>
                  <td className="p-4 text-center text-sm text-muted-foreground">
                    {row.centralized}
                  </td>
                  <td className="p-4 text-center text-sm text-muted-foreground">
                    {row.defiRng}
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-emerald-400 bg-primary/5 border-x border-primary/20">
                    {row.dekaos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {comparisonData.map((row, index) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden"
            >
              {/* Feature header */}
              <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
                <h3 className="font-display text-sm font-semibold text-foreground">
                  {row.feature}
                </h3>
              </div>
              
              {/* Comparison values */}
              <div className="grid grid-cols-3 divide-x divide-slate-700/50">
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Centralized</p>
                  <p className="text-sm">{row.centralized}</p>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">DeFi RNG</p>
                  <p className="text-sm">{row.defiRng}</p>
                </div>
                <div className="p-3 text-center bg-primary/5">
                  <p className="text-xs text-primary mb-1">deKAOS</p>
                  <p className="text-sm font-medium text-emerald-400">{row.dekaos}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <div className="w-full max-w-3xl p-6 rounded-xl bg-slate-900/80 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">
              <span className="text-foreground font-medium">TL;DR:</span> deKAOS combines physical entropy, on-chain proofs, and a global node network—no single point of failure, no black boxes.
            </p>
            <Button
              variant="outline"
              className="flex-shrink-0 border-primary text-primary hover:bg-primary/10 gap-2"
            >
              Read the technical paper
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonSection;