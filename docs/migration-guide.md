# Migration Guide: Monorepo to Standalone Node UI

This guide covers migrating the Node UI from the Turborepo monorepo structure to a standalone, self-hostable package.

## Before/After Structure

### Before (Monorepo)

```
dekaos/
├── turbo.json
├── package.json (workspace root)
├── apps/
│   ├── landing/
│   ├── dashboard/
│   └── node-ui/           # <- This gets extracted
│       ├── package.json   # Has workspace:* dependencies
│       └── src/
├── packages/
│   ├── types/             # @dekaos/types
│   ├── ui/                # @dekaos/ui
│   └── config/            # @dekaos/config
└── crates/
    └── dekaos-node/       # Rust daemon
```

### After (Standalone)

```
dekaos-node-ui/            # Standalone repo
├── package.json           # No workspace dependencies
├── src/
│   ├── components/node/   # Node-specific components
│   ├── config/node.ts     # Standalone config
│   ├── services/nodeApi.ts # Daemon API service
│   ├── types/node.ts      # Extracted types
│   └── pages/NodeUI.tsx
├── node-ui/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── .env.example
└── docs/
    └── operator-guide.md
```

## Step-by-Step Migration

### 1. Create New Repository

```bash
# Create new repo
mkdir dekaos-node-ui
cd dekaos-node-ui
git init

# Copy Node UI source
cp -r ../dekaos/apps/node-ui/src ./src
cp -r ../dekaos/apps/node-ui/public ./public
```

### 2. Create Standalone package.json

```json
{
  "name": "dekaos-node-ui",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "lucide-react": "^0.462.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "class-variance-authority": "^0.7.1",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-tooltip": "^1.2.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.7.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vite": "^5.4.1"
  }
}
```

### 3. Update Imports

Replace all workspace package imports:

```typescript
// Before (monorepo)
import { Button } from "@dekaos/ui";
import { NodeStatus } from "@dekaos/types";
import { config } from "@dekaos/config";

// After (standalone)
import { Button } from "@/components/ui/button";
import { NodeStatus } from "@/types/node";
import { NODE_API_URL } from "@/config/node";
```

### 4. Extract Types

Create `src/types/node.ts` with all node-related types:

```typescript
// Previously from @dekaos/types
export interface NodeStatus {
  node_id: string;
  is_capturing: boolean;
  is_paused: boolean;
  // ... rest of types
}
```

### 5. Create Config Module

Create `src/config/node.ts`:

```typescript
// Previously from @dekaos/config or environment
export const NODE_API_URL = 
  import.meta.env.VITE_NODE_API_URL || "http://localhost:3001/api";

export const NODE_ENDPOINTS = {
  health: `${NODE_API_URL}/health`,
  status: `${NODE_API_URL}/status`,
  // ... rest of endpoints
};
```

### 6. Create API Service

Create `src/services/nodeApi.ts`:

```typescript
// Replaces direct fetch calls and adds fallback
import { NODE_ENDPOINTS } from "@/config/node";

export const nodeApi = {
  async getHealth() {
    try {
      const res = await fetch(NODE_ENDPOINTS.health);
      return { success: true, data: await res.json() };
    } catch {
      return { success: false, data: mockHealth };
    }
  },
  // ... rest of API methods
};
```

### 7. Update Tailwind Config

Ensure design tokens are standalone:

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6",
        secondary: "#06b6d4",
        accent: "#f59e0b",
        // No references to external packages
      },
    },
  },
};
```

### 8. Remove Turborepo Config

Delete or ignore:
- `turbo.json`
- `pnpm-workspace.yaml` / `lerna.json`
- Workspace protocol dependencies

### 9. Update Build Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "docker:build": "docker build -f node-ui/Dockerfile -t dekaos-node-ui .",
    "docker:run": "docker run -p 3000:3000 dekaos-node-ui"
  }
}
```

### 10. Add Docker Support

Copy Docker files:
- `node-ui/Dockerfile`
- `node-ui/docker-compose.yml`
- `node-ui/nginx.conf`
- `node-ui/.env.example`

## Verification Checklist

- [ ] `npm install` works without workspace errors
- [ ] `npm run build` produces valid output
- [ ] No `@dekaos/*` imports remain
- [ ] All types are locally defined
- [ ] Config uses environment variables
- [ ] Docker build succeeds
- [ ] UI loads with mock fallback (no daemon)
- [ ] UI connects to daemon when available

## Common Issues

### Import Errors

```bash
# Find remaining workspace imports
grep -r "@dekaos/" src/
```

### Missing Types

If TypeScript errors, ensure all types are extracted:

```bash
# List all type imports from old packages
grep -r "from '@dekaos/types'" src/
```

### Build Failures

Check `vite.config.ts` doesn't reference workspace aliases:

```typescript
// Remove any workspace-specific aliases
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
    // Remove: "@dekaos/ui": ...
  },
},
```

## Daemon CORS Update

If the daemon needs to accept requests from the standalone UI:

```rust
// crates/dekaos-node/src/api.rs
let cors = CorsLayer::new()
    .allow_origin(Any) // Or specific origins
    .allow_methods([Method::GET, Method::POST])
    .allow_headers(Any);
```

Or via environment:

```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://node.yourdomain.com
```
