import { useParams, Link } from "wouter";
import { useListExercises } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { PlayCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ExerciseList() {
  const params = useParams();
  const patientId = params.id;
  const category = params.category as any;
  const { t } = useLanguage();

  const { data: exercises, isLoading } = useListExercises({ category });

  const formatCategory = (cat: string) => {
    const key = `category.${cat}`;
    const translated = t(key);
    return translated !== key ? translated : cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  if (isLoading) return <AppLayout role="patient" patientId={patientId}><LoadingSpinner text={t("common.loading")} /></AppLayout>;

  return (
    <AppLayout role="patient" patientId={patientId} title={`${formatCategory(category)}`} showBack backHref={`/patient/${patientId}`}>
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">{t("exercise.select")}</h1>
          <p className="text-lg text-muted-foreground mt-2">{t("exercise.tap")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {exercises?.map((exercise) => (
            <Link key={exercise.id} href={`/patient/${patientId}/exercise/${exercise.id}`}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {exercise.difficulty}
                    </span>
                  </div>
                  <h3 className="text-3xl font-kannada font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {exercise.kannadaText}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {exercise.transliteration} <span className="mx-2 opacity-50">•</span> {exercise.englishMeaning}
                  </p>
                </div>
                
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                  <PlayCircle className="w-8 h-8" />
                </div>
              </div>
            </Link>
          ))}

          {exercises?.length === 0 && (
            <div className="text-center p-12 bg-white rounded-3xl border border-border text-muted-foreground">
              No exercises found for this category yet.
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  );
}
