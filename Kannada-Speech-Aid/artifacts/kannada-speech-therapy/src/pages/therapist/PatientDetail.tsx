import { useParams, Link } from "wouter";
import { useGetPatient, useGetPatientProgress, useGetPatientSessions } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Calendar, User, CheckCircle2 } from "lucide-react";
import { PatientNotes } from "@/components/PatientNotes";

export default function TherapistPatientDetail() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");

  const { data: patient, isLoading: loadingPatient } = useGetPatient(patientId, { query: { queryKey: ["patient", patientId], enabled: !!patientId }});
  const { data: progress } = useGetPatientProgress(patientId, { query: { queryKey: ["progress", patientId], enabled: !!patientId }});
  const { data: sessions } = useGetPatientSessions(patientId, { query: { queryKey: ["sessions", patientId], enabled: !!patientId }});

  if (loadingPatient) return <AppLayout role="therapist"><LoadingSpinner text="Loading patient data..." /></AppLayout>;
  if (!patient) return <AppLayout role="therapist">Patient not found</AppLayout>;

  return (
    <AppLayout role="therapist" title={`Patient: ${patient.name}`} showBack backHref="/therapist">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{patient.name}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
              <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">Age: {patient.age}</span>
              <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">Condition: {patient.condition}</span>
              <span className="bg-muted px-3 py-1 rounded-full text-sm font-medium text-foreground">Joined: {format(new Date(patient.createdAt), "MMM yyyy")}</span>
            </div>
            </div>
          
          <div className="flex-shrink-0 grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-muted/50 p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-primary">{patient.totalSessions}</p>
              <p className="text-xs font-medium text-muted-foreground uppercase">Sessions</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl text-center">
              <p className="text-3xl font-bold text-secondary">{patient.averageScore ? Math.round(patient.averageScore) : 0}%</p>
              <p className="text-xs font-medium text-muted-foreground uppercase">Avg Score</p>
            </div>
          </div>
        </div>

        {/* Therapist Notes — editable */}
        <PatientNotes patientId={patientId} initialNotes={patient.therapistNotes} />

        {/* Charts */}
        {progress && progress.weeklyScores.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Progress Trend</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.weeklyScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="averageScore" name="Score %" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ fill: "hsl(var(--primary))", r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Session History */}
        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> Session History
            </h2>
          </div>
          <div className="divide-y divide-border">
            {sessions?.map(session => (
              <div key={session.id} className="p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {format(new Date(session.startedAt), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    {format(new Date(session.startedAt), "h:mm a")} 
                    <span className="opacity-50">•</span> 
                    {session.totalAttempts} exercise attempts
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Avg Accuracy</p>
                    <p className={`text-2xl font-bold ${session.averageScore && session.averageScore >= 80 ? 'text-success' : 'text-warning'}`}>
                      {session.averageScore ? `${Math.round(session.averageScore)}%` : '-'}
                    </p>
                  </div>
                  {session.status === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8 text-success opacity-80" />
                  ) : (
                    <div className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">IN PROGRESS</div>
                  )}
                </div>
              </div>
            ))}
            {sessions?.length === 0 && (
              <div className="p-12 text-center text-muted-foreground">
                No sessions recorded yet for this patient.
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
