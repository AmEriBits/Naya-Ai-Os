"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const enabled = window.localStorage.getItem("naya-theme") === "dark";
    setDarkMode(enabled);
    document.documentElement.dataset.theme = enabled ? "dark" : "light";
  }, []);

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("naya-theme", next ? "dark" : "light");
  }

  return (
    <button
      className="icon-button global-theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
      title={`Switch to ${darkMode ? "light" : "dark"} mode`}
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
