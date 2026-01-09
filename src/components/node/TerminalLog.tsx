import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";

interface LogEntry {
  id: number;
  timestamp: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: "10:42:15", type: "success", message: "Captured 44.1kHz" },
  { id: 2, timestamp: "10:42:30", type: "success", message: "Features extracted" },
  { id: 3, timestamp: "10:42:45", type: "success", message: "Entropy: 0.847" },
  { id: 4, timestamp: "10:42:50", type: "info", message: "Preparing commit..." },
  { id: 5, timestamp: "10:42:51", type: "success", message: "Submitting commit" },
  { id: 6, timestamp: "10:42:52", type: "success", message: "Tx: 5H...xyz" },
  { id: 7, timestamp: "10:42:53", type: "success", message: "Confirmed!" },
  { id: 8, timestamp: "10:43:00", type: "info", message: "Waiting for epoch..." },
  { id: 9, timestamp: "10:43:15", type: "error", message: "Network error (retry in 10s)" },
  { id: 10, timestamp: "10:43:25", type: "success", message: "Reconnected" },
  { id: 11, timestamp: "10:43:30", type: "success", message: "Captured 44.1kHz" },
  { id: 12, timestamp: "10:43:45", type: "warning", message: "Low entropy detected" },
  { id: 13, timestamp: "10:44:00", type: "success", message: "Entropy normalized: 0.812" },
  { id: 14, timestamp: "10:44:15", type: "info", message: "Processing audio buffer..." },
  { id: 15, timestamp: "10:44:20", type: "success", message: "Buffer processed successfully" },
];

export const TerminalLog = () => {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = () => {
    setLogs([]);
    toast({ description: "Logs cleared" });
  };

  const handleExport = () => {
    const logText = logs
      .map((log) => `[${log.timestamp}] ${getIcon(log.type)} ${log.message}`)
      .join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `node-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ description: "Logs exported" });
  };

  const getIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠️";
      case "error":
        return "✗";
      case "info":
        return "→";
    }
  };

  const getColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "warning":
        return "text-amber-500";
      case "error":
        return "text-red-500";
      case "info":
        return "text-primary";
    }
  };

  return (
    <section 
      className="bg-black border border-purple-800/50 rounded-xl p-3 min-w-[280px] flex flex-col"
      aria-label="Terminal Logs"
    >
      {/* Title */}
      <h3 className="font-display text-[13px] font-semibold text-slate-100 mb-2">
        LOGS (Last 50 Entries)
      </h3>

      {/* Log Container */}
      <div
        ref={logContainerRef}
        className="flex-1 max-h-[280px] overflow-y-auto font-mono text-[11px] leading-relaxed space-y-0.5"
        aria-live="polite"
      >
        {logs.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No logs yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex gap-2">
              <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
              <span className={`shrink-0 ${getColor(log.type)}`}>
                {getIcon(log.type)}
              </span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
        <button
          onClick={handleClear}
          className="flex-1 px-3 py-1.5 bg-transparent border border-slate-600 text-slate-400 text-[10px] font-mono rounded hover:border-primary hover:text-primary transition-all"
        >
          Clear Logs
        </button>
        <button
          onClick={handleExport}
          className="flex-1 px-3 py-1.5 bg-transparent border border-primary text-primary text-[10px] font-mono rounded hover:bg-primary/10 transition-all"
        >
          Export
        </button>
      </div>
    </section>
  );
};
