import { toast } from "@/hooks/use-toast";
import { Sparkles, Wallet, BarChart3 } from "lucide-react";

export const RewardsBox = () => {
  const handleClaim = () => {
    toast({ description: "Claiming rewards..." });
  };

  const handleHistory = () => {
    toast({ description: "Opening rewards history..." });
  };

  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[250px] h-[140px] flex flex-col justify-between"
      aria-label="Rewards"
    >
      {/* Label */}
      <span className="font-mono text-[10px] uppercase tracking-[2px] text-amber-500 font-semibold">
        REWARDS (Current Epoch)
      </span>

      {/* Earned */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-slate-400">Earned:</span>
        <span className="font-mono text-sm font-bold text-green-400 flex items-center gap-1">
          0.247 KAOS <Sparkles className="w-3 h-3 text-amber-400" />
        </span>
      </div>

      {/* Pending */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-slate-400">Pending:</span>
        <span className="font-mono text-xs text-slate-100">
          12.5 SOL + 1,247 KAOS
        </span>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleClaim}
          className="flex-1 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-400 text-white text-[10px] font-mono font-semibold rounded hover:shadow-[0_0_10px_#10b981] transition-all flex items-center justify-center gap-1"
        >
          <Wallet className="w-3 h-3" /> Claim
        </button>
        <button
          onClick={handleHistory}
          className="flex-1 px-3 py-1.5 bg-transparent border border-primary text-primary text-[10px] font-mono rounded hover:bg-primary/10 transition-all flex items-center justify-center gap-1"
        >
          <BarChart3 className="w-3 h-3" /> History
        </button>
      </div>

      {/* Last Reward */}
      <span className="font-mono text-[8px] text-slate-500">
        Last reward: 0.189 KAOS (epoch 1246)
      </span>
    </section>
  );
};
