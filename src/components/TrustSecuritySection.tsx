import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, Github, FileCheck, Key } from 'lucide-react';

interface SecurityPillar {
  icon: React.ElementType;
  title: string;
  description: string;
}

const securityPillars: SecurityPillar[] = [
  {
    icon: EyeOff,
    title: 'Audio privacy',
    description: 'Raw audio is processed in-memory and wiped. Only feature hashes leave the device.',
  },
  {
    icon: ShieldCheck,
    title: 'On-chain proofs',
    description: 'Each randomness output is linked to on-chain commits you can verify.',
  },
  {
    icon: Lock,
    title: 'Anti-replay & anti-synthetic',
    description: 'Epoch challenges, latency checks, and spectral gates prevent fake or looped signals.',
  },
  {
    icon: Github,
    title: 'Open-source core',
    description: 'Core contracts and node code are open for audit on GitHub.',
  },
  {
    icon: FileCheck,
    title: 'Audit-ready',
    description: 'Designed to plug into third-party smart contract audits.',
  },
  {
    icon: Key,
    title: 'Rate limiting & API keys',
    description: 'API key management and rate-limits protect both you and the network.',
  },
];

const complianceItems = [
  'Audit-ready.',
  'SOC 2-friendly architecture.',
  'Supports internal and external security reviews.',
];

const TrustSecuritySection = () => {
  return (
    <section id="trust-security" className="relative py-24 px-4 sm:px-8 lg:px-16">
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
            Built for <span className="text-gradient-primary">security</span> and transparency
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Physical entropy, cryptographic proofs, and auditable code.
          </p>
        </motion.div>

        {/* Security pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {securityPillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-slate-900 border border-slate-600/40 hover:border-primary/40 transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <pillar.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Title */}
              <h3 className="font-display text-base font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Audit/Compliance strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Compliance text */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center lg:text-left">
              {complianceItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="font-mono text-xs sm:text-[11px] text-slate-400">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Placeholder audit badges */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-500">
                🛡️ Audit Badge
              </div>
              <div className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-slate-500">
                ✓ Verified
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSecuritySection;