# FTA — Frontend

Next.js 15 (App Router) frontend for the Finance Transformation Agent.

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- Next.js 15, App Router
- Tailwind CSS + Shadcn/ui primitives
- TanStack Table (data grids)
- Framer Motion (agent state transitions)
- @xyflow/react (process flow maps)
- Zustand (UI state) + TanStack Query (server state)
- @microsoft/fetch-event-source (SSE consumption)

## Structure

```
src/
├── app/                              # App Router pages
│   ├── page.tsx                      # Landing (pursuits + engagements)
│   ├── pursue/[pursuitId]/           # Pursuit phase (Scoping Canvas)
│   └── [engagementId]/deliverables/  # Delivery workspaces
├── components/
│   ├── workspace/                    # AnnotatedTable, ProcessFlowMap, etc.
│   └── pursue/                       # ScopingCanvas, ThemePanel
├── hooks/                            # useWorkshopKeyboard, etc.
└── lib/                              # Types, stores, mock data, API client
```

See the root [README.md](../README.md) for full project documentation.
