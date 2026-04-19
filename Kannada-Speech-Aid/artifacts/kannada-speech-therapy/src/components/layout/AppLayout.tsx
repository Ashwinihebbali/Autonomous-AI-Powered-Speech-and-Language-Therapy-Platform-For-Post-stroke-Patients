import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, User, Home, ArrowLeft, LogOut, Languages } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppLayoutProps {
  children: ReactNode;
  role: "patient" | "therapist" | "none";
  patientId?: string;
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function AppLayout({ children, role, patientId, title, showBack, backHref }: AppLayoutProps) {
  const { logout, user } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const [, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBack && backHref && (
              <Link href={backHref} className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
            )}
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/30 group-hover:scale-105 transition-all">
                <Activity className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground hidden sm:block">
                Kannada Speech
              </span>
            </Link>
          </div>

          {title && (
            <h1 className="absolute left-1/2 -translate-x-1/2 font-display font-semibold text-lg sm:text-xl text-foreground">
              {title}
            </h1>
          )}

          <nav className="flex items-center gap-1 sm:gap-2">
            {role === "patient" && patientId && (
              <>
                <Link href={`/patient/${patientId}`} className="px-3 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                </Link>
                <Link href={`/patient/${patientId}/progress`} className="px-3 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("nav.progress")}</span>
                </Link>
              </>
            )}
            
            {role === "therapist" && (
              <Link href="/therapist" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("nav.patients")}</span>
              </Link>
            )}

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "kn" : "en")}
              title={lang === "en" ? "Switch to Kannada" : "Switch to English"}
              className="px-3 py-2 rounded-full text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground border border-border/50"
            >
              <Languages className="w-4 h-4" />
              <span className="text-xs font-bold">{lang === "en" ? "ಕನ್ನಡ" : "EN"}</span>
            </button>

            {/* Logout */}
            {user && (
              <button
                onClick={handleLogout}
                title={t("nav.logout")}
                className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
    </div>
  );
}
