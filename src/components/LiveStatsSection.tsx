import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatCard {
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
  color: 'cyan' | 'violet' | 'amber' | 'green';
  showProgress?: boolean;
}

const LiveStatsSection = () => {
  const [stats, setStats] = useState({
    nodesOnline: 1247,
    epochsCompleted: 42891,
    entropySubmitted: 1247.5,
    uptime: 99.97,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        nodesOnline: prev.nodesOnline + Math.floor(Math.random() * 3) - 1,
        epochsCompleted: prev.epochsCompleted + Math.floor(Math.random() * 2),
        entropySubmitted: +(prev.entropySubmitted + Math.random() * 0.1).toFixed(1),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const colorClasses = {
    cyan: {
      text: 'text-secondary',
      border: 'border-secondary',
      bg: 'bg-secondary/5',
    },
    violet: {
      text: 'text-primary',
      border: 'border-primary',
      bg: 'bg-primary/5',
    },
    amber: {
      text: 'text-accent',
      border: 'border-accent',
      bg: 'bg-accent/5',
    },
    green: {
      text: 'text-emerald-400',
      border: 'border-emerald-400',
      bg: 'bg-emerald-400/5',
    },
  };

  const statCards: StatCard[] = [
    {
      label: 'Nodes Online',
      value: stats.nodesOnline.toLocaleString(),
      trend: '+23 (24h)',
      color: 'cyan',
    },
    {
      label: 'Epochs Completed',
      value: stats.epochsCompleted.toLocaleString(),
      subtext: 'Last finalized: 2min ago',
      color: 'violet',
    },
    {
      label: 'Entropy Submitted',
      value: `${stats.entropySubmitted.toLocaleString()} MB`,
      subtext: '+42 MB last 24h',
      color: 'amber',
    },
    {
      label: 'Uptime',
      value: `${stats.uptime}%`,
      color: 'green',
      showProgress: true,
    },
  ];

  return (
    <section className="relative py-16 px-6 md:px-8" aria-label="Live Network Statistics">
      <div className="max-w-[1280px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-12"
        >
          Live Network Activity
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-[hsl(222_47%_6%)] border border-primary/20 rounded-xl p-8 md:p-12"
        >
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            role="region"
            aria-live="polite"
            aria-atomic="false"
          >
            {statCards.map((card, index) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className={`text-center p-6 border-b-2 ${colorClasses[card.color].border} ${colorClasses[card.color].bg} rounded-lg`}
              >
                <p className="font-body text-sm font-medium text-muted-foreground mb-3">
                  {card.label}
                </p>
                
                <motion.p
                  key={card.value}
                  initial={{ scale: 1.05, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`font-mono text-3xl md:text-4xl ${colorClasses[card.color].text} mb-2`}
                >
                  {card.value}
                </motion.p>

                {card.trend && (
                  <div className="flex items-center justify-center gap-1 text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-body text-xs">{card.trend}</span>
                  </div>
                )}

                {card.subtext && (
                  <p className="font-body text-xs text-muted-foreground mt-1">
                    {card.subtext}
                  </p>
                )}

                {card.showProgress && (
                  <div className="mt-3">
                    <Progress 
                      value={stats.uptime} 
                      className="h-1 bg-muted"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveStatsSection;
