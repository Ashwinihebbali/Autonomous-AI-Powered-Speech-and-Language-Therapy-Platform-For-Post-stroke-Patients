# Kannada Speech Aid — AI-Assisted Speech Therapy Platform - Phase 1 (Milestone 1)

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Whisper](https://img.shields.io/badge/Whisper-Fine--Tuned-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Offline](https://img.shields.io/badge/Runs-100%25%20Offline-22c55e?style=for-the-badge)

<br/>

**A fully offline, AI-powered web application that guides post-stroke Kannada-speaking patients through structured speech rehabilitation exercises — recording their voice, evaluating pronunciation with a custom fine-tuned model, and tracking clinical progress over time.**

<br/>

> Built in collaboration with the **All India Institute of Speech and Hearing (AIISH), Mysuru**

</div>

---

## Overview

Kannada Speech Aid is purpose-built for post-stroke patients recovering their ability to speak Kannada. The application walks patients through a structured library of vowels, consonants, words, and sentences — recording their voice, processing it locally with a fine-tuned Whisper model, and giving immediate pronunciation scores and Kannada-language feedback.

Therapists get a separate clinical dashboard to monitor all their patients' sessions, attempt histories, score trends, and add clinical notes — entirely offline, with no patient data leaving the device.

**What makes this different from existing tools:**
- Every existing speech therapy app is English-only
- Every AI speech tool requires internet and sends audio to external servers
- This is the first AI-assisted Kannada speech therapy system — offline, private, and clinically structured

---

## Features

### For Patients
- 🎤 **Voice Recording** — Browser-native microphone capture via Web MediaRecorder API
- 🤖 **Offline AI Scoring** — Each attempt is transcribed and scored 0–100 by a locally running fine-tuned Whisper model — no internet required
- 💬 **Kannada Feedback** — Immediate results in Kannada script (ಅತ್ಯುತ್ತಮ! / ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ)
- 📊 **Progress Tracking** — Weekly score trend charts and per-category accuracy breakdowns
- 🌐 **Bilingual UI** — Full English ↔ Kannada interface toggle on every page
- ♿ **Clinical Typography** — Large Kannada script display optimised for elderly post-stroke patients

### For Therapists
- 👥 **Patient Roster** — All patients with session count, last session date, average accuracy, and trend badge (Improving / Declining / Stable)
- 📈 **Session History** — Full attempt history per patient, sorted newest first, with per-session accuracy
- 📝 **Clinical Notes** — Editable therapist notes saved per patient for longitudinal observations
- ➕ **Patient Registration** — Register new patients directly from the dashboard

### System-Wide
- 🔒 **Role-Based Auth** — Patient and Therapist roles with protected routes and backend credential validation
- 🛡️ **Full Type Safety** — End-to-end TypeScript with Zod validation on every API endpoint
- ⚡ **OpenAPI-First Architecture** — Spec-driven codegen keeps frontend and backend in sync
- 🌍 **Localised UI** — Complete Kannada and English translations throughout

---

## Exercise Library

46 seeded exercises across four clinical categories:

| Category | Examples | Count |
|---|---|---|
| Vowels | ಅ, ಆ, ಇ, ಈ, ಉ, ಊ ... | 10 |
| Consonants | ಕ, ಖ, ಗ, ಘ, ಚ ... | 14 |
| Words | ನೀರು, ಮನೆ, ಅಮ್ಮ, ಅಪ್ಪ ... | 15 |
| Sentences | Common therapeutic phrases | 7 |

---

## How It Works

```
Patient speaks into microphone
        │
        ▼
MediaRecorder captures audio (browser)
        │
        ▼
Audio → base64 → POST /api/speech/score (Express)
        │
        ▼
Express → temp .wav file → POST /score (FastAPI, port 8000)
        │
        ▼
Silence check (RMS energy) → if silent, return 0% immediately
        │
        ▼
faster-whisper (fine-tuned Whisper-small, INT8, local CPU)
→ Kannada transcription
        │
        ▼
Multi-method scoring (maximum of four algorithms):
  ├─ Levenshtein character edit distance
  ├─ Longest Common Subsequence ratio
  ├─ Character overlap percentage
  └─ Phoneme map matching (single vowels/consonants)
        │
        ▼
Score (0–100%) + feedback message → saved to PostgreSQL
        │
        ▼
Result displayed to patient:
  🟢 ≥ 80%  →  ಅತ್ಯುತ್ತಮ! (Excellent!)
  🟡 50–79% →  ಚೆನ್ನಾಗಿದೆ (Good effort)
  🔴 < 50%  →  ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Try again slowly)
```

---

## Architecture

Three servers run simultaneously on localhost:

```
Browser (localhost:5173)
        ↓ HTTP
Express API (localhost:3000)  ←→  PostgreSQL (localhost:5432)
        ↓ HTTP
Python AI Server (localhost:8000)
        └── faster-whisper (INT8 quantized, offline)
```

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS | Patient + therapist UI |
| Routing | Wouter | Client-side navigation |
| State | TanStack React Query | Server state + caching |
| Animation | Framer Motion | Smooth transitions |
| Charts | Recharts | Progress visualisation |
| API Server | Node.js, Express 5, TypeScript | REST API + session management |
| ORM | Drizzle ORM | Type-safe PostgreSQL queries |
| AI Server | Python 3.12, FastAPI, Uvicorn | Speech inference endpoint |
| Speech Model | faster-whisper (CTranslate2) | Offline Kannada ASR |
| Audio DSP | librosa, numpy, soundfile | Audio preprocessing |
| Monorepo | pnpm workspaces | Shared types across packages |

---

## AI Model — Spec-A Details

| Property | Value |
|---|---|
| Base model | OpenAI Whisper-small |
| Parameters | 241 million |
| Pre-training data | 680,000 hours multilingual audio |
| Fine-tuning dataset | 331 synthetic Kannada therapy audio samples |
| Fine-tuning vocabulary | 46 therapy exercises |
| Quantization | INT8 via CTranslate2 |
| Size before quantization | 922 MB |
| Size after quantization | 236 MB (74% reduction) |
| Inference | CPU-only, no GPU required |
| Average inference time | 10–30 seconds on laptop CPU |

The model is excluded from git due to GitHub's 100 MB file size limit. See **Model Setup** in installation steps.

---

## Prerequisites

- Node.js v18+
- Python 3.12+
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14+ running as a local service
- The fine-tuned model files (see below)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ashwinihebbali/Major-Project.git
cd "Major Project/Kannada-Speech-Aid"
```

### 2. Install Node.js dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example files and add your PostgreSQL password:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp lib/db/.env.example lib/db/.env
cp scripts/.env.example scripts/.env
```

Each `.env` file needs one line:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/kannada_speech_therapy
```

### 4. Create the database

In psql or pgAdmin:
```sql
CREATE DATABASE kannada_speech_therapy;
```

Push the schema:
```bash
cd lib/db
pnpm db:push
```

### 5. Seed the database

```bash
cd scripts
pnpm seed
```

Creates 46 exercises and demo accounts for testing.

### 6. Set up the Python environment

```bash
cd .agents
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 7. Download the AI model

Place these files at `.agents/stt/models/whisper-kannada-ct2/`:

```
whisper-kannada-ct2/
├── model.bin          ← download separately (236 MB)
├── config.json        ← included in repo
└── vocabulary.json    ← included in repo
```

> Hosting link (Hugging Face Hub) — to be added in Phase 2 release.

---

## Running the Project

### One command (Windows PowerShell)

```powershell
.\start-demo.ps1
```

Starts all three servers. Wait for `Model warmed up and ready!` before opening the browser.

### Manual startup (three terminals)

**Terminal 1 — AI Server:**
```powershell
cd .agents\api
..\venv\Scripts\activate
python agent_server.py
```

**Terminal 2 — Express API:**
```powershell
cd artifacts\api-server
pnpm dev
```

**Terminal 3 — React Frontend:**
```powershell
cd artifacts\kannada-speech-therapy
pnpm dev
```

Open: **http://localhost:5173**

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Therapist | `yashaswini@example.com` | `password123` |
| Therapist | `therapist@example.com` | `password123` |
| Patient | `ramaswamy@example.com` | `password123` |
| Patient | `saraswathi@example.com` | `password123` |
| Patient | `venkatesh@example.com` | `password123` |

---

## Project Structure

```
Kannada-Speech-Aid/
├── .agents/
│   ├── api/
│   │   └── agent_server.py           # FastAPI AI server (port 8000)
│   ├── stt/
│   │   ├── whisper_inference.py      # Scoring pipeline
│   │   └── models/
│   │       └── whisper-kannada-ct2/  # Fine-tuned model (git-ignored)
│   ├── shared/                       # Shared Python utilities
│   └── requirements.txt
├── artifacts/
│   ├── api-server/                   # Express REST API (port 3000)
│   │   └── src/routes/               # auth, patients, sessions, exercises, speech
│   └── kannada-speech-therapy/       # React frontend (port 5173)
│       └── src/
│           ├── pages/                # Home, Login, patient/*, therapist/*
│           ├── components/           # AppLayout, PatientNotes, UI primitives
│           └── contexts/             # AuthContext, LanguageContext
├── lib/
│   ├── db/                           # Drizzle schema + migrations
│   ├── api-spec/                     # OpenAPI specification
│   ├── api-zod/                      # Zod validation schemas
│   └── api-client-react/             # Generated TanStack Query hooks
├── scripts/
│   └── src/seed-exercises.ts         # Database seed
├── start-demo.ps1                    # One-command startup (Windows)
├── SYNOPSIS.md
└── pnpm-workspace.yaml
```

---

## Privacy & Data Sovereignty

| Guarantee | How it is enforced |
|---|---|
| No audio leaves the device | All ASR runs on local CPU via faster-whisper |
| No patient data in the cloud | PostgreSQL runs on localhost only |
| Audio is not stored | Temp `.wav` file is deleted immediately after inference |
| No API keys needed | No external AI service is called at runtime |
| No monthly operating cost | Entirely self-hosted |

---

## Phase 2 — Spec-B Roadmap

| Feature | Technology | Status |
|---|---|---|
| IndicWav2Vec fine-tuning on 153-word CV matrix | AI4Bharat IndicWav2Vec | Planned |
| Kannada TTS pronunciation playback | facebook/mms-tts-kan | Planned |
| CTC phoneme alignment module | Per-character confidence scores | Planned |
| xAI Level 1 — Error type classification | Substitution / Omission / Addition | Planned |
| xAI Level 2 — Visual phoneme highlighting | Character confidence UI overlay | Planned |
| Local offline RAG | FAISS + Ollama (Gemma 2B / Phi-3-mini) | Planned |
| xAI Level 3 — AI clinical insights | Local LLM grounded in patient session data | Planned |
| Production hardening | bcrypt, JWT, Docker, audit logging | Planned |

---

## Clinical Background

- **Target population:** Adult post-stroke patients with aphasia or apraxia of speech
- **Clinical partner:** All India Institute of Speech and Hearing (AIISH), Mysuru
- **Therapy structure:** Exercises follow standard SLP Consonant-Vowel (CV) matrix progression
- **SLP to population ratio in India:** approximately 1 per 750,000 people
- **Post-stroke aphasia incidence:** 37.8% of ischemic stroke survivors (Grönberg et al., 2022)
- **Estimated new aphasia cases per year in India:** ~680,000

---

<div align="center">
  <sub>Built for Kannada-speaking post-stroke patients and the speech-language pathologists who care for them.</sub>
</div>