import { useState } from "react";
import { Copy, Check, Download, AlertTriangle, Dice5, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PlaygroundResult } from "@/pages/Playground";

interface PlaygroundOutputProps {
  result: PlaygroundResult | null;
  isLoading: boolean;
  error: string | null;
  showAsJson: boolean;
  onRetry: () => void;
}

export const PlaygroundOutput = ({
  result,
  isLoading,
  error,
  showAsJson,
  onRetry,
}: PlaygroundOutputProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    toast({ description: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `randomness-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateStats = (data: number[]) => {
    const sorted = [...data].sort((a, b) => a - b);
    const sum = data.reduce((acc, val) => acc + val, 0);
    const mean = sum / data.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return {
      min: Math.min(...data),
      max: Math.max(...data),
      mean: Math.round(mean),
      median,
      stdDev: Math.round(stdDev),
    };
  };

  const getHistogramData = (data: number[]) => {
    const buckets = 10;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const bucketSize = range / buckets;

    const histogram = Array(buckets).fill(0);
    data.forEach((value) => {
      const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
      histogram[bucketIndex]++;
    });

    return histogram.map((count, i) => ({
      range: `${Math.round(min + i * bucketSize).toLocaleString()}`,
      count,
    }));
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Generating...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-w-md text-center">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <Dice5 className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">
          Set parameters and click "Generate Randomness" to see results
        </p>
      </div>
    );
  }

  const stats = calculateStats(result.data);
  const histogramData = getHistogramData(result.data);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          Response
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1.5" />
            )}
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Download
          </Button>
        </div>
      </div>

      {/* JSON Viewer */}
      {showAsJson && (
        <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[300px]">
          <pre className="font-mono text-xs leading-relaxed">
            <code>
              <span className="text-slate-400">{"{"}</span>
              {"\n"}
              <span className="text-pink-400">  "epoch"</span>
              <span className="text-slate-400">: </span>
              <span className="text-cyan-400">{result.epoch}</span>
              <span className="text-slate-400">,</span>
              {"\n"}
              <span className="text-pink-400">  "count"</span>
              <span className="text-slate-400">: </span>
              <span className="text-cyan-400">{result.count}</span>
              <span className="text-slate-400">,</span>
              {"\n"}
              <span className="text-pink-400">  "data"</span>
              <span className="text-slate-400">: [</span>
              {"\n"}
              {result.data.slice(0, 5).map((num, i) => (
                <span key={i}>
                  <span className="text-cyan-400">    {num}</span>
                  <span className="text-slate-400">,</span>
                  {"\n"}
                </span>
              ))}
              {result.data.length > 5 && (
                <span className="text-slate-500">    ... {result.data.length - 5} more items</span>
              )}
              {"\n"}
              <span className="text-slate-400">  ],</span>
              {"\n"}
              <span className="text-pink-400">  "timestamp"</span>
              <span className="text-slate-400">: </span>
              <span className="text-green-400">"{result.timestamp}"</span>
              <span className="text-slate-400">,</span>
              {"\n"}
              <span className="text-pink-400">  "latency_ms"</span>
              <span className="text-slate-400">: </span>
              <span className="text-cyan-400">{result.latency_ms}</span>
              <span className="text-slate-400">,</span>
              {"\n"}
              <span className="text-pink-400">  "signature"</span>
              <span className="text-slate-400">: </span>
              <span className="text-green-400">"{result.signature}"</span>
              <span className="text-slate-400">,</span>
              {"\n"}
              <span className="text-pink-400">  "proof"</span>
              <span className="text-slate-400">: </span>
              <span className="text-green-400">"{result.proof}"</span>
              {"\n"}
              <span className="text-slate-400">{"}"}</span>
            </code>
          </pre>
        </div>
      )}

      {/* Statistics */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground">
          Statistics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Min</p>
            <p className="font-mono text-sm text-foreground">{stats.min.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Max</p>
            <p className="font-mono text-sm text-foreground">{stats.max.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Mean</p>
            <p className="font-mono text-sm text-foreground">{stats.mean.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Median</p>
            <p className="font-mono text-sm text-foreground">{stats.median.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Std Dev</p>
            <p className="font-mono text-sm text-foreground">{stats.stdDev.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Histogram */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-bold text-foreground">
          Distribution
        </h3>
        <div className="bg-muted/30 rounded-lg p-4 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Bar 
                dataKey="count" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
