import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const NodeIdentityBox = () => {
  const [copied, setCopied] = useState(false);
  
  const nodeId = "kaos1x2y3z4a5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0";
  const truncatedId = `${nodeId.slice(0, 12)}...${nodeId.slice(-6)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(nodeId);
    setCopied(true);
    toast({ description: "Node ID copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[250px] h-[140px] flex flex-col justify-between"
      aria-label="Node Identity"
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[2px] text-primary font-semibold">
          NODE ID
        </span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-slate-800 rounded transition-colors"
          aria-label="Copy Node ID"
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
          )}
        </button>
      </div>

      {/* Node ID */}
      <p className="font-mono text-[11px] text-cyan-400 break-all leading-relaxed">
        {truncatedId}
      </p>

      {/* Stake */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-slate-400">Stake:</span>
        <span className="font-mono text-xs text-slate-100">100.00 SOL</span>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-[9px] text-green-500 uppercase tracking-wider">
            LIVE
          </span>
        </div>
        <span className="font-mono text-[9px] text-slate-500">
          Uptime: 42d 3h 15m
        </span>
      </div>
    </section>
  );
};
