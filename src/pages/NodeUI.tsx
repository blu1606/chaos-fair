import { useState } from "react";
import { NodeIdentityBox } from "@/components/node/NodeIdentityBox";
import { EpochCountdownBox } from "@/components/node/EpochCountdownBox";
import { RewardsBox } from "@/components/node/RewardsBox";
import { SpectrumAnalyzer } from "@/components/node/SpectrumAnalyzer";
import { EntropyMetrics } from "@/components/node/EntropyMetrics";
import { ControlDeck } from "@/components/node/ControlDeck";
import { TerminalLog } from "@/components/node/TerminalLog";

const NodeUI = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <div className="max-w-[1920px] mx-auto space-y-4">
        {/* Top Section: Info Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NodeIdentityBox />
          <EpochCountdownBox />
          <RewardsBox />
        </div>

        {/* Middle Section: Spectrum Analyzer */}
        <SpectrumAnalyzer isCapturing={isCapturing && !isPaused} />

        {/* Bottom Section: Metrics + Controls + Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <EntropyMetrics />
          <ControlDeck
            isInitialized={isInitialized}
            isCapturing={isCapturing}
            isPaused={isPaused}
            onInitialize={() => setIsInitialized(true)}
            onStartCapture={() => setIsCapturing(true)}
            onPause={() => setIsPaused(!isPaused)}
            onSubmit={() => {}}
          />
          <TerminalLog />
        </div>
      </div>
    </div>
  );
};

export default NodeUI;
