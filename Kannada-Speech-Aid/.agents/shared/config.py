# config.py — Central settings for all AI agents
import os

# Base directory (the .agents folder)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Where trained models get saved on your computer
STT_MODEL_DIR    = os.path.join(BASE_DIR, "stt", "models")
TTS_MODEL_DIR    = os.path.join(BASE_DIR, "tts", "models")
PRONUN_MODEL_DIR = os.path.join(BASE_DIR, "pronunciation", "models")
DATA_DIR         = os.path.join(BASE_DIR, "stt", "data")

# Pretrained models from HuggingFace we build on top of
WHISPER_MODEL  = "openai/whisper-small"              # Speech-to-text base
WAV2VEC_MODEL  = "facebook/wav2vec2-large-xlsr-53"   # Pronunciation scoring
TTS_MODEL      = "facebook/mms-tts-kan"              # Kannada text-to-speech

# Audio — all our models need 16kHz mono audio
SAMPLE_RATE = 16000
LANGUAGE    = "kn"   # kn = Kannada

# Server ports
AGENT_SERVER_PORT  = 8000   # Python AI server
EXPRESS_SERVER_PORT = 3000  # Your TypeScript server