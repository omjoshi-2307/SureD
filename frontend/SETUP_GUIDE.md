# Setup Guide: TypeScript, Tailwind CSS, & shadcn/ui

This guide describes how to configure TypeScript, Tailwind CSS, and shadcn/ui in a React Vite project.

---

## 1. Setting Up TypeScript

To add TypeScript to a React project generated with Vite:

1. **Install TypeScript and types**:
   ```bash
   npm install -D typescript @types/react @types/react-dom @types/node
   ```

2. **Initialize TypeScript configuration**:
   Create a `tsconfig.json` at the root of the React project:
   ```json
   {
     "files": [],
     "references": [
       { "path": "./tsconfig.app.json" },
       { "path": "./tsconfig.node.json" }
     ]
   }
   ```

   Create `tsconfig.app.json` (for frontend source files):
   ```json
   {
     "compilerOptions": {
       "composite": true,
       "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
       "target": "ES2022",
       "useDefineForClassFields": true,
       "lib": ["DOM", "DOM.Iterable", "ES2022"],
       "module": "ESNext",
       "skipLibCheck": true,

       /* Bundler mode */
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true,
       "jsx": "react-jsx",

       /* Linting */
       "strict": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noFallthroughCasesInSwitch": true,

       /* Path Aliases */
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     },
     "include": ["src"]
   }
   ```

   Create `tsconfig.node.json` (for configurations like `vite.config.ts`):
   ```json
   {
     "compilerOptions": {
       "composite": true,
       "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
       "target": "ES2022",
       "lib": ["ES2022"],
       "module": "ESNext",
       "skipLibCheck": true,
       "moduleResolution": "bundler",
       "allowImportingTsExtensions": true,
       "resolveJsonModule": true,
       "isolatedModules": true,
       "noEmit": true
     },
     "include": ["vite.config.ts"]
   }
   ```

3. **Configure path mapping in Vite**:
   Rename `vite.config.js` to `vite.config.ts` and set up the path resolution alias `@/*` to `src/*`:
   ```typescript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwindcss from '@tailwindcss/vite'
   import path from 'path'

   export default defineConfig({
     plugins: [
       react(),
       tailwindcss(),
     ],
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

4. **Change file extensions**:
   Rename main entry files from `.jsx` to `.tsx` (e.g. `src/main.jsx` -> `src/main.tsx`, `src/App.jsx` -> `src/App.tsx`).

5. **Update entry point script**:
   In `index.html`, modify the script tag:
   ```html
   <script type="module" src="/src/main.tsx"></script>
   ```

---

## 2. Setting Up Tailwind CSS v4

To install and set up Tailwind CSS v4 with Vite:

1. **Install Tailwind CSS and its Vite plugin**:
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```

2. **Add the plugin to Vite**:
   Import and add the `@tailwindcss/vite` plugin in `vite.config.ts`:
   ```typescript
   import tailwindcss from '@tailwindcss/vite'
   // Add tailwindcss() to plugins array
   ```

3. **Import Tailwind in CSS**:
   In `src/index.css`, include the Tailwind directive:
   ```css
   @import "tailwindcss";
   ```

---

## 3. Setting Up shadcn/ui Structure

To set up shadcn/ui in the project, run the shadcn init CLI:

```bash
npx shadcn@latest init
```

The CLI will prompt you to:
- Choose a style (Default vs New York)
- Choose a base color (Slate, Zinc, etc.)
- Confirm configuration paths:
  - **Component path**: `src/components`
  - **Utility function path**: `src/lib/utils`
  - **CSS styles path**: `src/index.css`

The CLI creates a `components.json` configuration file at the root.

---

## 4. Default Path Analysis & Importance of `/components/ui`

### Default Paths
* **Components path**: `src/components` (configured as `@/components` via import aliases)
* **Reusable UI Primitives path**: `src/components/ui` (configured as `@/components/ui`)
* **Styles path**: `src/index.css`

### Why `/components/ui` is Critical
If the default path for components is not `/components/ui` (or `@/components/ui`), creating this folder structure manually or via configuration is important for several reasons:

1. **Standardization & CLI Automation**: 
   The shadcn CLI is designed to download, update, and manage base UI primitives (such as Button, Dialog, Input, Card) inside the `@/components/ui` folder. Keeping this default makes CLI commands like `npx shadcn add button` work out-of-the-box without paths mismatches.
   
2. **Separation of Concerns**: 
   - **`/components/ui/`** contains atomic, reusable, design-system-level widgets (buttons, dropdowns, inputs, checkboxes) that are agnostic to page business logic.
   - **`/components/`** or **`/components/blocks/`** contains aggregate page-level layouts or feature components (like headers, sidebars, charts, or specific forms).
   This isolation keeps the codebase clean, highly searchable, and structured.
   
3. **Clean Imports & Aliases**:
   Path mapping allows components to be imported cleanly:
   ```typescript
   import { Button } from "@/components/ui/button"
   ```
   Instead of fragile relative imports:
   ```typescript
   import { Button } from "../../../components/ui/button"
   ```
