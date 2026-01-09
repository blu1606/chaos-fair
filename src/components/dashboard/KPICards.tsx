import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Clock, CreditCard, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KPICardData {
  label: string;
  value: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  status?: string;
  icon: React.ElementType;
  color: 'primary' | 'secondary' | 'accent' | 'success';
  cta?: {
    label: string;
    onClick: () => void;
  };
}

const kpiData: KPICardData[] = [
  {
    label: 'Total Requests',
    value: '2,847',
    trend: { value: '+12% vs yesterday', positive: true },
    icon: Zap,
    color: 'primary',
  },
  {
    label: 'Average Latency',
    value: '42ms',
    status: '✓ Optimal performance',
    icon: Clock,
    color: 'secondary',
  },
  {
    label: 'Available Credit',
    value: '12,500',
    icon: CreditCard,
    color: 'accent',
    cta: { label: 'Refill', onClick: () => console.log('Refill') },
  },
  {
    label: 'Active Keys',
    value: '3',
    status: 'Expires in 28 days',
    icon: Key,
    color: 'success',
  },
];

const colorStyles = {
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  secondary: {
    iconBg: 'bg-secondary/10',
    iconColor: 'text-secondary',
    valueColor: 'text-secondary',
  },
  accent: {
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    valueColor: 'text-accent',
  },
  success: {
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500',
    valueColor: 'text-green-500',
  },
};

const KPICards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {kpiData.map((card, index) => {
        const Icon = card.icon;
        const styles = colorStyles[card.color];

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center mb-4`}>
              <Icon className={`w-5 h-5 ${styles.iconColor}`} />
            </div>

            {/* Value */}
            <p className={`font-mono text-3xl lg:text-4xl font-bold ${styles.valueColor} mb-1`}>
              {card.value}
            </p>

            {/* Label */}
            <p className="text-sm text-muted-foreground font-medium">
              {card.label}
            </p>

            {/* Trend or Status */}
            {card.trend && (
              <div className="flex items-center gap-1 mt-3">
                {card.trend.positive ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${card.trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                  {card.trend.value}
                </span>
              </div>
            )}

            {card.status && !card.trend && (
              <p className="text-xs text-muted-foreground mt-3">
                {card.status}
              </p>
            )}

            {/* CTA Button */}
            {card.cta && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-primary hover:text-primary hover:bg-primary/10 -ml-2"
                onClick={card.cta.onClick}
              >
                {card.cta.label}
              </Button>
            )}

            {/* Subtle hover glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
