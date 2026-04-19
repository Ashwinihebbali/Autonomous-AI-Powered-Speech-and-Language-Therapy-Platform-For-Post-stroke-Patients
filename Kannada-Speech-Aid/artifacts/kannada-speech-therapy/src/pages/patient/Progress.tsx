import { useParams } from "wouter";
import { useGetPatientProgress, useGetPatient } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Trophy, Target, Activity } from "lucide-react";

export default function PatientProgressView() {
  const params = useParams();
  const patientId = parseInt(params.id || "0");

  const { data: patient } = useGetPatient(patientId, { query: { enabled: !!patientId }});
  const { data: progress, isLoading } = useGetPatientProgress(patientId, { query: { enabled: !!patientId }});

  if (isLoading) return <AppLayout role="patient"><LoadingSpinner text="Loading your progress..." /></AppLayout>;
  if (!progress) return <AppLayout role="patient">No progress data available.</AppLayout>;

  return (
    <AppLayout role="patient" patientId={patientId.toString()} title="My Progress" showBack backHref={`/patient/${patientId}`}>
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Average Score</p>
              <p className="text-4xl font-bold text-foreground">{progress.averageScore ? Math.round(progress.averageScore) : 0}%</p>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Target className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Attempts</p>
              <p className="text-4xl font-bold text-foreground">{progress.totalAttempts}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-border flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-accent/20 text-accent-foreground flex items-center justify-center">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Sessions</p>
              <p className="text-4xl font-bold text-foreground">{progress.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weekly Trend Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Weekly Improvement</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.weeklyScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="averageScore" 
                    name="Score %"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">Performance by Category</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress.categoryScores} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} hide />
                  <YAxis dataKey="category" type="category" stroke="hsl(var(--foreground))" fontSize={14} fontWeight={500} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--muted))'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="averageScore" name="Score %" fill="hsl(var(--secondary))" radius={[0, 8, 8, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
