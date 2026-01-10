import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { Rocket, Mic, Pause, FileText, Settings, Timer, Play } from "lucide-react";
import { NODE_CONSTRAINTS } from "@/config/nodeConstraints";

interface ControlDeckProps {
  isInitialized: boolean;
  isCapturing: boolean;
  isPaused: boolean;
  onInitialize: () => void;
  onStartCapture: () => void;
  onPause: () => void;
  onAutoSubmit: () => void;
}

export const ControlDeck = ({
  isInitialized,
  isCapturing,
  isPaused,
  onInitialize,
  onStartCapture,
  onPause,
  onAutoSubmit,
}: ControlDeckProps) => {
  const [submitCountdown, setSubmitCountdown] = useState(NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS);

  // Auto-submit countdown timer
  useEffect(() => {
    if (!isCapturing || isPaused) {
      setSubmitCountdown(NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS);
      return;
    }

    const timer = setInterval(() => {
      setSubmitCountdown((prev) => {
        if (prev <= 1) {
          // Auto-submit when countdown reaches 0
          onAutoSubmit();
          toast({ description: "✓ Auto-submitted commit to Solana" });
          return NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCapturing, isPaused, onAutoSubmit]);

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
    setSubmitCountdown(NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS);
  };

  const handleViewLogs = () => {
    toast({ description: "Expanding logs..." });
  };

  const handleSettings = () => {
    toast({ description: "Opening settings..." });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isUrgent = submitCountdown <= NODE_CONSTRAINTS.COUNTDOWN_WARNING_SECONDS;

  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[350px]"
      aria-label="Control Deck"
    >
      {/* Title */}
      <h3 className="font-display text-[13px] font-semibold text-slate-100 mb-4">
        CONTROL DECK
      </h3>

      {/* Auto-Submit Countdown */}
      {isCapturing && !isPaused && (
        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-primary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className={`w-4 h-4 ${isUrgent ? "text-amber-400 animate-pulse" : "text-primary"}`} />
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                Auto-Submit In
              </span>
            </div>
            <span 
              className={`font-mono text-lg font-bold ${isUrgent ? "text-amber-400" : "text-cyan-400"}`}
              style={{ 
                textShadow: isUrgent ? "0 0 10px #f59e0b" : "0 0 8px #06b6d4"
              }}
            >
              {formatCountdown(submitCountdown)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                isUrgent 
                  ? "bg-gradient-to-r from-amber-500 to-amber-400" 
                  : "bg-gradient-to-r from-primary to-secondary"
              }`}
              style={{ 
                width: `${(submitCountdown / NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

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

        {/* Pause/Resume */}
        <button
          onClick={onPause}
          disabled={!isCapturing}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold rounded-md hover:shadow-[0_0_15px_#f59e0b] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
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

      {/* Info text */}
      <p className="mt-3 font-mono text-[9px] text-slate-500 text-center">
        Commits auto-submit every {NODE_CONSTRAINTS.AUTO_SUBMIT_INTERVAL_SECONDS}s during capture
      </p>
    </section>
  );
};
