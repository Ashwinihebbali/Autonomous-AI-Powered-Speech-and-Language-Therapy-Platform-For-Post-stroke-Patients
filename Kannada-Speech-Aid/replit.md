# Workspace

## Overview

AI-Assisted Kannada Speech Therapy application for post-stroke patients. Includes guided exercises, speech recognition with AI feedback, progress tracking, and a therapist monitoring dashboard.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Routing**: Wouter
- **AI**: OpenAI via Replit AI Integrations (speech transcription + feedback)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/                 # Express API server
│   └── kannada-speech-therapy/     # React frontend
├── lib/                            # Shared libraries
│   ├── api-spec/                   # OpenAPI spec + Orval codegen config
│   ├── api-client-react/           # Generated React Query hooks
│   ├── api-zod/                    # Generated Zod schemas from OpenAPI
│   ├── db/                         # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/  # OpenAI server-side integration
│   └── integrations-openai-ai-react/   # OpenAI React hooks
├── scripts/                        # Utility scripts
│   └── src/seed-exercises.ts       # Exercise + patient seeding script
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

1. **Patient flow**: Select patient → choose exercise category → record speech → get AI feedback
2. **Exercise categories**: Vowels, Consonants, Words, Sentences (with difficulty levels)
3. **Speech transcription**: Records microphone audio, sends to OpenAI Whisper via `/api/speech/transcribe`
4. **AI feedback**: GPT-5.2 evaluates pronunciation accuracy, provides encouraging feedback and tips
5. **Progress tracking**: Weekly score charts, category breakdowns, session history
6. **Therapist dashboard**: View all patients, monitor progress, add new patients

## DB Schema

- `exercises` — Kannada text, transliteration, English meaning, category, difficulty
- `patients` — Name, age, condition, therapist notes
- `therapy_sessions` — Linked to patients, start/end time, status
- `speech_attempts` — Linked to sessions + exercises, spoken text, accuracy score, AI feedback
- `conversations` + `messages` — OpenAI chat history (from integration template)

## Seed Data

Run seed with:
```bash
pnpm --filter @workspace/scripts run seed-exercises
```

This seeds 46 exercises (Kannada vowels, consonants, common words, therapy sentences) and 3 sample patients.

## AI Integration

Uses Replit AI Integrations for OpenAI (no user API key needed, billed to credits):
- `gpt-4o-mini-transcribe` for speech-to-text
- `gpt-5.2` for pronunciation evaluation and feedback

## Running

- API server: `pnpm --filter @workspace/api-server run dev`
- Frontend: `pnpm --filter @workspace/kannada-speech-therapy run dev`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all lib packages as project references.

Production migrations are handled by Replit when publishing. In development, use `pnpm --filter @workspace/db run push`.
