import { useState } from "react";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlaygroundControlsProps {
  onGenerate: (count: number, outputFormat: string) => void;
  isLoading: boolean;
  showAsJson: boolean;
  onShowAsJsonChange: (value: boolean) => void;
}

export const PlaygroundControls = ({
  onGenerate,
  isLoading,
  showAsJson,
  onShowAsJsonChange,
}: PlaygroundControlsProps) => {
  const [endpoint, setEndpoint] = useState("/randomness/generate");
  const [count, setCount] = useState(10);
  const [outputFormat, setOutputFormat] = useState("integer");

  const calculateCost = () => {
    return (count * 0.01).toFixed(2);
  };

  const handleGenerate = () => {
    onGenerate(count, outputFormat);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-lg font-bold text-foreground">
        Randomness Generator
      </h2>

      {/* Endpoint Selector */}
      <div className="space-y-2">
        <Label htmlFor="endpoint" className="text-sm font-semibold">
          Endpoint
        </Label>
        <Select value={endpoint} onValueChange={setEndpoint}>
          <SelectTrigger className="font-mono text-sm">
            <SelectValue placeholder="Select endpoint" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="/randomness/generate" className="font-mono text-sm">
              /randomness/generate
            </SelectItem>
            <SelectItem value="/randomness/vrf" className="font-mono text-sm">
              /randomness/vrf
            </SelectItem>
            <SelectItem value="/randomness/seed" className="font-mono text-sm">
              /randomness/seed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Count Parameter */}
      <div className="space-y-2">
        <Label htmlFor="count" className="text-sm font-semibold">
          Number of Random Values
        </Label>
        <Input
          id="count"
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) => setCount(Math.min(1000, Math.max(1, parseInt(e.target.value) || 1)))}
          className="font-mono"
        />
      </div>

      {/* Output Format */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Output Format</Label>
        <RadioGroup value={outputFormat} onValueChange={setOutputFormat}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="integer" id="integer" />
            <label htmlFor="integer" className="text-sm cursor-pointer">
              Integer (0-2³²)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="float" id="float" />
            <label htmlFor="float" className="text-sm cursor-pointer">
              Float (0.0-1.0)
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bytes" id="bytes" />
            <label htmlFor="bytes" className="text-sm cursor-pointer">
              Bytes (Base64)
            </label>
          </div>
        </RadioGroup>
      </div>

      {/* Response Format Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showJson"
          checked={showAsJson}
          onCheckedChange={(checked) => onShowAsJsonChange(!!checked)}
        />
        <label htmlFor="showJson" className="text-sm cursor-pointer">
          Show as JSON
        </label>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800">
          Uses your live API key for testing. Results are actual random values from the deKAOS network.
        </p>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Randomness"
        )}
      </Button>

      {/* Cost Display */}
      <p className="text-xs text-amber-600 text-center">
        Estimated Cost: {calculateCost()} credits
      </p>
    </div>
  );
};
