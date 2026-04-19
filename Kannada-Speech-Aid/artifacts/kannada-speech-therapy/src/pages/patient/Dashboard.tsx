import { useParams, Link } from "wouter";
import { useGetPatient } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import { Mic2, Type, WholeWord, AlignLeft, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PatientDashboard() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");
  const { t } = useLanguage();
  
  const CATEGORIES = [
    { id: "vowels", titleKey: "category.vowels", descKey: "category.vowels.desc", icon: Mic2, color: "bg-teal-50 text-teal-600", border: "border-teal-100 hover:border-teal-300" },
    { id: "consonants", titleKey: "category.consonants", descKey: "category.consonants.desc", icon: Type, color: "bg-orange-50 text-orange-600", border: "border-orange-100 hover:border-orange-300" },
    { id: "words", titleKey: "category.words", descKey: "category.words.desc", icon: WholeWord, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100 hover:border-yellow-300" },
    { id: "sentences", titleKey: "category.sentences", descKey: "category.sentences.desc", icon: AlignLeft, color: "bg-pink-50 text-pink-600", border: "border-pink-100 hover:border-pink-300" },
  ];

  const { data: patient, isLoading } = useGetPatient(patientId, { query: { enabled: !!patientId }});

  if (isLoading) return <AppLayout role="patient"><LoadingSpinner text={t("common.loading")} /></AppLayout>;
  if (!patient) return <AppLayout role="patient">Patient not found</AppLayout>;

  return (
    <AppLayout role="patient" patientId={patientId.toString()} title={t("nav.dashboard")} showBack backHref="/patient-select">
      <div className="max-w-5xl mx-auto w-full">
        
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-border mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            {t("patient.greeting")}, {patient.name}! 👋
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t("patient.ready")}
          </p>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-6 px-2">{t("patient.categories")}</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CATEGORIES.map((cat, i) => (
            <Link key={cat.id} href={`/patient/${patientId}/category/${cat.id}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white p-8 rounded-3xl shadow-sm border-2 ${cat.border} cursor-pointer transition-all h-full flex flex-col items-center justify-center text-center group`}
              >
                <div className={`w-20 h-20 rounded-2xl ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">{t(cat.titleKey)}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{t(cat.descKey)}</p>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">Beginner</span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">Intermediate</span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">Advanced</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <Link href={`/patient/${patientId}/progress`}>
          <motion.div
            whileHover={{ y: -2 }}
            className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center gap-4 cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">{t("patient.viewprogress")}</h3>
              <p className="text-sm text-muted-foreground">{t("nav.progress")}</p>
            </div>
          </motion.div>
        </Link>
        
      </div>
    </AppLayout>
  );
}
