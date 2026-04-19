import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import Login from "@/pages/Login";
import Home from "@/pages/Home";
import PatientSelect from "@/pages/patient/PatientSelect";
import PatientDashboard from "@/pages/patient/Dashboard";
import ExerciseList from "@/pages/patient/ExerciseList";
import ExerciseDetail from "@/pages/patient/ExerciseDetail";
import PatientProgressView from "@/pages/patient/Progress";
import TherapistDashboard from "@/pages/therapist/Dashboard";
import TherapistPatientDetail from "@/pages/therapist/PatientDetail";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) return null;
  if (!user) {
    navigate("/login");
    return null;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      
      {/* Patient Routes */}
      <Route path="/patient-select" component={PatientSelect} />
      <Route path="/patient/:id">
        <ProtectedRoute><PatientDashboard /></ProtectedRoute>
      </Route>
      <Route path="/patient/:id/category/:category">
        <ProtectedRoute><ExerciseList /></ProtectedRoute>
      </Route>
      <Route path="/patient/:id/exercise/:exerciseId">
        <ProtectedRoute><ExerciseDetail /></ProtectedRoute>
      </Route>
      <Route path="/patient/:id/progress">
        <ProtectedRoute><PatientProgressView /></ProtectedRoute>
      </Route>
      
      {/* Therapist Routes */}
      <Route path="/therapist">
        <ProtectedRoute><TherapistDashboard /></ProtectedRoute>
      </Route>
      <Route path="/therapist/patient/:id">
        <ProtectedRoute><TherapistPatientDetail /></ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
