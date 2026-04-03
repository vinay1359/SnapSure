"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(mode === "dark" ? "theme-dark" : "theme-light");
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("snapsure-theme");
    const initial: ThemeMode =
      saved === "light" || saved === "dark"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setMode(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
    window.localStorage.setItem("snapsure-theme", next);
  };

  return (
    <button className="theme-toggle" type="button" onClick={toggle} aria-label="Toggle color theme">
      <span>{mode === "dark" ? "Dark" : "Light"}</span>
      <span className="theme-toggle__dot" />
    </button>
  );
}
