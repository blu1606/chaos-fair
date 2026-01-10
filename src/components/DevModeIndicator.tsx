import { config, isTestingMode, isDevMode } from '@/config/appMode';
import { Bug, Database, Zap } from 'lucide-react';

/**
 * Floating indicator showing current app mode
 * Only visible in non-production modes
 */
const DevModeIndicator = () => {
  if (config.mode === 'production' as string) return null;

  const modeConfig = {
    testing: {
      label: 'TESTING',
      sublabel: 'Mock Data',
      icon: Bug,
      bgClass: 'bg-amber-500/90',
    },
    dev: {
      label: 'DEV',
      sublabel: 'Real API',
      icon: Database,
      bgClass: 'bg-cyan-500/90',
    },
  };

  const { label, sublabel, icon: Icon, bgClass } = modeConfig[config.mode as 'testing' | 'dev'];

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg ${bgClass} text-white font-mono text-xs backdrop-blur-sm`}
    >
      <Icon className="w-4 h-4" />
      <div className="flex flex-col leading-tight">
        <span className="font-bold">{label}</span>
        <span className="opacity-80">{sublabel}</span>
      </div>
      {config.bypassAuth && (
        <div className="ml-2 flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded text-[10px]">
          <Zap className="w-3 h-3" />
          Auth Off
        </div>
      )}
    </div>
  );
};

export default DevModeIndicator;
