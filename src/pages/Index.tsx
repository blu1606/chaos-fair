import ParticleCanvas from '@/components/ParticleCanvas';
import HeroSection from '@/components/HeroSection';

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Particle background */}
      <ParticleCanvas />
      
      {/* Hero section */}
      <HeroSection />
      
      {/* Placeholder for additional sections */}
      <section className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-foreground mb-6">
            The Future of <span className="text-gradient-primary">Randomness</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            deKAOS harnesses ambient acoustic noise from a global network of nodes to generate cryptographically secure, verifiable randomness on the Solana blockchain.
          </p>
        </div>
      </section>
    </main>
  );
};

export default Index;
