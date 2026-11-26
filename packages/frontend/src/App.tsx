import { GraduationCap, Info, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from './hooks/theme.context';
import type { ExamSummary } from './lib/study-data';
import { AboutPage } from './study/AboutPage';
import { ExamPicker } from './study/ExamPicker';
import { ExamView } from './study/ExamView';
import { StartOver } from './study/StartOver';

function App() {
  const [exam, setExam] = useState<ExamSummary | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const goHome = () => {
    setShowAbout(false);
    setExam(null);
  };
  // Bumped after a reset so the current screen reloads its (now empty) progress.
  const [resetCount, setResetCount] = useState(0);
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-background font-base text-foreground">
      <div aria-hidden className="app-aura pointer-events-none absolute inset-x-0 top-0 h-[40rem]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-500 sm:px-800">
        <header className="flex items-center justify-between py-500">
          <button
            type="button"
            onClick={goHome}
            className="inline-flex items-center gap-200 rounded-full text-left focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="icon-size-300" aria-hidden />
            </span>
            <span className="flex flex-col whitespace-nowrap leading-tight">
              <span className="font-heading text-400 font-bold">Ready, Set, Cert!</span>
              <span className="text-200 text-muted-foreground">MS Exam Study Tracker</span>
            </span>
          </button>
          <span className="flex items-center gap-200">
            <button
              type="button"
              onClick={() => setShowAbout(true)}
              aria-current={showAbout ? 'page' : undefined}
              className="inline-flex items-center gap-100 rounded-full px-300 py-200 text-300 font-medium text-muted-foreground hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring aria-[current=page]:text-primary"
            >
              <Info className="icon-size-300 sm:icon-size-200" aria-hidden />
              <span className="sr-only sm:not-sr-only">About</span>
            </button>
            <StartOver onReset={() => setResetCount((n) => n + 1)} />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid size-9 place-items-center rounded-full border border-border hover:bg-hover focus-visible:outline-2 focus-visible:outline-ring"
            >
              {isDark ? <Sun className="icon-size-300" aria-hidden /> : <Moon className="icon-size-300" aria-hidden />}
            </button>
          </span>
        </header>

        <main key={resetCount} className="flex-1 pt-600">
          {showAbout ? (
            <AboutPage onBack={goHome} />
          ) : exam ? (
            <ExamView exam={exam} onBack={() => setExam(null)} />
          ) : (
            <ExamPicker onPick={setExam} />
          )}
        </main>

        <footer className="mt-800 border-t border-border py-600 text-200 text-muted-foreground">
          Skills measured come from the official Microsoft Learn study guides. Always check the study guide for the
          latest exam outline. Built with Fabric Apps.
        </footer>
      </div>
    </div>
  );
}

export default App;
