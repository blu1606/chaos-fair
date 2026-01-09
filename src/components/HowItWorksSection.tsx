import { motion, useInView } from 'framer-motion';
import { Mic, Hash, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';
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

const devSteps = [
  {
    instruction: 'start_epoch',
    description: 'creates a new challenge.',
  },
  {
    instruction: 'submit_commit',
    description: 'Node captures audio, computes features, and submits commitment.',
  },
  {
    instruction: 'finalize_epoch',
    description: 'aggregates valid commits into R.',
  },
  {
    instruction: 'consume_randomness(epoch_id)',
    description: 'dApps call on-chain or via HTTP API.',
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

        {/* Under the Hood - Developer Expandable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <details className="group rounded-xl border border-primary/30 bg-slate-900/50 overflow-hidden">
            <summary
              className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="Expand developer documentation for under the hood details"
            >
              <div className="flex items-center gap-3">
                <ChevronRight 
                  className="w-5 h-5 text-primary transition-transform duration-200 group-open:rotate-90" 
                  aria-hidden="true" 
                />
                <span className="font-display text-lg text-primary font-semibold">
                  Under the hood (for developers)
                </span>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Epoch, commit, finalize, and consume in 4 instructions.
              </span>
            </summary>

            <div className="px-6 pb-6 pt-2">
              {/* Summary visible on mobile when collapsed info is hidden */}
              <p className="text-sm text-muted-foreground mb-4 sm:hidden">
                Epoch, commit, finalize, and consume in 4 instructions.
              </p>

              <ol className="space-y-3">
                {devSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-mono flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <code className="font-mono text-sm text-secondary bg-slate-800 px-2 py-0.5 rounded">
                        {step.instruction}
                      </code>
                      <span className="text-sm text-muted-foreground">
                        – {step.description}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <p className="font-mono text-xs text-slate-400">
                  <span className="text-primary">// Example:</span> Consuming randomness in your Solana program
                </p>
                <pre className="font-mono text-xs text-cyan-400 mt-2 overflow-x-auto">
{`let randomness = dekaos::consume_randomness(ctx, epoch_id)?;
let result = randomness % max_value;`}
                </pre>
              </div>
            </div>
          </details>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
