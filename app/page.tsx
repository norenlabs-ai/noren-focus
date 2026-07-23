"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DURATIONS = [
  { label: "Focus", minutes: 25 },
  { label: "Short break", minutes: 5 },
  { label: "Long break", minutes: 15 },
] as const;

type Priority = { id: number; text: string; done: boolean };

const DEFAULT_PRIORITIES: Priority[] = [
  { id: 1, text: "", done: false },
  { id: 2, text: "", done: false },
  { id: 3, text: "", done: false },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

export default function Home() {
  const [mode, setMode] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [priorities, setPriorities] = useState<Priority[]>(DEFAULT_PRIORITIES);
  const [hydrated, setHydrated] = useState(false);
  const endTime = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("noren-focus-state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.priorities)) setPriorities(parsed.priorities);
        if (typeof parsed.sessions === "number") setSessions(parsed.sessions);
      } catch {
        localStorage.removeItem("noren-focus-state");
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      "noren-focus-state",
      JSON.stringify({ priorities, sessions }),
    );
  }, [hydrated, priorities, sessions]);

  useEffect(() => {
    if (!running) return;
    endTime.current = Date.now() + secondsLeft * 1000;
    const timer = window.setInterval(() => {
      if (!endTime.current) return;
      const next = Math.max(0, Math.ceil((endTime.current - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0) {
        window.clearInterval(timer);
        setRunning(false);
        if (mode === 0) setSessions((value) => value + 1);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running]);

  const totalSeconds = DURATIONS[mode].minutes * 60;
  const progress = useMemo(
    () => ((totalSeconds - secondsLeft) / totalSeconds) * 100,
    [secondsLeft, totalSeconds],
  );

  function chooseMode(index: number) {
    setMode(index);
    setSecondsLeft(DURATIONS[index].minutes * 60);
    setRunning(false);
  }

  function resetTimer() {
    setRunning(false);
    setSecondsLeft(totalSeconds);
  }

  function updatePriority(id: number, patch: Partial<Priority>) {
    setPriorities((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="Noren Focus home">
          <span className="brandMark">N</span>
          <span>Noren Focus</span>
        </a>
        <div className="sessionCount" title="Completed focus sessions">
          <span className="pulse" />
          {sessions} session{sessions === 1 ? "" : "s"} today
        </div>
      </header>

      <section className="hero">
        <div className="eyebrow">Make space for what matters</div>
        <h1>One task. Full attention.</h1>
        <p>Choose your priorities, start the clock, and let everything else wait.</p>
      </section>

      <section className="workspace">
        <article className="timerCard">
          <nav className="modes" aria-label="Timer mode">
            {DURATIONS.map((duration, index) => (
              <button
                className={mode === index ? "active" : ""}
                key={duration.label}
                onClick={() => chooseMode(index)}
              >
                {duration.label}
              </button>
            ))}
          </nav>

          <div
            className="timerRing"
            style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}
          >
            <div className="timerFace">
              <span className="timerLabel">{DURATIONS[mode].label}</span>
              <time>{formatTime(secondsLeft)}</time>
              <span className="timerHint">{running ? "Stay with it" : "Ready when you are"}</span>
            </div>
          </div>

          <div className="timerActions">
            <button className="primaryButton" onClick={() => setRunning(!running)}>
              <span>{running ? "Pause" : "Start focus"}</span>
              <span aria-hidden="true">{running ? "Ⅱ" : "▶"}</span>
            </button>
            <button className="iconButton" onClick={resetTimer} aria-label="Reset timer">
              ↻
            </button>
          </div>
        </article>

        <article className="priorityCard">
          <div className="cardHeading">
            <div>
              <span className="sectionLabel">Today</span>
              <h2>Three priorities</h2>
            </div>
            <button
              className="clearButton"
              onClick={() => setPriorities(DEFAULT_PRIORITIES)}
            >
              Clear
            </button>
          </div>

          <div className="priorityList">
            {priorities.map((item, index) => (
              <label className={`priority ${item.done ? "done" : ""}`} key={item.id}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={(event) =>
                    updatePriority(item.id, { done: event.target.checked })
                  }
                />
                <span className="checkmark">✓</span>
                <span className="priorityNumber">0{index + 1}</span>
                <input
                  className="priorityInput"
                  value={item.text}
                  onChange={(event) =>
                    updatePriority(item.id, { text: event.target.value })
                  }
                  placeholder={
                    index === 0
                      ? "The most important thing..."
                      : "Add another priority..."
                  }
                  maxLength={90}
                />
              </label>
            ))}
          </div>

          <div className="localNote">
            <span>⌁</span>
            Saved privately in this browser
          </div>
        </article>
      </section>

      <footer>
        <span>Built for calm, deliberate work.</span>
        <span className="footerMark">NOREN LABS · 2026</span>
      </footer>
    </main>
  );
}
