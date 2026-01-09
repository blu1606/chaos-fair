import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface MetricBarProps {
  label: string;
  value: number;
  status: "optimal" | "ok" | "good" | "low";
}

const MetricBar = ({ label, value, status }: MetricBarProps) => {
  const statusConfig = {
    optimal: { color: "text-green-500", label: "OPTIMAL", Icon: CheckCircle },
    good: { color: "text-green-500", label: "GOOD", Icon: CheckCircle },
    ok: { color: "text-amber-500", label: "OK", Icon: AlertCircle },
    low: { color: "text-red-500", label: "LOW", Icon: XCircle },
  };

  const StatusIcon = statusConfig[status].Icon;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="font-sans text-[11px] text-slate-400">{label}</span>
        <span className="font-mono text-[10px] text-cyan-400">{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`font-mono text-[9px] ${statusConfig[status].color} flex items-center gap-1`}>
        <StatusIcon className="w-3 h-3" />
        {statusConfig[status].label}
      </span>
    </div>
  );
};

export const EntropyMetrics = () => {
  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[280px]"
      aria-label="Entropy Metrics"
    >
      {/* Title */}
      <h3 className="font-display text-[13px] font-semibold text-slate-100 mb-4">
        ENTROPY QUALITY
      </h3>

      {/* Metrics */}
      <div className="space-y-4">
        <MetricBar label="Spectral Entropy" value={82} status="optimal" />
        <MetricBar label="Band Energy" value={45} status="ok" />
        <MetricBar label="Zero-Crossing Rate (ZCR)" value={58} status="good" />
      </div>

      {/* Additional metrics */}
      <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
        <p className="font-mono text-[10px] text-slate-500">
          RMS Level: -18.5 dB
        </p>
        <p className="font-mono text-[10px] text-slate-500">
          Noise Floor: -48 dB
        </p>
      </div>
    </section>
  );
};
