import { toast } from "@/hooks/use-toast";
import { Rocket, Mic, Send, Pause, FileText, Settings } from "lucide-react";

interface ControlDeckProps {
  isInitialized: boolean;
  isCapturing: boolean;
  isPaused: boolean;
  onInitialize: () => void;
  onStartCapture: () => void;
  onPause: () => void;
  onSubmit: () => void;
}

export const ControlDeck = ({
  isInitialized,
  isCapturing,
  isPaused,
  onInitialize,
  onStartCapture,
  onPause,
  onSubmit,
}: ControlDeckProps) => {
  const handleInitialize = () => {
    toast({ description: "Initializing node..." });
    onInitialize();
    setTimeout(() => {
      toast({ description: "✓ Node initialized!" });
    }, 1500);
  };

  const handleStartCapture = () => {
    toast({ description: "Starting audio capture..." });
    onStartCapture();
  };

  const handleSubmit = () => {
    toast({ description: "Submitting commit to Solana..." });
    onSubmit();
    setTimeout(() => {
      toast({ description: "✓ Submitted (tx: 5H...xyz)" });
    }, 2000);
  };

  const handleViewLogs = () => {
    toast({ description: "Expanding logs..." });
  };

  const handleSettings = () => {
    toast({ description: "Opening settings..." });
  };

  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[350px]"
      aria-label="Control Deck"
    >
      {/* Title */}
      <h3 className="font-display text-[13px] font-semibold text-slate-100 mb-4">
        CONTROL DECK
      </h3>

      {/* Button Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {/* Initialize */}
        <button
          onClick={handleInitialize}
          disabled={isInitialized}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-primary to-purple-700 text-white text-xs font-semibold rounded-md hover:shadow-[0_0_15px_hsl(var(--primary))] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Rocket className="w-4 h-4" />
          Initialize
        </button>

        {/* Start Capture */}
        <button
          onClick={handleStartCapture}
          disabled={isCapturing}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-xs font-semibold rounded-md hover:shadow-[0_0_15px_#06b6d4] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mic className="w-4 h-4" />
          Capture
        </button>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!isCapturing}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-md hover:shadow-[0_0_15px_#10b981] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Submit
        </button>

        {/* Pause */}
        <button
          onClick={onPause}
          disabled={!isCapturing}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold rounded-md hover:shadow-[0_0_15px_#f59e0b] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Pause className="w-4 h-4" />
          {isPaused ? "Resume" : "Pause"}
        </button>

        {/* View Logs */}
        <button
          onClick={handleViewLogs}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-transparent border-2 border-primary text-primary text-xs font-semibold rounded-md hover:bg-primary/10 transition-all"
        >
          <FileText className="w-4 h-4" />
          Logs
        </button>

        {/* Settings */}
        <button
          onClick={handleSettings}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-transparent border-2 border-primary text-primary text-xs font-semibold rounded-md hover:bg-primary/10 transition-all"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </section>
  );
};
