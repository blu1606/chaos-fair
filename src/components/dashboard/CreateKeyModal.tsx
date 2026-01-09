import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface CreateKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateKeyModal = ({ open, onOpenChange }: CreateKeyModalProps) => {
  const [keyName, setKeyName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({
    readRandomness: true,
    readUsage: true,
    manageKeys: false,
  });
  const [rateLimit, setRateLimit] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!keyName.trim()) {
      setError("Key name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      description: "API key created successfully!",
    });

    // Reset form
    setKeyName("");
    setDescription("");
    setPermissions({ readRandomness: true, readUsage: true, manageKeys: false });
    setRateLimit("100");
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setError("");
    setKeyName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold">
            Create New API Key
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Key Name */}
          <div className="space-y-2">
            <Label htmlFor="keyName" className="text-sm font-semibold">
              Key Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="keyName"
              placeholder="e.g., Mobile App, Game Backend"
              value={keyName}
              onChange={(e) => {
                setKeyName(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Optional. E.g., API key for iOS game..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Permissions */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="readRandomness"
                  checked={permissions.readRandomness}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, readRandomness: !!checked })
                  }
                />
                <label
                  htmlFor="readRandomness"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Read Randomness
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="readUsage"
                  checked={permissions.readUsage}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, readUsage: !!checked })
                  }
                />
                <label
                  htmlFor="readUsage"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Read Usage
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manageKeys"
                  checked={permissions.manageKeys}
                  onCheckedChange={(checked) =>
                    setPermissions({ ...permissions, manageKeys: !!checked })
                  }
                />
                <label
                  htmlFor="manageKeys"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Manage Keys (Admin only)
                </label>
              </div>
            </div>
          </div>

          {/* Rate Limit */}
          <div className="space-y-2">
            <Label htmlFor="rateLimit" className="text-sm font-semibold">
              Rate Limit
            </Label>
            <Select value={rateLimit} onValueChange={setRateLimit}>
              <SelectTrigger>
                <SelectValue placeholder="Select rate limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100/min (Free tier)</SelectItem>
                <SelectItem value="1000">1,000/min</SelectItem>
                <SelectItem value="10000">10,000/min</SelectItem>
                <SelectItem value="unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            {isSubmitting ? "Creating..." : "Create Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
