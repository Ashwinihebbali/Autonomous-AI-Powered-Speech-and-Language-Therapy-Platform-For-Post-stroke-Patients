import { useState } from "react";
import { Link } from "wouter";
import { useGetProgressSummary, useCreatePatient } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Plus, Search, TrendingUp, Minus, TrendingDown, Users } from "lucide-react";
import { format } from "date-fns";

export default function TherapistDashboard() {
  const { data: summaries, isLoading, refetch } = useGetProgressSummary();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const safeSummaries = Array.isArray(summaries) ? summaries : [];

  const filteredPatients = safeSummaries.filter(s =>
    s.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  const renderTrend = (trend: string) => {
    switch(trend) {
      case 'improving': return <div className="flex items-center text-success bg-success/10 px-3 py-1 rounded-full text-sm font-medium"><TrendingUp className="w-4 h-4 mr-1"/> Improving</div>;
      case 'declining': return <div className="flex items-center text-destructive bg-destructive/10 px-3 py-1 rounded-full text-sm font-medium"><TrendingDown className="w-4 h-4 mr-1"/> Declining</div>;
      case 'stable': return <div className="flex items-center text-warning bg-warning/10 px-3 py-1 rounded-full text-sm font-medium"><Minus className="w-4 h-4 mr-1"/> Stable</div>;
      default: return <div className="flex items-center text-muted-foreground bg-muted px-3 py-1 rounded-full text-sm font-medium">No data</div>;
    }
  };

  const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

const getGreetingKannada = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "ಶುಭ ಬೆಳಗು";
  if (hour < 17) return "ಶುಭ ಮಧ್ಯಾಹ್ನ";
  return "ಶುಭ ಸಂಜೆ";
};

  return (
    <AppLayout role="therapist" title="Therapist Dashboard">
      <div className="w-full">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
  <p className="text-lg text-muted-foreground">
    {getGreetingKannada()} — {getGreeting()}, Therapist! 👋
  </p>
  <h1 className="text-3xl font-display font-bold text-foreground">
    Patient Roster
  </h1>
  <p className="text-muted-foreground mt-1">
    Monitor all your patients' speech therapy progress.
  </p>
</div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> New Patient
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center gap-4 bg-muted/30">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search patients..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>
            <div className="text-sm font-medium text-muted-foreground hidden sm:block">
              <Users className="w-4 h-4 inline mr-2" />
              {summaries?.length || 0} Total Patients
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Patient Name</th>
                    <th className="px-6 py-4 font-semibold">Last Session</th>
                    <th className="px-6 py-4 font-semibold">Total Sessions</th>
                    <th className="px-6 py-4 font-semibold">Avg Score</th>
                    <th className="px-6 py-4 font-semibold">Trend</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPatients.map(patient => (
                    <tr key={patient.patientId} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-5 font-bold text-foreground text-lg">
                        <Link href={`/therapist/patient/${patient.patientId}`} className="hover:text-primary transition-colors">
                          {patient.patientName}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-muted-foreground">
                        {patient.lastSessionDate ? format(new Date(patient.lastSessionDate), "MMM d, yyyy") : "Never"}
                      </td>
                      <td className="px-6 py-5 text-foreground font-medium">{patient.totalSessions}</td>
                      <td className="px-6 py-5 font-bold text-foreground">
                        {patient.averageScore ? `${Math.round(patient.averageScore)}%` : "-"}
                      </td>
                      <td className="px-6 py-5">
                        {renderTrend(patient.trend)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link href={`/therapist/patient/${patient.patientId}`} className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                        No patients found matching "{search}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddPatientModal onClose={() => setShowAddModal(false)} onSuccess={refetch} />}
    </AppLayout>
  );
}

// Simple Add Patient Modal
function AddPatientModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const { mutateAsync: createPatient, isPending } = useCreatePatient();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createPatient({
        data: {
          name: fd.get("name") as string,
          age: parseInt(fd.get("age") as string),
          condition: fd.get("condition") as string,
          therapistNotes: fd.get("notes") as string,
        }
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to create patient");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-foreground mb-6">Register New Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
            <input required name="name" type="text" className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Age</label>
            <input required name="age" type="number" min="1" max="120" className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Condition/Diagnosis</label>
            <input required name="condition" type="text" placeholder="e.g., Post-stroke Aphasia" className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Notes (Optional)</label>
            <textarea name="notes" rows={3} className="w-full p-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:outline-none"></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={isPending} className="px-5 py-2.5 rounded-xl font-medium bg-primary text-white hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
              {isPending ? "Saving..." : "Save Patient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
