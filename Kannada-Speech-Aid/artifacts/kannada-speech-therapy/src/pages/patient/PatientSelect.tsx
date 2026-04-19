import { useListPatients } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { User, UserPlus } from "lucide-react";

export default function PatientSelect() {
  const { data: patients, isLoading, error } = useListPatients();

  return (
    <AppLayout role="none" showBack backHref="/">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">Who is practicing today?</h1>
          <p className="text-xl text-muted-foreground">Select your name to start your exercises.</p>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading patients..." />
        ) : error ? (
          <div className="text-center p-8 bg-destructive/10 rounded-3xl text-destructive font-medium border border-destructive/20">
            Failed to load patients. Please try again.
          </div>
        ) : !patients || patients.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-border flex flex-col items-center">
            <UserPlus className="w-16 h-16 text-muted-foreground mb-6 opacity-50" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-6">A therapist needs to register you first.</p>
            <Link href="/therapist" className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Go to Therapist Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient, i) => (
              <Link key={patient.id} href={`/patient/${patient.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-6 rounded-3xl shadow-md border border-border hover:border-primary hover:shadow-xl transition-all cursor-pointer flex items-center gap-5"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Age {patient.age}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
