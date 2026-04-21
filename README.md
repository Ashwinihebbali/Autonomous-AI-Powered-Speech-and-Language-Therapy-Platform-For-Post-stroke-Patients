# VaakSudhaar — AI-Assisted Kannada Speech Therapy - Phase 1 (Milestone 1)

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-Whisper%20%2B%20GPT--5.2-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<br/>

**A full-stack web application that uses AI to guide post-stroke patients through structured Kannada speech recovery exercises — recording their voice, evaluating pronunciation, and tracking progress over time.**


</div>

---

## 🌟 Overview

**VaakSudhaar** (ವಾಕ್ ಸುಧಾರ್ — *"speech improvement"*) is purpose-built for post-stroke aphasia patients recovering their ability to speak Kannada. The application walks patients through a structured library of vowels, consonants, words, and sentences — recording their voice, transcribing it with OpenAI Whisper, and then using GPT-5.2 to score pronunciation accuracy and generate warm, encouraging, personalised feedback.

Therapists get a separate dashboard to monitor all their patients' sessions, attempt histories, and score trends — all in one place.

---

## ✨ Features

### For Patients
- 🎤 **Voice Recording** — Browser-native microphone capture via the Web MediaRecorder API
- 🤖 **AI Pronunciation Scoring** — Each attempt is transcribed by Whisper and scored 0–100 by GPT-5.2
- 💬 **Personalised Feedback** — Supportive, context-aware improvement tips generated per attempt
- 📊 **Progress Tracking** — Weekly score trend lines and per-category bar charts
- 🌐 **Bilingual UI** — Full English ↔ Kannada interface toggle, persisted across sessions
- ♿ **Accessibility First** — Kannada characters rendered up to 140px for elderly patients with vision difficulties

### For Therapists
- 👥 **Patient Dashboard** — Overview of all patients with session counts and last-seen dates
- 📈 **Session History** — Drill into any patient's full attempt history and score trends
- 🗂️ **Exercise Coverage** — See which categories each patient has practised

### System-Wide
- 🔒 **Role-based Auth** — Patient and Therapist roles with protected routes
- 🌍 **60+ Translated Strings** — Complete UI localisation in Kannada and English
- ⚡ **OpenAPI-first Architecture** — Spec-driven codegen keeps frontend and backend perfectly in sync
- 🛡️ **Full Type Safety** — End-to-end TypeScript with Zod validation on every API endpoint

---

**Exercise Library** — 46 seeded exercises across four categories:

| Category | Examples | Count |
|---|---|---|
| Vowels | ಅ, ಆ, ಇ, ಈ, ಉ ... | 13 |
| Consonants | ಕ, ಖ, ಗ, ಘ ... | 15 |
| Words | ನೀರು, ಮನೆ, ಅಮ್ಮ ... | 10 |
| Sentences | Common therapeutic phrases | 8 |


## 🔄 How It Works

```
Patient speaks
      │
      ▼
MediaRecorder captures audio (browser)
      │
      ▼
Audio → base64 → POST /api/speech/transcribe
      │
      ▼
OpenAI Whisper → spoken text
      │
      ▼
GPT-5.2 compares to expected Kannada text
      │
      ├─→ Accuracy score (0–100)
      ├─→ Personalised feedback paragraph
      └─→ Improvement tips
      │
      ▼
Result displayed:
  🟢 ≥ 80%  →  "Excellent!"  →  Continue to next exercise
  🟡 50–79% →  "Good effort" →  Try again option
  🔴 < 50%  →  "Keep going"  →  Retry encouraged
```

---

## 🔐 Authentication

Authentication is frontend-based using `localStorage` with an `AuthContext` wrapping the entire application:

- **Patients** — Matched to a database record on sign-in; new record created on sign-up
- **Therapists** — Credential-based login (demo mode — any credentials accepted)
- **Protected routes** — Redirect unauthenticated users to `/login`
- **Session persistence** — Auth state and language preference survive page refreshes

> ℹ️ For production deployment, replace localStorage auth with a JWT + server-session system.

## 🎨 Design Philosophy

- **Large typography** — Kannada characters displayed up to 140px for elderly patients with visual impairments
- **Warm colour palette** — Teal primary with soft peach and orange accents; calming, not clinical
- **Encouraging AI** — GPT-5.2 is explicitly prompted to be supportive and constructive, never discouraging
- **Accessibility first** — Simple navigation, high contrast, minimal cognitive load

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow the existing TypeScript patterns and ensure `pnpm typecheck` passes before submitting.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ for Kannada-speaking stroke survivors and their families</sub>
</div>
