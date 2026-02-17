# FTA Agent - Development Guide

## Project Overview

Financial Technology Advisory Agent: an AI-powered consulting tool for P&C insurance chart-of-accounts design on SAP S/4HANA. The backend is Python/FastAPI with LangGraph agents; the frontend is Next.js.

## Architecture

- **Backend**: Python 3.12, FastAPI, LangGraph, DuckDB + Polars, Pydantic v2
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, TanStack Table
- **Monorepo**: `src/fta_agent/` for backend, `web/` for frontend

## Frontend Design Standards

### Typography
Use system font stack with a distinctive serif for headings:
- Headings: `"Instrument Serif", Georgia, "Times New Roman", serif`
- Body: `"DM Sans", system-ui, -apple-system, sans-serif`
- Monospace/data: `"JetBrains Mono", "Fira Code", monospace`

Do not use Inter, Roboto, or default sans-serif for everything.

### Color Palette
Professional finance aesthetic with intentional accent colors:
- Background: `#0F172A` (slate-900), `#1E293B` (slate-800)
- Surface: `#334155` (slate-700), `#475569` (slate-600)
- Text primary: `#F8FAFC` (slate-50)
- Text secondary: `#CBD5E1` (slate-300)
- Accent blue: `#3B82F6` (blue-500)
- Success: `#22C55E` (green-500)
- Warning: `#F59E0B` (amber-500)
- Error/Critical: `#EF4444` (red-500)
- Info: `#06B6D4` (cyan-500)

### Component Standards
- Use TanStack Table for all data tables (sorting, filtering, pagination)
- Status badges use semantic colors: CRIT=red, HIGH=amber, MED=blue, LOW=slate, INFO=cyan
- Confidence badges: HIGH=green, MED=amber, LOW=red
- Decision status: PROPOSED=blue, PENDING=amber, DECIDED=green, REVISED=purple
- Summary cards: consistent height, icon + metric + label pattern
- Animations: subtle, functional transitions only (no gratuitous motion)
- Accessibility: WCAG AA contrast ratios, keyboard navigation, aria labels

### Anti-Patterns (Do Not)
- Do not use generic gray-on-white corporate dashboard aesthetic
- Do not use rounded-full buttons everywhere
- Do not add loading spinners that spin for 50ms
- Do not use placeholder text as labels
- Do not add tooltips to self-explanatory elements

## Backend Standards

### API Design
- Async-first: all endpoints are async
- Pydantic v2 schemas with Field constraints for all request/response models
- CORS configured for localhost:3000 (frontend dev server)
- RESTful: GET for reads, PATCH for partial updates
- Structured error responses via HTTPException

### Data Layer
- DuckDB for local storage (no external database in V1)
- Polars DataFrames for in-memory data manipulation
- Dual schema pattern: Pydantic model + Polars schema dict for every entity
- DataEngine class wraps DuckDB connection

### Domain Prompt Architecture
- Modular prompt package: `agents/prompts/`
- `build_system_prompt()` assembles from core + translation + industry + platform modules
- Industry and platform are parameterized (only P&C + SAP in V1)
- Prompts are plain strings, not templates with variables

### Testing
- pytest with asyncio mode
- No LLM calls in unit tests (mock API keys, test graph structure only)
- Pydantic model tests: instantiation, enum validation, field alignment
- Routing tests: regex keyword matching (deterministic)

### Code Style
- ruff for linting and formatting (line-length=88)
- mypy strict mode
- `from __future__ import annotations` on all source files
- StrEnum for all categorical fields
- Type annotations on all function signatures
