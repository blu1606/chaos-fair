import { motion } from 'framer-motion';
import { ChevronRight, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How is deKAOS different from other RNG providers?',
    answer: 'deKAOS uses physical entropy from ambient acoustic noise captured by a decentralized network of nodes. Unlike algorithmic PRNGs or oracle-based solutions, our randomness comes from real-world chaos that cannot be predicted or manipulated. Every output is cryptographically proven on-chain.',
  },
  {
    question: 'Do I need special hardware to run a node?',
    answer: 'No special hardware required. Any device with a microphone and internet connection can run a deKAOS node—laptops, Raspberry Pi, or dedicated servers all work. The node daemon is lightweight and runs alongside your normal workloads.',
  },
  {
    question: 'Is my audio data private?',
    answer: 'Yes, absolutely. Audio is processed entirely in-memory on your device. Only irreversible DSP features (spectral entropy, zero-crossing rate) are transmitted—never raw audio. After feature extraction, all audio data is immediately deleted. We cannot reconstruct or listen to your environment.',
  },
  {
    question: 'How much can I earn as a node operator?',
    answer: 'Earnings depend on your entropy quality score and stake amount. Higher-quality contributions (diverse acoustic environments, consistent uptime) earn more rewards. Current operators average 0.1–0.5 KAOS per epoch. Check the Node Dashboard for real-time estimates based on your setup.',
  },
  {
    question: 'What chains does deKAOS support today?',
    answer: 'deKAOS is live on Solana mainnet with full CPI integration. We are actively developing support for Ethereum L2s (Arbitrum, Optimism) and other high-throughput chains. Join our Discord to vote on chain priorities.',
  },
  {
    question: 'How do I integrate deKAOS into my dApp?',
    answer: 'Integration takes minutes. Install our SDK (@dekaos/sdk), initialize with your API key, and call generate() to receive verifiable random numbers. For Solana programs, use our CPI interface. Full docs and examples are available in the Developer Dashboard.',
  },
  {
    question: 'What happens if nodes try to game the system?',
    answer: 'Our protocol uses commit-reveal schemes and statistical validation to detect manipulation attempts. Nodes submitting low-entropy or repetitive data get penalized. The aggregation algorithm combines entropy from multiple independent nodes, so no single actor can bias the output.',
  },
  {
    question: 'Is there an SLA for enterprise use?',
    answer: 'Yes, we offer enterprise SLAs with guaranteed uptime (99.9%+), dedicated support, and custom integration assistance. Contact our team for audit reports, compliance documentation, and priority access to new features.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">
            Frequently asked <span className="text-gradient-primary">questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From node setup to on-chain integration.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-3"
        >
          {faqItems.map((item, index) => (
            <details
              key={index}
              className="group rounded-xl border border-slate-700/50 bg-slate-900/50 overflow-hidden"
            >
              <summary
                className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:bg-slate-800/50 transition-colors"
              >
                <span className="font-display text-base sm:text-lg text-foreground text-left">
                  {item.question}
                </span>
                <ChevronRight
                  className="w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              
              <div className="px-6 pb-5 pt-2 border-l-2 border-primary ml-4 mr-4 mb-4 bg-slate-800/30 rounded-r-lg">
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </motion.div>

        {/* Contact Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="relative max-w-2xl mx-auto">
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-secondary" />
            
            <div className="p-6 sm:p-8 rounded-xl bg-background border border-slate-700/50 text-center">
              <p className="text-foreground text-lg mb-6">
                Still have questions or need a security review?
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/10"
                  asChild
                >
                  <a href="https://discord.gg/dekaos" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4" />
                    Join the Discord →
                  </a>
                </Button>
                
                <Button
                  variant="outline"
                  className="gap-2 border-secondary text-secondary hover:bg-secondary/10"
                  asChild
                >
                  <a href="mailto:team@dekaos.io">
                    <Mail className="w-4 h-4" />
                    Talk to the team →
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;