# agent_server.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import shutil
import uvicorn

from stt.whisper_inference import get_model

app = FastAPI(title="Kannada Speech AI Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "server": "Kannada Speech AI"}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(audio.file, tmp)
        tmp_path = tmp.name
    try:
        model  = get_model()
        result = model.transcribe(tmp_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

@app.post("/score")
async def score_pronunciation(
    audio:         UploadFile = File(...),
    expected_text: str        = Form(...)
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(audio.file, tmp)
        tmp_path = tmp.name
    try:
        model  = get_model()
        result = model.score_pronunciation(tmp_path, expected_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    print("=" * 50)
    print("Kannada Speech AI Server starting...")
    print("   URL  : http://localhost:8000")
    print("   Docs : http://localhost:8000/docs")
    print("=" * 50)
    uvicorn.run("agent_server:app", host="0.0.0.0", port=8000, reload=True)