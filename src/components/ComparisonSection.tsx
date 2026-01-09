import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, X, AlertTriangle, DollarSign, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

type CellType = 'success' | 'warning' | 'error' | 'double-success';

interface ComparisonCell {
  type: CellType;
  text?: string;
}

interface ComparisonRow {
  feature: string;
  centralized: ComparisonCell;
  defiRng: ComparisonCell;
  dekaos: ComparisonCell;
}

const comparisonData: ComparisonRow[] = [
  {
    feature: 'Decentralized',
    centralized: { type: 'error' },
    defiRng: { type: 'success' },
    dekaos: { type: 'double-success' },
  },
  {
    feature: 'Physical entropy',
    centralized: { type: 'error' },
    defiRng: { type: 'error' },
    dekaos: { type: 'success' },
  },
  {
    feature: 'On-chain proofs',
    centralized: { type: 'error' },
    defiRng: { type: 'success' },
    dekaos: { type: 'success' },
  },
  {
    feature: 'Trust required',
    centralized: { type: 'warning', text: 'High' },
    defiRng: { type: 'warning', text: 'Medium' },
    dekaos: { type: 'success', text: 'Low' },
  },
  {
    feature: 'API cost',
    centralized: { type: 'warning', text: 'High' },
    defiRng: { type: 'error', text: 'Very high' },
    dekaos: { type: 'success', text: 'Affordable' },
  },
  {
    feature: 'Latency',
    centralized: { type: 'success', text: 'Low' },
    defiRng: { type: 'warning', text: 'Medium' },
    dekaos: { type: 'success', text: 'Low' },
  },
  {
    feature: 'SLA / Uptime',
    centralized: { type: 'warning', text: 'Good' },
    defiRng: { type: 'warning', text: 'Variable' },
    dekaos: { type: 'success', text: '99.97%' },
  },
  {
    feature: 'Community support',
    centralized: { type: 'error', text: 'Closed' },
    defiRng: { type: 'warning', text: 'Mixed' },
    dekaos: { type: 'success', text: 'Active' },
  },
];

const renderCell = (cell: ComparisonCell, isDekaos = false): ReactNode => {
  const iconClass = 'w-4 h-4 flex-shrink-0';
  
  switch (cell.type) {
    case 'success':
      return (
        <span className={`inline-flex items-center gap-1.5 ${isDekaos ? 'text-emerald-400' : 'text-emerald-500'}`}>
          <Check className={iconClass} />
          {cell.text && <span>{cell.text}</span>}
        </span>
      );
    case 'double-success':
      return (
        <span className="inline-flex items-center gap-0.5 text-emerald-400">
          <Check className={iconClass} />
          <Check className={`${iconClass} -ml-2`} />
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-500">
          <AlertTriangle className={iconClass} />
          {cell.text && <span>{cell.text}</span>}
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1.5 text-red-500">
          <X className={iconClass} />
          {cell.text && <span>{cell.text}</span>}
        </span>
      );
    default:
      return null;
  }
};

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
                  <span className="inline-flex items-center gap-1.5">
                    deKAOS
                    <Sparkles className="w-4 h-4" />
                  </span>
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
                  <td className="p-4 text-center text-sm">
                    <span className="inline-flex justify-center">
                      {renderCell(row.centralized)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm">
                    <span className="inline-flex justify-center">
                      {renderCell(row.defiRng)}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm font-medium bg-primary/5 border-x border-primary/20">
                    <span className="inline-flex justify-center">
                      {renderCell(row.dekaos, true)}
                    </span>
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
                  <p className="text-xs text-muted-foreground mb-2">Centralized</p>
                  <span className="inline-flex justify-center text-sm">
                    {renderCell(row.centralized)}
                  </span>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-2">DeFi RNG</p>
                  <span className="inline-flex justify-center text-sm">
                    {renderCell(row.defiRng)}
                  </span>
                </div>
                <div className="p-3 text-center bg-primary/5">
                  <p className="text-xs text-primary mb-2">deKAOS</p>
                  <span className="inline-flex justify-center text-sm">
                    {renderCell(row.dekaos, true)}
                  </span>
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