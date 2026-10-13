import { useCallback, useEffect, useRef, useState } from "react";
import { applyAccent, applyTheme, getInitialAccent, getInitialTheme, type Accent, type Theme } from "./lib/theme";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { CompetitionDashboard } from "./components/CompetitionDashboard";
import { Work } from "./components/Work";
import { BackToTop, Footer } from "./components/Footer";
import { Consult, WhatsAppFab } from "./components/Consult";
import { Trivia } from "./components/Trivia";
import { Toast } from "./components/ui";

// Sections currently live: Hero, About, Projects (Blue Star, FADM), Competition record, Finance & Marketing trivia, Consult.
// Parked components, ready to re-add on request: Projects, Playground, Journey,
// Interests, AskRitam, Journal, Contact (all in src/components/).

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [accent, setAccent] = useState<Accent>(() => getInitialAccent());
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyAccent(accent); }, [accent]);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number>();
  const showToast = useCallback((m: string) => {
    setToast(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <Nav theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} accent={accent} onAccent={setAccent} />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <CompetitionDashboard />
        <Trivia />
        <Consult onToast={showToast} />
      </main>
      <Footer />
      <WhatsAppFab />
      <BackToTop />
      <Toast message={toast} />
    </>
  );
}
