import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, ActivitySquare, HeartPulse, Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Home() {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[100px] pointer-events-none" />

      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(lang === "en" ? "kn" : "en")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-border shadow-sm text-sm font-medium hover:bg-white transition-colors"
        >
          <Languages className="w-4 h-4 text-muted-foreground" />
          <span>{lang === "en" ? "ಕನ್ನಡ" : "English"}</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl w-full flex flex-col items-center text-center z-10"
      >
        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-8 border border-border">
          <HeartPulse className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-display font-bold text-foreground mb-6 tracking-tight">
          {t("home.welcome")} <span className="text-gradient">{t("home.title")}</span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          {t("home.subtitle")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <motion.div 
            onClick={() => { window.location.href = "/login"; }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-8 shadow-lg shadow-primary/5 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer flex flex-col items-center text-center h-full group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{t("home.patient")}</h2>
            <p className="text-muted-foreground">{t("home.patient.desc")}</p>
          </motion.div>

          <motion.div 
            onClick={() => { window.location.href = "/login?role=therapist"; }}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-3xl p-8 shadow-lg shadow-secondary/5 border border-secondary/10 hover:border-secondary/30 transition-all cursor-pointer flex flex-col items-center text-center h-full group"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
              <ActivitySquare className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{t("home.therapist")}</h2>
            <p className="text-muted-foreground">{t("home.therapist.desc")}</p>
          </motion.div>
        </div>
        </motion.div>
    </div>
  );
}
