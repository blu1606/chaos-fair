import { useState } from "react";
import { Copy, Check, MoreVertical, BarChart3, RefreshCw, AlertTriangle, Key } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface APIKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: "active" | "inactive";
}

const mockKeys: APIKey[] = [
  {
    id: "1",
    name: "Mobile App",
    key: "kaos_xK9mZ8hN3pQ7wR2tY6uI1oP4aS5dF0gH",
    created: "Jan 15, 2024",
    lastUsed: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Game Backend",
    key: "kaos_dF2hN9kL4mB7vC1xZ0qW3eR6tY8uI5oP",
    created: "Dec 10, 2023",
    lastUsed: null,
    status: "inactive",
  },
  {
    id: "3",
    name: "Web Dashboard",
    key: "kaos_pQ7wR2tY6uI1oP4aS5dF0gH8jK3lM9nB",
    created: "Jan 18, 2024",
    lastUsed: "5 minutes ago",
    status: "active",
  },
];

export const APIKeysTable = () => {
  const [keys] = useState<APIKey[]>(mockKeys);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const maskKey = (key: string) => {
    return `${key.slice(0, 10)}...${key.slice(-5)}`;
  };

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast({
      description: "API key copied to clipboard",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (keys.length === 0) {
    return (
      <div className="bg-background border border-border rounded-lg p-12 text-center">
        <Key className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          No API keys yet. Create your first key to get started.
        </p>
        <Button className="bg-gradient-to-r from-primary to-primary/80">
          Create Key
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Key Name</TableHead>
            <TableHead className="font-semibold text-foreground">Key</TableHead>
            <TableHead className="font-semibold text-foreground hidden md:table-cell">Created</TableHead>
            <TableHead className="font-semibold text-foreground hidden lg:table-cell">Last Used</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground w-[60px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.map((apiKey) => (
            <TableRow key={apiKey.id} className="hover:bg-slate-50/50">
              <TableCell className="font-semibold text-foreground">
                {apiKey.name}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-muted-foreground">
                    {maskKey(apiKey.key)}
                  </code>
                  <button
                    onClick={() => handleCopy(apiKey.key, apiKey.id)}
                    className="p-1 hover:bg-muted rounded transition-colors"
                    aria-label="Copy API key"
                  >
                    {copiedId === apiKey.id ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                    )}
                  </button>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                {apiKey.created}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className={`text-sm ${apiKey.lastUsed ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {apiKey.lastUsed || "Never"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${
                    apiKey.status === "active"
                      ? "bg-green-500/10 text-green-600 border border-green-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    apiKey.status === "active" ? "bg-green-500" : "bg-muted-foreground"
                  }`} />
                  {apiKey.status === "active" ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleCopy(apiKey.key, apiKey.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Key
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Requests
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Revoke
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
