import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CodeTab = 'sdk' | 'curl';

const sdkCode = `import { dekaos } from '@dekaos/sdk';

// Initialize client
const client = dekaos.init({
  apiKey: process.env.DEKAOS_API_KEY
});

// Generate random numbers
const result = await client.generate({
  count: 10,
  min: 1,
  max: 100
});

console.log(result.data);`;

const curlCode = `curl -X POST https://api.dekaos.io/v1/randomness \\
  -H "Authorization: Bearer $DEKAOS_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "count": 10,
    "min": 1,
    "max": 100
  }'`;

const generateMockOutput = () => {
  const data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
  return {
    epoch: Math.floor(Math.random() * 2000) + 1000,
    count: 10,
    data,
    timestamp: new Date().toISOString(),
    latency_ms: Math.floor(Math.random() * 50) + 30
  };
};

const initialOutput = {
  epoch: 1247,
  count: 10,
  data: [42, 87, 13, 56, 91, 28, 74, 35, 69, 8],
  timestamp: "2024-01-15T10:42:15.123Z",
  latency_ms: 48
};

const DevPlaygroundSection = () => {
  const [activeTab, setActiveTab] = useState<CodeTab>('sdk');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState(initialOutput);

  const currentCode = activeTab === 'sdk' ? sdkCode : curlCode;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call with random delay
    setTimeout(() => {
      setOutput(generateMockOutput());
      setIsGenerating(false);
    }, 800 + Math.random() * 700);
  };

  // Calculate stats from current output
  const stats = {
    min: Math.min(...output.data),
    max: Math.max(...output.data),
    mean: Math.round(output.data.reduce((a, b) => a + b, 0) / output.data.length),
  };

  return (
    <section id="dev-playground-preview" className="relative py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-4">
            Try <span className="text-gradient-primary">deKAOS</span> in 30 seconds.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Run a sample randomness call right from this page.
          </p>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Left: Code block */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-900 overflow-hidden">
            {/* Tab switcher + Copy button */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('sdk')}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'sdk'
                      ? 'bg-primary text-white'
                      : 'bg-transparent border border-slate-600 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  SDK (TypeScript)
                </button>
                <button
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                    activeTab === 'curl'
                      ? 'bg-primary text-white'
                      : 'bg-transparent border border-slate-600 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  cURL
                </button>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-slate-700/50 transition-colors"
                aria-label="Copy code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code content */}
            <div className="p-4 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                <code className="text-slate-300">
                  {currentCode.split('\n').map((line, i) => (
                    <div key={i} className="flex">
                      <span className="select-none w-8 text-slate-600 text-right pr-4">
                        {i + 1}
                      </span>
                      <span>
                        {line
                          .replace(/(import|from|const|await|console)/g, '<keyword>$1</keyword>')
                          .replace(/('.*?'|".*?")/g, '<string>$1</string>')
                          .replace(/(\/\/.*)/g, '<comment>$1</comment>')
                          .split(/(<keyword>.*?<\/keyword>|<string>.*?<\/string>|<comment>.*?<\/comment>)/)
                          .map((part, j) => {
                            if (part.startsWith('<keyword>')) {
                              return <span key={j} className="text-primary">{part.replace(/<\/?keyword>/g, '')}</span>;
                            } else if (part.startsWith('<string>')) {
                              return <span key={j} className="text-secondary">{part.replace(/<\/?string>/g, '')}</span>;
                            } else if (part.startsWith('<comment>')) {
                              return <span key={j} className="text-slate-500">{part.replace(/<\/?comment>/g, '')}</span>;
                            }
                            return part;
                          })}
                      </span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {/* Right: Output + Stats */}
          <div className="space-y-4">
            {/* JSON Output */}
            <div className="rounded-xl border border-slate-700/50 bg-slate-900 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                <span className="text-xs font-mono text-muted-foreground">Response</span>
                <span className="text-xs font-mono text-emerald-400">200 OK</span>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed">
                  <code>
                    <span className="text-slate-500">{'{'}</span>{'\n'}
                    <span className="text-slate-300">  </span>
                    <span className="text-primary">"epoch"</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-accent">{output.epoch}</span>
                    <span className="text-slate-500">,</span>{'\n'}
                    
                    <span className="text-slate-300">  </span>
                    <span className="text-primary">"count"</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-accent">{output.count}</span>
                    <span className="text-slate-500">,</span>{'\n'}
                    
                    <span className="text-slate-300">  </span>
                    <span className="text-primary">"data"</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-secondary">[{output.data.join(', ')}]</span>
                    <span className="text-slate-500">,</span>{'\n'}
                    
                    <span className="text-slate-300">  </span>
                    <span className="text-primary">"timestamp"</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-secondary">"{output.timestamp}"</span>
                    <span className="text-slate-500">,</span>{'\n'}
                    
                    <span className="text-slate-300">  </span>
                    <span className="text-primary">"latency_ms"</span>
                    <span className="text-slate-500">: </span>
                    <span className="text-accent">{output.latency_ms}</span>{'\n'}
                    <span className="text-slate-500">{'}'}</span>
                  </code>
                </pre>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Min', value: stats.min, color: 'text-secondary' },
                { label: 'Max', value: stats.max, color: 'text-primary' },
                { label: 'Mean', value: stats.mean, color: 'text-accent' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-lg bg-slate-900 border border-slate-700/50 text-center"
                >
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className={`font-mono text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Generate button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate sample output
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          No API key needed for this demo. Get your free key in the{' '}
          <a href="/dashboard" className="text-primary hover:underline">
            Developer Dashboard
          </a>
          .
        </motion.p>
      </div>
    </section>
  );
};

export default DevPlaygroundSection;