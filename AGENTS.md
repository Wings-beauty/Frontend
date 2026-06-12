# WINGS Frontend Agent Guide

## Project Map

- `README.md` - basic project notes.
- `docs/ARCHITECTURE.md` - application architecture, Supabase schema, and user flows.
- `docs/DESIGN.md` - design system notes, Tailwind color tokens, typography, and Lazyweb MCP guidance.
- `src/app` - Next.js App Router routes. Each route imports a view from `src/views`.
- `src/views` - client-side page components and product/admin/user workflows.
- `src/api` - browser-side API adapters and fetch wrappers.
- `src/lib` - shared client setup such as Supabase and router compatibility helpers.
- `src/constants` - tone, product, inquiry, and design-adjacent constants.
- `src/types` - generated or maintained domain and Supabase types.
- `src/index.css` - Tailwind v4 theme tokens and global CSS.
- `public` - static images and Mediapipe WASM assets.

## Commands

- `npm run dev` - run Next.js locally.
- `npm run build` - production build and type check.
- `npm run lint` - ESLint.
- `npm install` - refresh dependencies after package changes.

## Working Rules

- This project is a Next.js App Router app. Do not reintroduce Vite entry files or `react-router-dom` routing.
- Add new screens under `src/views`, then expose them through `src/app/**/page.tsx`.
- Keep shared Supabase/table assumptions synchronized with `docs/ARCHITECTURE.md` and `src/types/supabase.ts`.
- Keep visual token changes synchronized with `docs/DESIGN.md` and `src/index.css`.
- For design research, critique, or reference gathering, remember that the Lazyweb MCP/plugin is available in this Codex environment. Use it before making broad visual redesign decisions.
- Prefer small, verified changes. Run `npm run build` and `npm run lint` after routing, type, or design-system updates.
