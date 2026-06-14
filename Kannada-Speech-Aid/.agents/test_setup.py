# test_setup.py — Verify everything is installed correctly
import sys

print("=" * 50)
print("KANNADA SPEECH AID — Setup Verification")
print("=" * 50)
print(f"Python: {sys.version}\n")

checks = {
    "torch":          "PyTorch (AI engine)",
    "torchaudio":     "TorchAudio (audio processing)",
    "transformers":   "HuggingFace Transformers (pretrained models)",
    "datasets":       "HuggingFace Datasets",
    "huggingface_hub":"HuggingFace Hub (model downloads)",
    "fastapi":        "FastAPI (Python web server)",
    "uvicorn":        "Uvicorn (server runner)",
    "soundfile":      "SoundFile (audio file I/O)",
    "librosa":        "Librosa (audio analysis)",
    "numpy":          "NumPy (math)",
    "pandas":         "Pandas (data handling)",
}

all_ok = True
for package, description in checks.items():
    try:
        mod = __import__(package)
        version = getattr(mod, "__version__", "installed")
        print(f"  ✅  {description} ({version})")
    except ImportError:
        print(f"  ❌  {description} — NOT INSTALLED")
        all_ok = False

print("\n" + "=" * 50)
if all_ok:
    print("✅ All packages installed! Ready for Phase 2.")
else:
    print("❌ Some packages missing. Paste this output and I'll fix it.")
print("=" * 50)