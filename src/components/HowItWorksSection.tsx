import { motion, useInView } from 'framer-motion';
import { Mic, Hash, ShieldCheck, ArrowRight } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    number: 1,
    title: 'Capture',
    icon: Mic,
    color: 'primary',
    description: 'Your node daemon captures ambient acoustic noise from the microphone in real-time.',
    subtext: 'Raw audio never leaves your device. Only irreversible DSP features are transmitted.',
  },
  {
    number: 2,
    title: 'Commit',
    icon: Hash,
    color: 'secondary',
    description: 'Your node computes a cryptographic hash of extracted entropy features and submits it as a commitment to the Solana blockchain.',
    subtext: 'Binding: epoch_id, timestamp, feature_hash, salt → prevents re-submission.',
  },
  {
    number: 3,
    title: 'Verify',
    icon: ShieldCheck,
    color: 'cyan',
    description: 'After epoch finalization, all commitments are aggregated into a single verifiable random number, accessible on-chain for your dApps.',
    subtext: 'Randomness available via Solana CPI, HTTP API, or WebSocket subscriptions.',
  },
];

const colorClasses = {
  primary: {
    border: 'border-primary/30',
    bg: 'bg-primary/5',
    icon: 'text-primary',
    glow: 'bg-primary/20',
  },
  secondary: {
    border: 'border-secondary/30',
    bg: 'bg-secondary/5',
    icon: 'text-secondary',
    glow: 'bg-secondary/20',
  },
  cyan: {
    border: 'border-cyan-400/30',
    bg: 'bg-cyan-400/5',
    icon: 'text-cyan-400',
    glow: 'bg-cyan-400/20',
  },
};

const StepCard = ({ step, index }: { step: typeof steps[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const colors = colorClasses[step.color as keyof typeof colorClasses];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={`relative rounded-xl border ${colors.border} ${colors.bg} p-6 sm:p-8`}
    >
      {/* Icon with glow */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className={`absolute inset-0 ${colors.glow} blur-2xl rounded-full`} />
          <div className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
            <step.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${colors.icon}`} />
          </div>
        </div>
      </div>

      {/* Step number & title */}
      <h3 className="font-display text-xl sm:text-2xl text-center mb-4">
        {step.number}. {step.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm sm:text-base text-center leading-relaxed mb-4">
        {step.description}
      </p>

      {/* Technical subtext */}
      <p className="font-mono text-xs text-muted-foreground/60 text-center">
        {step.subtext}
      </p>
    </motion.div>
  );
};

const FlowArrow = ({ index }: { index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay: 0.3 + index * 0.15 }}
    viewport={{ once: true }}
    className="hidden lg:flex items-center justify-center"
  >
    <div className="relative">
      <motion.div
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowRight className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  </motion.div>
);

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 px-4 sm:px-8 lg:px-16">
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
            How <span className="text-gradient-primary">deKAOS</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From ambient sound to on-chain randomness in three simple steps
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 lg:gap-4 items-center">
          <StepCard step={steps[0]} index={0} />
          <FlowArrow index={0} />
          <StepCard step={steps[1]} index={1} />
          <FlowArrow index={1} />
          <StepCard step={steps[2]} index={2} />
        </div>

        {/* Mobile flow indicators */}
        <div className="lg:hidden flex flex-col items-center gap-4 -mt-2">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
              className="w-0.5 h-8 bg-gradient-to-b from-primary to-transparent"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
