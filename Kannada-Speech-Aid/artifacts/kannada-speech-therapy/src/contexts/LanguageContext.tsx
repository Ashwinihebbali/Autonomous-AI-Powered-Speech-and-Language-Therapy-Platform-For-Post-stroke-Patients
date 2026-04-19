import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "kn";

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", kn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  "nav.progress": { en: "Progress", kn: "ಪ್ರಗತಿ" },
  "nav.patients": { en: "Patients", kn: "ರೋಗಿಗಳು" },
  "nav.logout": { en: "Logout", kn: "ಲಾಗ್ ಔಟ್" },
  "nav.home": { en: "Home", kn: "ಮನೆ" },

  // Home
  "home.welcome": { en: "Welcome to", kn: "ಸ್ವಾಗತ" },
  "home.title": { en: "Kannada Speech Therapy", kn: "ಕನ್ನಡ ಭಾಷಣ ಚಿಕಿತ್ಸೆ" },
  "home.subtitle": { en: "AI-assisted pronunciation practice and progress tracking for your recovery journey.", kn: "ನಿಮ್ಮ ಚೇತರಿಕೆಯ ಪ್ರಯಾಣಕ್ಕಾಗಿ AI-ಸಹಾಯಿತ ಉಚ್ಚಾರಣ ಅಭ್ಯಾಸ ಮತ್ತು ಪ್ರಗತಿ ಟ್ರ್ಯಾಕಿಂಗ್." },
  "home.patient": { en: "I am a Patient", kn: "ನಾನು ರೋಗಿ" },
  "home.patient.desc": { en: "Start your daily speech exercises and track your progress.", kn: "ನಿಮ್ಮ ದೈನಂದಿನ ಭಾಷಣ ವ್ಯಾಯಾಮ ಪ್ರಾರಂಭಿಸಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ." },
  "home.therapist": { en: "I am a Therapist", kn: "ನಾನು ಚಿಕಿತ್ಸಕ" },
  "home.therapist.desc": { en: "Manage your patients, review sessions, and monitor improvement.", kn: "ನಿಮ್ಮ ರೋಗಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ, ಅಧಿವೇಶನಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸುಧಾರಣೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ." },

  // Login
  "login.title": { en: "Kannada Speech Therapy", kn: "ಕನ್ನಡ ಭಾಷಣ ಚಿಕಿತ್ಸೆ" },
  "login.subtitle": { en: "Sign in to continue your therapy journey", kn: "ನಿಮ್ಮ ಚಿಕಿತ್ಸೆ ಮುಂದುವರಿಸಲು ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  "login.signin": { en: "Sign In", kn: "ಸೈನ್ ಇನ್" },
  "login.signup": { en: "Sign Up", kn: "ಸೈನ್ ಅಪ್" },
  "login.forgot": { en: "Forgot Password", kn: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ" },
  "login.email": { en: "Email Address", kn: "ಇಮೇಲ್ ವಿಳಾಸ" },
  "login.password": { en: "Password", kn: "ಪಾಸ್‌ವರ್ಡ್" },
  "login.name": { en: "Full Name", kn: "ಪೂರ್ಣ ಹೆಸರು" },
  "login.age": { en: "Age", kn: "ವಯಸ್ಸು" },
  "login.condition": { en: "Medical Condition", kn: "ವೈದ್ಯಕೀಯ ಸ್ಥಿತಿ" },
  "login.role": { en: "I am a", kn: "ನಾನು" },
  "login.patient": { en: "Patient", kn: "ರೋಗಿ" },
  "login.therapist": { en: "Therapist", kn: "ಚಿಕಿತ್ಸಕ" },
  "login.submit.signin": { en: "Sign In", kn: "ಸೈನ್ ಇನ್ ಮಾಡಿ" },
  "login.submit.signup": { en: "Create Account", kn: "ಖಾತೆ ರಚಿಸಿ" },
  "login.submit.reset": { en: "Send Reset Link", kn: "ರೀಸೆಟ್ ಲಿಂಕ್ ಕಳುಹಿಸಿ" },
  "login.noaccount": { en: "Don't have an account?", kn: "ಖಾತೆ ಇಲ್ಲವೇ?" },
  "login.hasaccount": { en: "Already have an account?", kn: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?" },
  "login.forgotlink": { en: "Forgot password?", kn: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?" },
  "login.backto": { en: "Back to sign in", kn: "ಸೈನ್ ಇನ್‌ಗೆ ಹಿಂತಿರುಗಿ" },
  "login.confirmpassword": { en: "Confirm Password", kn: "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ" },
  "login.reset.sent": { en: "Reset link sent! Check your email.", kn: "ರೀಸೆಟ್ ಲಿಂಕ್ ಕಳುಹಿಸಲಾಗಿದೆ! ನಿಮ್ಮ ಇಮೇಲ್ ಪರಿಶೀಲಿಸಿ." },
  "login.signup.success": { en: "Account created! Signing you in...", kn: "ಖಾತೆ ರಚಿಸಲಾಗಿದೆ! ಸೈನ್ ಇನ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." },

  // Patient Dashboard
  "patient.greeting": { en: "Hello", kn: "ನಮಸ್ಕಾರ" },
  "patient.ready": { en: "Ready for today's practice?", kn: "ಇಂದಿನ ಅಭ್ಯಾಸಕ್ಕೆ ಸಿದ್ಧರಿದ್ದೀರಾ?" },
  "patient.categories": { en: "Exercise Categories", kn: "ವ್ಯಾಯಾಮ ವಿಭಾಗಗಳು" },
  "patient.viewprogress": { en: "View My Progress", kn: "ನನ್ನ ಪ್ರಗತಿ ನೋಡಿ" },
  "category.vowels": { en: "Vowels", kn: "ಸ್ವರಗಳು" },
  "category.consonants": { en: "Consonants", kn: "ವ್ಯಂಜನಗಳು" },
  "category.words": { en: "Words", kn: "ಪದಗಳು" },
  "category.sentences": { en: "Sentences", kn: "ವಾಕ್ಯಗಳು" },
  "category.vowels.desc": { en: "Practice Kannada vowel sounds", kn: "ಕನ್ನಡ ಸ್ವರ ಧ್ವನಿಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ" },
  "category.consonants.desc": { en: "Master consonant pronunciation", kn: "ವ್ಯಂಜನ ಉಚ್ಚಾರಣೆಯನ್ನು ಕರಗತ ಮಾಡಿ" },
  "category.words.desc": { en: "Common Kannada words", kn: "ಸಾಮಾನ್ಯ ಕನ್ನಡ ಪದಗಳು" },
  "category.sentences.desc": { en: "Full sentence practice", kn: "ಸಂಪೂರ್ಣ ವಾಕ್ಯ ಅಭ್ಯಾಸ" },

  // Exercise
  "exercise.select": { en: "Select an Exercise", kn: "ವ್ಯಾಯಾಮ ಆಯ್ಕೆ ಮಾಡಿ" },
  "exercise.tap": { en: "Tap on any item to start practicing.", kn: "ಅಭ್ಯಾಸ ಪ್ರಾರಂಭಿಸಲು ಯಾವುದಾದರೂ ಐಟಂ ಟ್ಯಾಪ್ ಮಾಡಿ." },
  "exercise.tapspeak": { en: "Tap to speak", kn: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ" },
  "exercise.listening": { en: "Listening... Tap to stop", kn: "ಕೇಳುತ್ತಿದೆ... ನಿಲ್ಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ" },
  "exercise.analyzing": { en: "Analyzing your pronunciation...", kn: "ನಿಮ್ಮ ಉಚ್ಚಾರಣೆ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." },
  "exercise.feedback": { en: "Feedback", kn: "ಪ್ರತಿಕ್ರಿಯೆ" },
  "exercise.tips": { en: "Tips to improve:", kn: "ಸುಧಾರಿಸಲು ಸಲಹೆಗಳು:" },
  "exercise.tryagain": { en: "Try Again", kn: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ" },
  "exercise.continue": { en: "Continue to Next", kn: "ಮುಂದಿನದಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ" },
  "exercise.accuracy": { en: "Accuracy", kn: "ನಿಖರತೆ" },
  "exercise.excellent": { en: "Excellent! Keep it up!", kn: "ಅದ್ಭುತ! ಹೀಗೆಯೇ ಮುಂದುವರಿಸಿ!" },
  "exercise.difficulty": { en: "Difficulty", kn: "ಕಷ್ಟದ ಮಟ್ಟ" },
  "exercise.nomorenext": { en: "You've completed all exercises!", kn: "ನೀವು ಎಲ್ಲಾ ವ್ಯಾಯಾಮಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ!" },

  // Progress
  "progress.title": { en: "My Progress", kn: "ನನ್ನ ಪ್ರಗತಿ" },
  "progress.sessions": { en: "Total Sessions", kn: "ಒಟ್ಟು ಅಧಿವೇಶನಗಳು" },
  "progress.attempts": { en: "Total Attempts", kn: "ಒಟ್ಟು ಪ್ರಯತ್ನಗಳು" },
  "progress.avgscore": { en: "Avg Score", kn: "ಸರಾಸರಿ ಅಂಕ" },
  "progress.weekly": { en: "Weekly Progress", kn: "ಸಾಪ್ತಾಹಿಕ ಪ್ರಗತಿ" },
  "progress.category": { en: "Score by Category", kn: "ವಿಭಾಗದ ಅಂಕ" },
  "progress.nosessions": { en: "No sessions yet. Start practicing!", kn: "ಇನ್ನೂ ಅಧಿವೇಶನಗಳಿಲ್ಲ. ಅಭ್ಯಾಸ ಪ್ರಾರಂಭಿಸಿ!" },

  // Therapist
  "therapist.dashboard": { en: "Therapist Dashboard", kn: "ಚಿಕಿತ್ಸಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್" },
  "therapist.addpatient": { en: "Add Patient", kn: "ರೋಗಿಯನ್ನು ಸೇರಿಸಿ" },
  "therapist.sessions": { en: "sessions", kn: "ಅಧಿವೇಶನಗಳು" },
  "therapist.lastseen": { en: "Last seen", kn: "ಕಡೆಯ ಬಾರಿ" },
  "therapist.nopatients": { en: "No patients yet. Add your first patient.", kn: "ಇನ್ನೂ ರೋಗಿಗಳಿಲ್ಲ. ನಿಮ್ಮ ಮೊದಲ ರೋಗಿಯನ್ನು ಸೇರಿಸಿ." },

  // Common
  "common.loading": { en: "Loading...", kn: "ಲೋಡ್ ಆಗುತ್ತಿದೆ..." },
  "common.error": { en: "Something went wrong", kn: "ಏನೋ ತಪ್ಪಾಗಿದೆ" },
  "common.back": { en: "Back", kn: "ಹಿಂದೆ" },
  "common.save": { en: "Save", kn: "ಉಳಿಸಿ" },
  "common.cancel": { en: "Cancel", kn: "ರದ್ದುಮಾಡಿ" },
  "common.viewdetails": { en: "View Details", kn: "ವಿವರಗಳನ್ನು ನೋಡಿ" },
  "common.improving": { en: "Improving", kn: "ಸುಧಾರಿಸುತ್ತಿದೆ" },
  "common.stable": { en: "Stable", kn: "ಸ್ಥಿರ" },
  "common.declining": { en: "Declining", kn: "ಕುಸಿಯುತ್ತಿದೆ" },
  "common.no_data": { en: "No Data", kn: "ಡೇಟಾ ಇಲ್ಲ" },
  "common.score": { en: "Score", kn: "ಅಂಕ" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("kst_lang") as Language) || "en";
  });

  const handleSetLang = (l: Language) => {
    setLang(l);
    localStorage.setItem("kst_lang", l);
  };

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? translations[key]?.["en"] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
