import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { ensureCompatibleFormat } from "@workspace/integrations-openai-ai-server/audio";
import { TranscribeSpeechBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/speech/transcribe", async (req, res) => {
  const body = TranscribeSpeechBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { audio, expectedText } = body.data;

  let transcribedText = "";

  try {
    const audioBuffer = Buffer.from(audio, "base64");
    const { buffer, format } = await ensureCompatibleFormat(audioBuffer);

    const transcription = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file: new File([buffer], `audio.${format}`, { type: `audio/${format}` }),
      response_format: "json",
    });

    transcribedText = transcription.text;
  } catch (err) {
    console.error("Transcription error:", err);
    transcribedText = "";
  }

  const feedbackPrompt = `You are a speech therapy assistant helping a stroke patient practice Kannada pronunciation.

Expected Kannada text: "${expectedText}"
Patient spoke: "${transcribedText || "(unclear/no audio detected)"}"

Evaluate the pronunciation accuracy on a scale of 0-100. Be encouraging and supportive.
Consider that the patient is recovering from a stroke and may have difficulty speaking clearly.

Respond in JSON format:
{
  "accuracyScore": <number 0-100>,
  "feedbackText": "<encouraging feedback in simple English, 1-2 sentences>",
  "suggestions": ["<specific tip 1>", "<specific tip 2>"]
}`;

  let accuracyScore = 0;
  let feedbackText = "Good effort! Keep practicing.";
  let suggestions: string[] = ["Try speaking more slowly", "Focus on each syllable"];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 500,
      messages: [{ role: "user", content: feedbackPrompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      accuracyScore = Math.min(100, Math.max(0, Number(parsed.accuracyScore) || 0));
      feedbackText = parsed.feedbackText || feedbackText;
      suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : suggestions;
    }
  } catch (err) {
    console.error("AI feedback error:", err);
  }

  res.json({
    transcribedText,
    accuracyScore,
    feedbackText,
    suggestions,
  });
});

export default router;
