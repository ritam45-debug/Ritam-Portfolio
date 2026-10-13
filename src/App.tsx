import { useEffect, useState } from "react";
import { applyAccent, applyTheme, getInitialAccent, getInitialTheme, type Accent, type Theme } from "./lib/theme";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { CompetitionDashboard } from "./components/CompetitionDashboard";
import { Work } from "./components/Work";
import { BackToTop, Footer } from "./components/Footer";

// Sections currently live: Hero (intro), About, Projects (Blue Star, FADM), Competition record dashboard.
// Parked components, ready to re-add on request: Projects, Playground, Journey,
// Interests, AskRitam, Journal, Contact (all in src/components/).

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [accent, setAccent] = useState<Accent>(() => getInitialAccent());
  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => { applyAccent(accent); }, [accent]);

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
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
