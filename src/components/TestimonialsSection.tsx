import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

interface Metric {
  value: string;
  label: string;
  color: 'cyan' | 'violet' | 'amber' | 'green';
}

const testimonials: Testimonial[] = [
  {
    name: 'Alex Chen',
    role: 'Node Operator, Vietnam',
    quote: 'Passive income with my laptop. Love that everything is verifiable on-chain.',
    avatar: 'AC',
  },
  {
    name: 'Sarah Lopez',
    role: 'Founder, Game Studio',
    quote: "Best RNG we've used for NFT drops. Our community can audit every draw.",
    avatar: 'SL',
  },
  {
    name: 'Dev',
    role: 'CTO, DeFi Protocol',
    quote: "Fair randomness we don't have to babysit. That's rare.",
    avatar: 'DV',
  },
];

const metrics: Metric[] = [
  { value: '1,200+', label: 'Active nodes', color: 'cyan' },
  { value: '2.4M+', label: 'Requests served', color: 'violet' },
  { value: '$2.4M+', label: 'Rewards distributed', color: 'amber' },
  { value: '40+', label: 'Live integrations', color: 'green' },
];

const colorClasses = {
  cyan: 'text-secondary',
  violet: 'text-primary',
  amber: 'text-accent',
  green: 'text-emerald-400',
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="relative py-24 px-4 sm:px-8 lg:px-16">
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
            What operators & builders <span className="text-gradient-primary">say</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Early adopters using deKAOS in production.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-6 rounded-xl bg-slate-900 border border-slate-700/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
            >
              {/* Avatar and info */}
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar placeholder */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-display text-sm font-semibold">
                  {testimonial.avatar}
                </div>
                
                <div>
                  <h3 className="font-display text-base text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Star rating */}
              <div className="flex gap-0.5 mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-accent fill-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-muted-foreground italic leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
            </motion.div>
          ))}
        </div>

        {/* Metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="p-6 sm:p-8 rounded-xl bg-background border border-slate-700/50"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="text-center p-4 rounded-lg bg-slate-900/50 border border-slate-800"
              >
                <p className={`font-mono text-2xl sm:text-3xl font-bold ${colorClasses[metric.color]} mb-1`}>
                  {metric.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {metric.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;