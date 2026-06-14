# Initial Synopsis — Kannada Speech Aid (Current Implementation)

ABSTRACT

This document describes the current, implemented components of the Kannada Speech Aid project and the immediate next steps. The repository contains a working speech-scoring pipeline: a Python FastAPI AI server that loads a Kannada Whisper model (via faster-whisper), performs transcription and pronunciation scoring (single characters, words, sentences), applies silence/hallucination checks, and returns numeric scores and Kannada feedback. The TypeScript Node backend exposes an API route that forwards client audio to the local AI server. The frontend includes a voice-recorder integration and typed API models to consume scoring responses. Core implemented pieces (ASR-based scoring, AI server, backend route, and frontend recorder/types) are functional; advanced features (full segmentation, ensemble classifiers, explainability visualizations, and RAG-based reporting) are planned.

Table of Contents
1. INTRODUCTION	3
2. PROJECT PURPOSE	3
3. CURRENT IMPLEMENTATION SUMMARY	4
4. RESEARCH GAP / PLANNED WORK	5
5. OBJECTIVES (IMPLEMENTED & UPCOMING)	6
6. SYSTEM ARCHITECTURE / METHODOLOGY (CURRENT)	6
6.1 Data Collection (status)	7
6.2 Data Preprocessing (status)	7
6.3 Segmentation Module (status)	7
6.4 Classification Module (status)	8
6.5 Ensemble Learning (status)	8
6.6 Explainable AI Module (status)	8
6.7 RAG Module (status)	8
6.8 Output Generation (status)	8
7. ALGORITHM / PROCESS FLOW (IMPLEMENTED)	8
8. IMPLEMENTATION PLAN & NEXT STEPS	9
9. SOFTWARE AND HARDWARE REQUIREMENTS	9
10. EVALUATION METRICS	10
11. EXPECTED OUTCOMES (short-term)	10
12. CONCLUSION	10
13. REFERENCES	11

1. INTRODUCTION
This synopsis is focused on the current state of the project and the concrete capabilities that are implemented and tested in the repository at the time of writing (June 2, 2026).

2. PROJECT PURPOSE
To provide Kannada-language speech scoring and lightweight automated feedback to support clinicians and home practice. The present deliverable targets accurate per-attempt scoring and immediate practice feedback rather than full clinical reporting.

3. CURRENT IMPLEMENTATION SUMMARY
- Python AI server (FastAPI): located at `.agents/api/agent_server.py`. Exposes `/transcribe` and `/score` endpoints.
- Whisper Kannada model wrapper: `.agents/stt/whisper_inference.py` — loads quantized CT2 or original Whisper Kannada models via `faster-whisper`, implements:
	- audio energy/silence checks, duration validation, and transcription cleaning;
	- single-character phoneme mapping and scoring (phoneme map for Kannada characters);
	- similarity-based scoring (Levenshtein, LCS, overlap) for words/sentences;
	- feedback strings in Kannada and English; `score_pronunciation()` interface used by the server.
- Node/Express API route: `artifacts/api-server/src/routes/speech.ts` — accepts base64 audio and `expectedText`, forwards audio to the AI server at `http://localhost:8000/score`, formats suggestions and fallback behavior.
- Frontend/Integration: `lib/integrations-openai-ai-react` exports a `useVoiceRecorder` hook and there are typed response models in `lib/api-zod` describing `TranscribeSpeechResponse`, `SpeechAttempt`, and related types.
- Basic DB scaffolding and types exist under `db/` and `lib/api-zod` for session/attempt records (schema and types present, pending full wiring into API endpoints).

4. RESEARCH GAP / PLANNED WORK
What is not implemented yet (high level):
- Fine-grained segmentation and forced alignment at token/phoneme level.
- Ensemble learning across multiple classifiers (currently, scoring is derived from ASR output + string-similarity heuristics).
- Explainability visualizations (SHAP/LIME) for model decisions.
- Retrieval-Augmented Generation (RAG) for contextual clinician guidance and rich report generation.
- Large-scale labeled Kannada therapy corpus — current code supports recording/scoring; annotation pipelines remain to be completed.

5. OBJECTIVES (IMPLEMENTED & UPCOMING)
Primary implemented objective:
- Provide reliable ASR-based pronunciation scoring and immediate patient feedback (done).
Planned objectives:
- Extend to segment-level error detection, ensemble classifiers, XAI, and RAG-backed report generation for clinicians.

6. SYSTEM ARCHITECTURE / METHODOLOGY (CURRENT)
- Client (Frontend): captures audio via `useVoiceRecorder`, submits audio to backend API.
- API Server (Node/TypeScript): route `POST /api/speech/transcribe` (in `artifacts/api-server/src/routes/speech.ts`) forwards audio to the local AI server, interprets results, and returns `transcribedText`, `accuracyScore`, `feedbackText`, and `suggestions` to the UI.
- AI Server (Python/FastAPI): `POST /score` receives audio + `expected_text`, uses `WhisperKannadaModel.score_pronunciation()` to return a structured scoring result.
- Storage: types and DB config are present (`db/`, `lib/api-zod`), but full persistence endpoints and pipelines are partially implemented.

6.1 Data Collection (status)
- Supported: manual recording from frontend, file uploads to AI server.
- Pending: standardized annotation tool and bulk import of clinician-labeled sessions.

6.2 Data Preprocessing (status)
- Implemented: resampling/validation via `shared.audio_utils` used by the AI server; silence detection and basic cleaning in `whisper_inference.py`.

6.3 Segmentation Module (status)
- Partial: Whisper's VAD/segmenting parameters are used during transcription, but dedicated forced-alignment and token-level segmentation are not yet implemented.

6.4 Classification Module (status)
- Current approach: heuristic + ASR similarity scoring provides per-attempt classification (correct/incorrect with numeric score). Full supervised classifiers for error-type classification are planned.

6.5 Ensemble Learning (status)
- Not implemented — planned for Phase 2 after labeled data collection.

6.6 Explainable AI Module (status)
- Not implemented — will be added when classifier models are in place.

6.7 RAG Module (status)
- Not implemented — knowledge base and retrieval planned after reports and templates are defined.

6.8 Output Generation (status)
- Implemented (basic): per-attempt feedback and suggestions returned to the client; clinician-level reports and trend exports are planned.

7. ALGORITHM / PROCESS FLOW (IMPLEMENTED)
1. User records audio in the frontend (or uploads file).
2. Frontend sends base64 audio and expected text to Node API route `/api/speech/transcribe`.
3. Node route converts audio to multipart form and forwards to AI server `/score`.
4. AI server writes audio to a temp WAV file and calls `WhisperKannadaModel.score_pronunciation()`.
5. `whisper_inference.py` runs silence checks, performs transcription with `faster-whisper`, cleans transcription, computes similarity/phoneme scores, and returns `transcription`, `score`, and `feedback`.
6. Node server returns structured response to the client with suggestions based on `score`.

8. IMPLEMENTATION PLAN & NEXT STEPS
- Short term (now — 2 weeks): add token-level timestamps to responses (use Whisper timestamps already returned by faster-whisper), wire persistence endpoints to save attempts and compute basic progress over time.
- Medium term (2–8 weeks): implement segmentation/forced-alignment, build a small labeled dataset, prototype supervised classifiers, and add lightweight explainability (feature- or token-level attributions).
- Long term (8+ weeks): ensemble fusion, RAG-backed clinician reports, pilot deployment and clinician UX testing.

9. SOFTWARE AND HARDWARE REQUIREMENTS
Software
- Python 3.10+, FastAPI, uvicorn, faster-whisper, librosa, numpy.
- Node.js 16+, TypeScript, Express, pnpm, Vite (frontend).
Hardware
- Development machine: 8+ CPU cores, 16+ GB RAM.
- Inference: CPU is supported (current `faster-whisper` instantiation uses CPU int8); GPU recommended for faster/larger workloads.

10. EVALUATION METRICS
- ASR quality: WER/CER measured on collected Kannada prompts (planned).
- Scoring accuracy: agreement with clinician judgments (Cohen's kappa, accuracy, F1).
- System metrics: latency from upload → score, success rate, and UI task completion.

11. EXPECTED OUTCOMES (short-term)
- A working pronunciation-scoring service that clinicians can use to get immediate feedback for patient practice tasks.

12. CONCLUSION
The repository currently delivers a practical, tested scoring pipeline for Kannada pronunciation exercises. The next development steps are focused on collecting labeled data, improving segmentation, and adding model-based classifiers and explainability so the system can evolve from single-attempt scoring to clinically interpretable session-level reporting.

13. REFERENCES
- See `Initial Synopsis` references in the repo and the `whisper_inference.py` header for components used (faster-whisper, librosa). Additional academic references on ASR, SHAP, and RAG remain relevant as the project advances.

Prepared on June 2, 2026. Review this draft and tell me which sections you want expanded, or I can export this file to PDF/Word.
