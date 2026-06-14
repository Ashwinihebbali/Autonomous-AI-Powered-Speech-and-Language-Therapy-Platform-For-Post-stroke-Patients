# whisper_inference.py
# Improved scoring with:
# - Silence/hallucination detection
# - Transcription cleaning
# - Special vowel/consonant phoneme scoring
# - Better partial match handling

import os
import re
import sys
import numpy as np
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faster_whisper import WhisperModel
from shared.audio_utils import load_audio, validate_audio
from shared.config import STT_MODEL_DIR

CT2_MODEL_PATH      = os.path.join(STT_MODEL_DIR, "whisper-kannada-ct2")
ORIGINAL_MODEL_PATH = os.path.join(STT_MODEL_DIR, "whisper-kannada-final")

# ── Phoneme map for single-character exercises ───────────────
# Maps each Kannada character to acceptable romanized sounds.
# Used for vowel and consonant exercises where Whisper
# often outputs romanized text instead of Kannada script.
PHONEME_MAP = {
    # Vowels
    'ಅ': ['ಅ', 'a', 'ah'],
    'ಆ': ['ಆ', 'aa', 'ā', 'aaa'],
    'ಇ': ['ಇ', 'i', 'ee'],
    'ಈ': ['ಈ', 'ii', 'ee', 'ī'],
    'ಉ': ['ಉ', 'u', 'oo'],
    'ಊ': ['ಊ', 'uu', 'ū'],
    'ಎ': ['ಎ', 'e', 'eh'],
    'ಏ': ['ಏ', 'ee', 'ē', 'e'],
    'ಒ': ['ಒ', 'o', 'oh'],
    'ಓ': ['ಓ', 'oo', 'ō', 'o'],
    # Consonants
    'ಕ': ['ಕ', 'ka', 'k'],
    'ಖ': ['ಖ', 'kha', 'kh'],
    'ಗ': ['ಗ', 'ga', 'g'],
    'ಘ': ['ಘ', 'gha'],
    'ಚ': ['ಚ', 'cha', 'ch', 'ca'],
    'ಛ': ['ಛ', 'chha'],
    'ಜ': ['ಜ', 'ja', 'j'],
    'ಝ': ['ಝ', 'jha'],
    'ಟ': ['ಟ', 'ta', 'ṭa', 't'],
    'ಠ': ['ಠ', 'tha', 'ṭha'],
    'ಡ': ['ಡ', 'da', 'ḍa', 'd'],
    'ತ': ['ತ', 'ta', 'tha', 't'],
    'ದ': ['ದ', 'da', 'd'],
    'ನ': ['ನ', 'na', 'n'],
    'ಪ': ['ಪ', 'pa', 'p'],
    'ಫ': ['ಫ', 'pha', 'fa'],
    'ಬ': ['ಬ', 'ba', 'b'],
    'ಭ': ['ಭ', 'bha'],
    'ಮ': ['ಮ', 'ma', 'm'],
    'ಯ': ['ಯ', 'ya', 'y'],
    'ರ': ['ರ', 'ra', 'r'],
    'ಲ': ['ಲ', 'la', 'l'],
    'ವ': ['ವ', 'va', 'v', 'wa'],
    'ಶ': ['ಶ', 'sha', 'sh'],
    'ಸ': ['ಸ', 'sa', 's'],
    'ಹ': ['ಹ', 'ha', 'h'],
    'ಳ': ['ಳ', 'la', 'ḷa'],
}

# RMS energy threshold — audio below this is treated as silence
SILENCE_THRESHOLD = 0.008

# Minimum duration in seconds — shorter than this is likely a tap, not speech
MIN_AUDIO_DURATION = 0.4


class WhisperKannadaModel:
    """Whisper Kannada model with improved scoring and silence detection."""

    def __init__(self):
        if os.path.exists(CT2_MODEL_PATH):
            model_path = CT2_MODEL_PATH
            print(f"Loading quantized Whisper model (INT8) from {CT2_MODEL_PATH}...")
        elif os.path.exists(ORIGINAL_MODEL_PATH):
            model_path = ORIGINAL_MODEL_PATH
            print(f"CT2 model not found, loading original from {ORIGINAL_MODEL_PATH}...")
        else:
            raise FileNotFoundError(
                f"No model found.\n"
                f"Checked: {CT2_MODEL_PATH}\n"
                f"Checked: {ORIGINAL_MODEL_PATH}"
            )

        self.model = WhisperModel(model_path, device="cpu", compute_type="int8")
        print("Whisper Kannada model loaded!")

    # ── Audio quality checks ─────────────────────────────────

    def _check_audio_energy(self, audio_path: str) -> dict:
        """
        Check if audio has actual speech or is silence/noise.
        Returns dict with is_silent flag and duration.
        """
        try:
            import librosa
            audio, sr = librosa.load(audio_path, sr=16000, mono=True)
            duration   = len(audio) / sr
            rms_energy = float(np.sqrt(np.mean(audio ** 2)))

            is_silent    = rms_energy < SILENCE_THRESHOLD
            is_too_short = duration < MIN_AUDIO_DURATION

            return {
                "is_silent"   : is_silent or is_too_short,
                "duration"    : round(duration, 2),
                "energy"      : round(rms_energy, 4),
                "reason"      : "too_quiet" if is_silent else ("too_short" if is_too_short else "ok"),
            }
        except Exception:
            # If check fails, proceed with transcription anyway
            return {"is_silent": False, "duration": 1.0, "energy": 0.1, "reason": "check_failed"}

    # ── Transcription cleaning ───────────────────────────────

    def _clean_transcription(self, text: str) -> str:
        """
        Clean Whisper output by removing punctuation and noise.
        Whisper often adds commas, periods, question marks,
        or filler phrases that lower the similarity score unfairly.
        """
        if not text:
            return ""

        # Remove common punctuation Whisper adds
        text = re.sub(r'[।॥,.!?;:\-\(\)\[\]"\']', '', text)

        # Remove common Whisper filler words in Kannada/English
        fillers = [
            'ಧನ್ಯವಾದ', 'ಧನ್ಯವಾದಗಳು',  # "thank you"
            'ಹೌದು',                       # "yes"
            'ಸರಿ',                         # "okay"
            'thank you', 'ok', 'okay',
            'subscribe', 'like', 'share',  # Whisper hallucinations from YT training
            'ನಮಸ್ಕಾರ', 'ನಮಸ್ತೆ',          # "hello" - common hallucination
        ]
        for filler in fillers:
            text = text.replace(filler, '')

        # Collapse multiple spaces
        text = re.sub(r'\s+', ' ', text).strip()

        return text

    # ── Hallucination detection ──────────────────────────────

    def _is_hallucination(self, transcription: str, audio_duration: float) -> bool:
        """
        Detect likely Whisper hallucinations.
        Hallucination = model outputs text when there was silence/noise.
        Signs: long output from very short audio, or known repeated phrases.
        """
        if not transcription:
            return False

        char_count = len(transcription.replace(' ', ''))

        # Too many characters for very short audio = hallucination
        # Speech produces roughly 3-5 Kannada characters per second
        max_expected_chars = max(4, audio_duration * 5)
        if char_count > max_expected_chars * 3:
            return True

        return False

    # ── Phoneme scoring for single characters ────────────────

    def _score_single_phoneme(self, transcription: str, expected: str) -> float:
        """
        Special scoring for vowel and consonant exercises (1-2 characters).
        Whisper struggles with single syllables so we:
        1. Check if the exact character appears anywhere in output
        2. Check if any acceptable romanization appears in output
        3. Give credit for any non-empty output (patient at least tried)
        """
        if not transcription:
            return 0.0

        # Direct match — exact character found in transcription
        if expected in transcription:
            # Penalise slightly if there's a lot of extra text
            ratio = len(expected) / max(len(transcription), 1)
            return max(85.0, round(ratio * 100, 1))

        # Phoneme map match — check romanizations
        if expected in PHONEME_MAP:
            acceptable = PHONEME_MAP[expected]
            trans_lower = transcription.lower()
            for sound in acceptable:
                if sound.lower() in trans_lower:
                    return 83.0

        # Check if transcription starts with a similar-sounding character
        # (Whisper may output a different but acoustically similar vowel)
        vowels = set('ಅಆಇಈಉಊಎಏಒಓ')
        consonants = set('ಕಖಗಘಚಛಜಝಟಠಡತದನಪಫಬಭಮಯರಲವಶಸಹಳ')

        if expected in vowels and transcription[0] in vowels:
            # Got a vowel, just not the exact one — partial credit
            return 55.0

        if expected in consonants and transcription[0] in consonants:
            # Got a consonant, just not the exact one — partial credit
            return 50.0

        # Patient spoke something — give minimum encouragement credit
        # Better than penalising them for Whisper's weakness with single chars
        if len(transcription) > 0:
            return 35.0

        return 0.0

    # ── Main transcription ───────────────────────────────────

    def transcribe(self, audio_path: str) -> dict:
        """Transcribe a Kannada audio file with silence detection."""
        waveform  = load_audio(audio_path)
        validated = validate_audio(waveform)

        if not validated["valid"]:
            return {"success": False, "error": validated["message"]}

        # Check for silence before sending to AI
        energy_check = self._check_audio_energy(audio_path)
        if energy_check["is_silent"]:
            return {
                "success"         : True,
                "transcription"   : "",
                "duration_seconds": energy_check["duration"],
                "model"           : "whisper-kannada-ct2-int8",
                "silent"          : True,
            }

        segments, info = self.model.transcribe(
            audio_path,
            language="kn",
            beam_size=5,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=300),
            temperature=0.0,           # deterministic output, no random variation
            no_speech_threshold=0.6,   # higher threshold = less hallucination
            log_prob_threshold=-1.0,   # filter low-confidence outputs
        )

        raw_transcription = " ".join([seg.text for seg in segments]).strip()
        transcription     = self._clean_transcription(raw_transcription)

        # Detect hallucination
        duration = energy_check["duration"]
        if self._is_hallucination(transcription, duration):
            transcription = ""

        return {
            "success"         : True,
            "transcription"   : transcription,
            "duration_seconds": validated["duration_seconds"],
            "model"           : "whisper-kannada-ct2-int8",
            "silent"          : False,
        }

    # ── Pronunciation scoring ────────────────────────────────

    def score_pronunciation(self, audio_path: str, expected_text: str) -> dict:
        """Score pronunciation with improved handling per exercise type."""
        result = self.transcribe(audio_path)

        if not result["success"]:
            return result

        # Handle silence explicitly
        if result.get("silent") or not result["transcription"]:
            return {
                "success"         : True,
                "expected"        : expected_text.strip(),
                "transcription"   : "",
                "score"           : 0.0,
                "feedback"        : "ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ (Please speak clearly into the microphone)",
                "is_correct"      : False,
                "duration_seconds": result["duration_seconds"],
                "model"           : "whisper-kannada-ct2-int8",
            }

        transcription = result["transcription"].strip()
        expected      = expected_text.strip()

        # Determine exercise type
        expected_chars  = len(expected)
        is_single_char  = expected_chars <= 2   # vowels and consonants
        is_short_word   = expected_chars <= 8   # simple words like ಅಮ್ಮ
        is_sentence     = expected_chars > 20   # full sentences

        # Choose scoring method based on type
        if is_single_char:
            score = self._score_single_phoneme(transcription, expected)

        elif is_short_word:
            score = self._calculate_similarity(transcription, expected)
            if expected in transcription:
                score = max(score, 86.0)
            elif transcription in expected:
              ratio = len(transcription) / len(expected)
              score = max(score, round(ratio * 88, 1))

        else:
            # Sentences — standard similarity scoring
            score = self._calculate_similarity(transcription, expected)

        score = min(round(score, 1), 100.0)

        return {
            "success"         : True,
            "expected"        : expected,
            "transcription"   : transcription,
            "score"           : score,
            "feedback"        : self._get_feedback(score),
            "is_correct"      : score >= 70,
            "duration_seconds": result["duration_seconds"],
            "model"           : "whisper-kannada-ct2-int8",
        }

    # ── Similarity methods ───────────────────────────────────

    def _calculate_similarity(self, predicted: str, expected: str) -> float:
        """Multi-method similarity — returns best score across all methods."""
        if not predicted or not expected:
            return 0.0
        if predicted == expected:
            return 100.0

        if expected in predicted or predicted in expected:
            shorter = min(len(expected), len(predicted))
            longer  = max(len(expected), len(predicted))
            return round((shorter / longer) * 100, 1)

        score_lev     = self._levenshtein_score(predicted, expected)
        pred_chars    = set(predicted)
        exp_chars     = set(expected)
        score_overlap = (len(pred_chars & exp_chars) / len(exp_chars) * 100) if exp_chars else 0.0
        score_lcs     = self._lcs_score(predicted, expected)

        return round(min(max(score_lev, score_overlap, score_lcs), 100.0), 1)

    def _levenshtein_score(self, s1: str, s2: str) -> float:
        if not s1 or not s2:
            return 0.0
        rows, cols = len(s1) + 1, len(s2) + 1
        dist = [[0] * cols for _ in range(rows)]
        for i in range(rows): dist[i][0] = i
        for j in range(cols): dist[0][j] = j
        for i in range(1, rows):
            for j in range(1, cols):
                cost = 0 if s1[i-1] == s2[j-1] else 1
                dist[i][j] = min(
                    dist[i-1][j] + 1,
                    dist[i][j-1] + 1,
                    dist[i-1][j-1] + cost
                )
        return round((1 - dist[rows-1][cols-1] / max(len(s1), len(s2))) * 100, 1)

    def _lcs_score(self, s1: str, s2: str) -> float:
        if not s1 or not s2:
            return 0.0
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                dp[i][j] = dp[i-1][j-1] + 1 if s1[i-1] == s2[j-1] else max(dp[i-1][j], dp[i][j-1])
        return round((dp[m][n] / max(m, n)) * 100, 1)

    # ── Feedback strings ─────────────────────────────────────

    def _get_feedback(self, score: float) -> str:
        if score >= 90:
            return "ಅತ್ಯುತ್ತಮ! (Excellent! Perfect pronunciation!)"
        elif score >= 75:
            return "ಚೆನ್ನಾಗಿದೆ! (Good job! Keep practicing!)"
        elif score >= 55:
            return "ಸರಿಯಾಗಿದೆ (Getting there! Try once more)"
        elif score >= 35:
            return "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Please try again slowly)"
        else:
            return "ನಿಧಾನವಾಗಿ ಮತ್ತೆ ಹೇಳಿ (Say it slowly and clearly)"


# Singleton
_model_instance = None

def get_model() -> WhisperKannadaModel:
    global _model_instance
    if _model_instance is None:
        _model_instance = WhisperKannadaModel()
    return _model_instance