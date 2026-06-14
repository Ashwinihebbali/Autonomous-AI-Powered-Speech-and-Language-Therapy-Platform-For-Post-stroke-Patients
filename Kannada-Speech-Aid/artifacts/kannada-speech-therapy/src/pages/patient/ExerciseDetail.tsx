import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { 
  useGetExercise, 
  useCreateSession, 
  useRecordAttempt, 
  useTranscribeSpeech,
  useListExercises
} from "@workspace/api-client-react";
import { useAudioRecorder } from "@/lib/audio";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Mic, Square, Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ExerciseDetail() {
  const params = useParams();
  const [, navigate] = useLocation();
  const patientId = parseInt(params.id || "0");
  const exerciseId = parseInt(params.exerciseId || "0");
  const { t } = useLanguage();

  const sessionIdRef = useRef<number | null>(null);

  const completeSession = async (sessId: number) => {
    try {
      await fetch(`/api/sessions/${sessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" })
      });
    } catch (err) {
      console.error("Failed to complete session", err);
    }
  };

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<any | null>(null);

  // APIs
  const { data: exercise, isLoading: loadingExercise } = useGetExercise(exerciseId, { query: { queryKey: ["exercise", exerciseId], enabled: !!exerciseId }});
  const { data: categoryExercises } = useListExercises(
    { category: exercise?.category as any },
    { query: { queryKey: ["exercises", exercise?.category], enabled: !!exercise?.category } }
  );
  const { mutateAsync: createSession } = useCreateSession();
  const { mutateAsync: transcribeSpeech, isPending: isTranscribing } = useTranscribeSpeech();
  const { mutateAsync: recordAttempt } = useRecordAttempt();

  // Audio Recorder
  const { isRecording, startRecording, stopRecording, audioBase64, clearRecording } = useAudioRecorder();
  

  // Find next exercise
  const sortedExercises = categoryExercises ? [...categoryExercises].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)) : [];
  const currentIndex = sortedExercises.findIndex(e => e.id === exerciseId);
  const nextExercise = currentIndex >= 0 && currentIndex < sortedExercises.length - 1 ? sortedExercises[currentIndex + 1] : null;

  // Initialize Session
  useEffect(() => {
    if (patientId && !sessionId) {
      createSession({ data: { patientId } })
        .then(res => setSessionId(res.id))
        .catch(err => console.error("Failed to create session", err));
    }
  }, [patientId, sessionId, createSession]);
  
  // Keep ref in sync so cleanup can access latest sessionId
  useEffect(() => {
    if (sessionId) {
      sessionIdRef.current = sessionId;
    }
  }, [sessionId]);

  // Complete session when patient navigates away
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        completeSession(sessionIdRef.current);
      }
    };
  }, []);

  // Handle Recording Completion
  useEffect(() => {
    if (audioBase64 && exercise && sessionId) {
      handleTranscription(audioBase64, exercise.kannadaText, exercise.id, sessionId);
    }
  }, [audioBase64, exercise, sessionId]);

  const handleTranscription = async (base64Audio: string, expectedText: string, exId: number, sessId: number) => {
    try {
      const result = await transcribeSpeech({
        data: { audio: base64Audio, expectedText }
      });
      setFeedback(result);
      await recordAttempt({
        id: sessId,
        data: {
          exerciseId: exId,
          spokenText: result.transcribedText,
          accuracyScore: result.accuracyScore,
          feedbackText: result.feedbackText
        }
      });
    } catch (err) {
      console.error("Transcription failed", err);
      setFeedback({
        transcribedText: "Error processing audio",
        accuracyScore: 0,
        feedbackText: "Could not process your speech. Please try again.",
        suggestions: ["Check microphone permissions", "Speak clearly into the device"]
      });
    }
  };

  const handleTryAgain = () => {
    setFeedback(null);
    clearRecording();
  };

  const handleContinue = async () => {
    if (nextExercise) {
      if (sessionId) {
        await completeSession(sessionId);
      }
      setFeedback(null);
      clearRecording();
      navigate(`/patient/${patientId}/exercise/${nextExercise.id}`);
    }
  };

  const isGoodScore = feedback && feedback.accuracyScore >= 70;

  if (loadingExercise) return <AppLayout role="patient"><LoadingSpinner text={t("common.loading")} /></AppLayout>;
  if (!exercise) return <AppLayout role="patient">Exercise not found</AppLayout>;

  const scoreColor = feedback
    ? feedback.accuracyScore >= 80
      ? "hsl(142, 71%, 45%)"
      : feedback.accuracyScore >= 50
        ? "hsl(38, 92%, 50%)"
        : "hsl(var(--destructive))"
    : "hsl(var(--border))";

  return (
    <AppLayout role="patient" patientId={patientId.toString()} showBack backHref={`/patient/${patientId}/category/${exercise.category}`}>
      <div className="max-w-3xl mx-auto w-full flex flex-col items-center">
        
        {/* Main Exercise Display */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-lg border border-border/50 p-8 sm:p-16 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-6 py-2 bg-muted text-muted-foreground font-medium rounded-bl-3xl text-sm uppercase tracking-wide">
            {exercise.difficulty}
          </div>
          
          <h1 className="text-6xl sm:text-8xl md:text-[140px] font-kannada font-bold text-primary mb-8 leading-tight">
            {exercise.kannadaText}
          </h1>
          
          <div className="space-y-2">
            <p className="text-2xl sm:text-3xl text-foreground font-medium">{exercise.transliteration}</p>
            <p className="text-xl sm:text-2xl text-muted-foreground">{exercise.englishMeaning}</p>
          </div>
        </div>

        {/* Interaction Area */}
        <div className="w-full min-h-[300px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {!feedback && !isTranscribing && (
              <motion.div 
                key="record-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`
                    relative group flex items-center justify-center w-32 h-32 rounded-full shadow-2xl transition-all duration-300
                    ${isRecording 
                      ? "bg-destructive hover:bg-destructive/90 shadow-destructive/40 scale-110" 
                      : "bg-primary hover:bg-primary/90 shadow-primary/40 hover:scale-105"
                    }
                  `}
                >
                  {isRecording ? (
                    <>
                      <div className="absolute inset-0 rounded-full border-4 border-destructive/30 animate-ping" />
                      <Square className="w-12 h-12 text-white fill-current" />
                    </>
                  ) : (
                    <Mic className="w-14 h-14 text-white" />
                  )}
                </button>
                <p className="mt-8 text-xl font-medium text-foreground">
                  {isRecording ? t("exercise.listening") : t("exercise.tapspeak")}
                </p>
              </motion.div>
            )}

            {isTranscribing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center text-primary"
              >
                <Loader2 className="w-16 h-16 animate-spin mb-6" />
                <p className="text-2xl font-medium">{t("exercise.analyzing")}</p>
              </motion.div>
            )}

            {feedback && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full space-y-4"
              >
                {/* Excellent banner for great scores */}
                {isGoodScore && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
                  >
                    <Trophy className="w-7 h-7 text-yellow-500 flex-shrink-0" />
                    <p className="text-green-800 font-semibold text-lg">{t("exercise.excellent")}</p>
                  </motion.div>
                )}

                <div className="w-full bg-white rounded-3xl p-8 shadow-md border border-border">
                  <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                    
                    {/* Score Circle */}
                    <div className="flex-shrink-0 relative w-40 h-40 flex items-center justify-center rounded-full border-8"
                         style={{ borderColor: scoreColor }}>
                      <div className="text-center">
                        <span className="text-4xl font-bold text-foreground">{Math.round(feedback.accuracyScore)}%</span>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{t("exercise.accuracy")}</p>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2 mb-2">
                          {isGoodScore ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : <AlertCircle className="text-amber-500 w-6 h-6" />}
                          {t("exercise.feedback")}
                        </h3>
                        <p className="text-lg text-muted-foreground bg-muted p-4 rounded-2xl">{feedback.feedbackText}</p>
                      </div>

                      {feedback.suggestions?.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">{t("exercise.tips")}</h4>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                            {feedback.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                      
                      <div className="pt-4 flex gap-4">
                        <button
                          onClick={handleTryAgain}
                          className="flex-1 py-4 rounded-2xl bg-muted text-foreground font-semibold text-lg flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors border border-border"
                        >
                          <RefreshCw className="w-5 h-5" /> {t("exercise.tryagain")}
                        </button>

                        {isGoodScore && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleContinue}
                            disabled={!nextExercise}
                            className="flex-1 py-4 rounded-2xl bg-primary text-white font-semibold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {nextExercise ? (
                              <>{t("exercise.continue")} <ArrowRight className="w-5 h-5" /></>
                            ) : (
                              <>{t("exercise.nomorenext")}</>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </AppLayout>
  );
}
