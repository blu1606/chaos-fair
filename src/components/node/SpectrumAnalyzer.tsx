import { useRef, useEffect, useState } from "react";

interface SpectrumAnalyzerProps {
  isCapturing: boolean;
}

export const SpectrumAnalyzer = ({ isCapturing }: SpectrumAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const barsRef = useRef<number[]>(new Array(64).fill(0));
  
  const [quality, setQuality] = useState<"pass" | "caution" | "fail">("pass");
  const [entropyScore, setEntropyScore] = useState(0.847);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const drawSpectrum = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      // Clear canvas
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = "rgba(107, 33, 168, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      [0.25, 0.5, 0.75].forEach((pct) => {
        const y = height * (1 - pct);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      const barCount = 64;
      const barWidth = width / barCount - 2;
      const gap = 2;

      // Update bar heights with smooth interpolation
      for (let i = 0; i < barCount; i++) {
        const targetHeight = isCapturing 
          ? Math.random() * 0.8 + 0.2 // Random heights when capturing
          : 0.05; // Minimal when not capturing
        
        barsRef.current[i] = barsRef.current[i] * 0.85 + targetHeight * 0.15;
      }

      // Draw bars
      barsRef.current.forEach((barHeight, i) => {
        const x = i * (barWidth + gap);
        const h = barHeight * (height - 40);
        const y = height - h - 20;

        // Color based on frequency band
        let gradient;
        if (i < 20) {
          // Low frequencies - cyan
          gradient = ctx.createLinearGradient(x, y + h, x, y);
          gradient.addColorStop(0, "#06b6d4");
          gradient.addColorStop(1, "#22d3ee");
        } else if (i < 45) {
          // Mid frequencies - violet
          gradient = ctx.createLinearGradient(x, y + h, x, y);
          gradient.addColorStop(0, "#8b5cf6");
          gradient.addColorStop(1, "#a78bfa");
        } else {
          // High frequencies - bright cyan
          gradient = ctx.createLinearGradient(x, y + h, x, y);
          gradient.addColorStop(0, "#06b6d4");
          gradient.addColorStop(1, "#67e8f9");
        }

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.shadowColor = i < 20 ? "#06b6d4" : i < 45 ? "#8b5cf6" : "#22d3ee";
        
        // Draw rounded bar
        const radius = 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, [radius, radius, 0, 0]);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationRef.current = requestAnimationFrame(drawSpectrum);
    };

    drawSpectrum();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isCapturing]);

  return (
    <section className="bg-slate-900 border border-purple-800/50 rounded-xl p-4" aria-label="Spectrum Analyzer">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-[300px] lg:h-[400px] rounded-lg"
        style={{ boxShadow: "inset 0 0 10px rgba(107, 33, 168, 0.2)" }}
        aria-label="Frequency spectrum analyzer"
      />

      {/* Metrics below canvas */}
      <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-cyan-400">
            Spectral Entropy: {entropyScore.toFixed(3)}/1.0
          </span>
          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${entropyScore * 100}%` }}
            />
          </div>
        </div>

        <span className="font-mono text-xs text-slate-400">
          ZCR: 0.234 [Range: 0.1-0.8]
        </span>

        <span className="font-mono text-xs text-slate-400">
          RMS Level: -18.5 dB
        </span>
      </div>

      {/* Quality indicator */}
      <div className="flex flex-wrap justify-between items-center mt-3 gap-4">
        <div className="flex items-center gap-2">
          {quality === "pass" && (
            <span className="font-mono text-[11px] text-green-500">
              ✓ Quality: PASS (entropy_score: 82)
            </span>
          )}
          {quality === "caution" && (
            <span className="font-mono text-[11px] text-amber-500">
              ⚠️ Quality: CAUTION (low entropy)
            </span>
          )}
          {quality === "fail" && (
            <span className="font-mono text-[11px] text-red-500">
              ✗ Quality: FAIL (static detected)
            </span>
          )}
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] text-slate-500">
            Microphone: MacBook Pro Built-in Microphone
          </p>
          <p className="font-mono text-[10px] text-slate-500">
            Sample Rate: 44100 Hz | Channels: 1 (Mono)
          </p>
        </div>
      </div>
    </section>
  );
};
