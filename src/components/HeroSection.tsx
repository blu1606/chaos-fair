import { motion } from 'framer-motion';
import { ChevronDown, Check, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandPartners = [
  'GameStudio',
  'NFT Labs',
  'DeFi Protocol',
  'Chain Games',
];

const HeroSection = () => {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Content container with backdrop for readability */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Subtle backdrop behind content */}
        <div className="absolute inset-0 -mx-8 -my-12 bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-sm rounded-3xl pointer-events-none" />
        
        <div className="relative">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-muted/50 backdrop-blur-hero mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="text-sm font-mono text-muted-foreground">
              Decentralized Physical Infrastructure
            </span>
          </motion.div>

          {/* Main tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight mb-6"
          >
            <span className="text-foreground">Chaos is </span>
            <span className="text-gradient-primary">Fair</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            Verifiable randomness from the physical world.
            <br className="hidden sm:block" />
            <span className="text-foreground/80">Unbiasable. Decentralized. On Solana.</span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button variant="hero" size="hero">
              Start Building
            </Button>
            <Button variant="heroOutline" size="hero">
              Run a Node
            </Button>
          </motion.div>

          {/* Info Strip - 2 column bullets */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
              <span>Physical entropy from microphone noise.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="w-4 h-4 text-secondary flex-shrink-0" aria-hidden="true" />
              <span>Verifiable on-chain randomness on Solana.</span>
            </div>
          </motion.div>

          {/* Trust Row */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-8"
          >
            <p className="text-xs sm:text-sm text-slate-400 mb-4">
              Trusted by builders in Web3 gaming, NFT launches, and DeFi.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {brandPartners.map((brand) => (
                <span
                  key={brand}
                  className="px-3 py-1.5 rounded-full font-mono text-xs sm:text-[11px] text-slate-300 border border-slate-600/40 bg-slate-900/80"
                >
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-12 sm:mt-16 grid grid-cols-3 gap-6 sm:gap-8 max-w-lg mx-auto"
          >
            {[
              { value: '10M+', label: 'Entropy bits/day' },
              { value: '500+', label: 'Active nodes' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-xl sm:text-2xl font-bold text-secondary">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-secondary hover:text-secondary/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-lg p-2"
        aria-label="Scroll to next section"
      >
        <span className="text-xs font-mono uppercase tracking-wider">Explore</span>
        <ChevronDown className="w-5 h-5 animate-bounce-slow" />
      </motion.button>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50 pointer-events-none" />
    </section>
  );
};

export default HeroSection;
