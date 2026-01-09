import { useState, useEffect } from "react";

export const EpochCountdownBox = () => {
  const [timeRemaining, setTimeRemaining] = useState(272); // 4:32 in seconds
  const [submissionStatus, setSubmissionStatus] = useState<"submitted" | "pending" | "failed">("submitted");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 300)); // Reset to 5 min
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isUrgent = timeRemaining < 300; // Less than 5 minutes

  return (
    <section 
      className="bg-slate-900 border border-purple-800/50 rounded-xl p-4 min-w-[250px] h-[140px] flex flex-col justify-between"
      aria-label="Epoch Countdown"
    >
      {/* Label */}
      <span className="font-mono text-[10px] uppercase tracking-[2px] text-secondary font-semibold">
        EPOCH
      </span>

      {/* Epoch Number */}
      <p 
        className="font-mono text-xl font-bold text-cyan-400"
        style={{ textShadow: "0 0 10px hsl(var(--secondary))" }}
      >
        1247
      </p>

      {/* Countdown */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-slate-400">Time Remaining:</span>
        <span 
          className={`font-mono text-base font-bold ${isUrgent ? "text-yellow-400" : "text-cyan-400"}`}
          style={{ 
            textShadow: isUrgent ? "0 0 8px #facc15" : "none",
            animation: isUrgent ? "pulse 2s infinite" : "none"
          }}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Submission Status */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[9px] text-slate-400">Submission:</span>
        {submissionStatus === "submitted" && (
          <span className="font-mono text-[10px] text-green-500 flex items-center gap-1">
            ✓ Commit Submitted
          </span>
        )}
        {submissionStatus === "pending" && (
          <span className="font-mono text-[10px] text-amber-500 flex items-center gap-1">
            ⏳ Waiting
          </span>
        )}
        {submissionStatus === "failed" && (
          <span className="font-mono text-[10px] text-red-500 flex items-center gap-1">
            ✗ Failed
          </span>
        )}
      </div>

      {/* Next Finalization */}
      <span className="font-mono text-[9px] text-slate-500">
        Next Finalization: 05:18 UTC
      </span>
    </section>
  );
};
