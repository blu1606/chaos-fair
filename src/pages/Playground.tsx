import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { PlaygroundControls } from "@/components/dashboard/PlaygroundControls";
import { PlaygroundOutput } from "@/components/dashboard/PlaygroundOutput";

export interface PlaygroundResult {
  epoch: number;
  count: number;
  data: number[];
  timestamp: string;
  latency_ms: number;
  signature: string;
  proof: string;
}

const Playground = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAsJson, setShowAsJson] = useState(true);

  const handleGenerate = async (count: number, outputFormat: string) => {
    setIsLoading(true);
    setError(null);
    
    // Simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock random data
    const generateRandomData = () => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        if (outputFormat === "float") {
          data.push(parseFloat(Math.random().toFixed(6)));
        } else {
          data.push(Math.floor(Math.random() * 4294967295));
        }
      }
      return data;
    };

    const mockResult: PlaygroundResult = {
      epoch: Math.floor(Math.random() * 2000) + 1000,
      count,
      data: generateRandomData(),
      timestamp: new Date().toISOString(),
      latency_ms: Math.floor(Math.random() * 50) + 20,
      signature: "0x5a8b" + Math.random().toString(36).substring(2, 10) + "...",
      proof: "verifiable"
    };

    setResult(mockResult);
    setIsLoading(false);
  };

  const handleRetry = () => {
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-16'}`}>
        <DashboardHeader sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="bg-background rounded-lg border border-border p-6 lg:p-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Left Panel: Controls */}
              <div className="lg:w-1/2 lg:border-r lg:border-border lg:pr-8">
                <PlaygroundControls
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  showAsJson={showAsJson}
                  onShowAsJsonChange={setShowAsJson}
                />
              </div>

              {/* Right Panel: Output */}
              <div className="lg:w-1/2 lg:pl-2 min-h-[500px]">
                <PlaygroundOutput
                  result={result}
                  isLoading={isLoading}
                  error={error}
                  showAsJson={showAsJson}
                  onRetry={handleRetry}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Playground;
