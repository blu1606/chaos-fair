import ParticleCanvas from '@/components/ParticleCanvas';
import HeroSection from '@/components/HeroSection';
import ProblemSolutionSection from '@/components/ProblemSolutionSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import LiveStatsSection from '@/components/LiveStatsSection';
import UseCasesSection from '@/components/UseCasesSection';
import ComparisonSection from '@/components/ComparisonSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import FooterSection from '@/components/FooterSection';

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
      
      {/* Live Stats */}
      <LiveStatsSection />
      
      {/* Use Cases */}
      <UseCasesSection />
      
      {/* Comparison */}
      <ComparisonSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Footer */}
      <FooterSection />
    </main>
  );
};

export default Index;
