# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (Turbopack)
npm run dev

# Build
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest src/lib/__tests__/file-system.test.ts

# Reset the database
npm run db:reset
```

## Architecture

UIGen is a Next.js 15 (App Router) application that lets users describe React components in a chat, generates them via Claude AI, and renders a live preview — all without writing files to disk.

### Virtual File System

All generated code lives in an in-memory `VirtualFileSystem` (`src/lib/file-system.ts`). It is serialized to JSON for every chat request and stored in the Prisma `Project.data` column (as a JSON string) for authenticated users. The file system is never written to the host filesystem.

### AI Integration

The chat API route (`src/app/api/chat/route.ts`) uses the Vercel AI SDK (`streamText`) with two custom tools:

- **`str_replace_editor`** (`src/lib/tools/str-replace.ts`) — `create`, `str_replace`, and `insert` commands that mutate the VirtualFileSystem
- **`file_manager`** (`src/lib/tools/file-manager.ts`) — `rename` and `delete` commands

The model is `claude-haiku-4-5`. When `ANTHROPIC_API_KEY` is absent, a `MockLanguageModel` (`src/lib/provider.ts`) returns static pre-written components instead.

### Live Preview

`PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) reads the VirtualFileSystem on every `refreshTrigger` change and:
1. Transpiles JSX/TSX via `@babel/standalone` in-browser (`src/lib/transform/jsx-transformer.ts`)
2. Converts each file to a blob URL
3. Builds an ES Module import map (third-party packages resolved via `esm.sh`)
4. Injects everything into a sandboxed `<iframe>` via `srcdoc`

The preview entry point is auto-detected in order: `/App.jsx`, `/App.tsx`, `/index.jsx`, `/index.tsx`, `/src/App.jsx`, `/src/App.tsx`.

### Context Architecture

Two React contexts wire the client side together:

- **`FileSystemContext`** (`src/lib/contexts/file-system-context.tsx`) — owns the VirtualFileSystem instance, exposes CRUD helpers, and processes incoming AI tool calls via `handleToolCall`
- **`ChatContext`** (`src/lib/contexts/chat-context.tsx`) — wraps the Vercel AI SDK `useChat` hook; serializes the file system into every request body and routes tool call callbacks to `FileSystemContext.handleToolCall`

`FileSystemContext` must be a parent of `ChatContext`.

### Authentication

Custom JWT auth using `jose` — no external auth provider. Sessions are stored in an `httpOnly` cookie (`auth-token`), signed with `JWT_SECRET` (falls back to a hardcoded dev key). Server-side helpers are in `src/lib/auth.ts` (marked `server-only`). The `src/middleware.ts` guards the `/api/` routes. The `use-auth` hook (`src/hooks/use-auth.ts`) handles client-side sign-in/sign-up flows.

Anonymous users can generate components; their work is persisted in `sessionStorage` (`src/lib/anon-work-tracker.ts`) and can be promoted to a saved project on sign-up.

### Database

Prisma with SQLite (`prisma/dev.db`). The Prisma client is generated into `src/generated/prisma`. Two models:
- `User` — email + bcrypt-hashed password
- `Project` — `messages` (JSON string array) and `data` (serialized VirtualFileSystem JSON) columns

### Key Environment Variables

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Required for real AI generation; omit to use the mock provider |
| `JWT_SECRET` | Signs session tokens; defaults to an insecure dev value |
