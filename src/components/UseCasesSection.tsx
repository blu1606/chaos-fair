import { motion } from 'framer-motion';
import { Gamepad2, Vote, Trophy, Coins, ArrowRight } from 'lucide-react';

interface UseCase {
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  color: 'violet' | 'cyan' | 'amber' | 'teal';
}

const UseCasesSection = () => {
  const colorClasses = {
    violet: {
      text: 'text-primary',
      bg: 'bg-primary/[0.08]',
      border: 'border-primary',
      hoverBorder: 'hover:border-primary/80',
      hoverShadow: 'hover:shadow-[0_8px_16px_hsl(263_70%_66%/0.2)]',
    },
    cyan: {
      text: 'text-secondary',
      bg: 'bg-secondary/[0.08]',
      border: 'border-secondary',
      hoverBorder: 'hover:border-secondary/80',
      hoverShadow: 'hover:shadow-[0_8px_16px_hsl(187_94%_43%/0.2)]',
    },
    amber: {
      text: 'text-accent',
      bg: 'bg-accent/[0.08]',
      border: 'border-accent',
      hoverBorder: 'hover:border-accent/80',
      hoverShadow: 'hover:shadow-[0_8px_16px_hsl(38_92%_50%/0.2)]',
    },
    teal: {
      text: 'text-cyan-400',
      bg: 'bg-cyan-400/[0.08]',
      border: 'border-cyan-400',
      hoverBorder: 'hover:border-cyan-300',
      hoverShadow: 'hover:shadow-[0_8px_16px_hsl(187_94%_58%/0.2)]',
    },
  };

  const useCases: UseCase[] = [
    {
      icon: <Gamepad2 className="w-16 h-16" />,
      category: 'GAMING',
      title: 'NFT Drops & Loot Generation',
      description: 'Fair, unbiasable distribution of rare NFTs and in-game loot. Every drop is verifiable on-chain, building player trust.',
      color: 'violet',
    },
    {
      icon: <Vote className="w-16 h-16" />,
      category: 'GOVERNANCE',
      title: 'Fair Vote Selection',
      description: 'Randomized selection of validators, jury members, or proposal reviewers. Transparent, on-chain, impossible to game.',
      color: 'cyan',
    },
    {
      icon: <Trophy className="w-16 h-16" />,
      category: 'LOTTERIES',
      title: 'Unbiased Winner Selection',
      description: 'Lottery platforms (raffles, giveaways) can prove fairness to users. Randomness tied to physical entropy, not algorithm.',
      color: 'amber',
    },
    {
      icon: <Coins className="w-16 h-16" />,
      category: 'DEFI',
      title: 'Randomized Audits & Liquidation',
      description: 'Protocols use deKAOS to randomly select smart contracts for audits, prevent predictable liquidation timing, or randomize reward distribution.',
      color: 'teal',
    },
  ];

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-8" aria-labelledby="use-cases-heading">
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 
            id="use-cases-heading"
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Where deKAOS Fits
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Proven use cases for verifiable randomness
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <motion.article
              key={useCase.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className={`
                group p-8 rounded-xl border transition-all duration-300
                ${colorClasses[useCase.color].bg}
                ${colorClasses[useCase.color].border}
                ${colorClasses[useCase.color].hoverBorder}
                ${colorClasses[useCase.color].hoverShadow}
                hover:-translate-y-1
                focus-within:outline focus-within:outline-2 focus-within:outline-primary focus-within:outline-offset-2
              `}
            >
              <div className="flex items-start gap-6">
                <div className={`flex-shrink-0 ${colorClasses[useCase.color].text}`}>
                  {useCase.icon}
                </div>
                
                <div className="flex-1">
                  <span className={`
                    font-mono text-xs font-semibold tracking-wider uppercase
                    ${colorClasses[useCase.color].text}
                  `}>
                    {useCase.category}
                  </span>
                  
                  <h3 className="font-display text-xl font-bold text-foreground mt-2 mb-3">
                    {useCase.title}
                  </h3>
                  
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                  
                  <a
                    href={`/docs/use-cases/${useCase.category.toLowerCase()}`}
                    className={`
                      inline-flex items-center gap-1 font-body text-sm font-semibold
                      ${colorClasses[useCase.color].text}
                      hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
                      transition-colors duration-200
                    `}
                  >
                    View case study
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UseCasesSection;
