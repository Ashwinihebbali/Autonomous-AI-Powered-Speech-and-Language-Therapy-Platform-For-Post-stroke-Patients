# audio_utils.py — Shared audio processing helpers
import torch
import os
import numpy as np

# Tell librosa where ffmpeg is
os.environ["PATH"] += r";C:\ffmpeg\ffmpeg-8.1-essentials_build\bin"

SAMPLE_RATE = 16000

def load_audio(file_path: str) -> torch.Tensor:
    """Load any audio file and convert to 16kHz mono."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    try:
        # librosa handles webm, mp4, wav, mp3 — all browser formats
        import librosa
        data, sr = librosa.load(file_path, sr=SAMPLE_RATE, mono=True)
        waveform = torch.from_numpy(data)
        return waveform
    except Exception as e:
        raise RuntimeError(f"Failed to load audio: {e}")


def save_audio(waveform: torch.Tensor, file_path: str):
    """Save audio tensor to a .wav file."""
    import soundfile as sf
    if waveform.dim() > 1:
        waveform = waveform.squeeze(0)
    sf.write(file_path, waveform.numpy(), SAMPLE_RATE)


def get_duration(waveform: torch.Tensor) -> float:
    """Get audio duration in seconds."""
    return round(waveform.shape[-1] / SAMPLE_RATE, 2)


def validate_audio(waveform: torch.Tensor) -> dict:
    """Check if audio length is valid for our models."""
    duration = get_duration(waveform)
    is_valid  = 0.3 <= duration <= 30.0
    return {
        "valid"           : is_valid,
        "duration_seconds": duration,
        "message"         : "OK" if is_valid else f"Audio must be 0.3–30 seconds (got {duration}s)"
    }