import ParticleCanvas from '@/components/ParticleCanvas';
import HeroSection from '@/components/HeroSection';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';
import HowItWorksSection from '@/components/HowItWorksSection';

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Particle background */}
      <ParticleCanvas />
      
      {/* Hero section */}
      <HeroSection />
      
      {/* Problem vs Solution */}
      <ProblemSolutionSection />
      
      {/* How It Works */}
      <HowItWorksSection />
    </main>
  );
};

export default Index;
