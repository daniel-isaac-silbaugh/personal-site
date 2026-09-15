'use client';

import { useEffect } from 'react';

export default function ThemeToggle() {
  useEffect(() => {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const toggle = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      }
    };
    btn.addEventListener('click', toggle);
    return () => btn.removeEventListener('click', toggle);
  }, []);

  // Both labels are rendered and CSS shows the one matching the current
  // theme. The theme is set by an inline script before React hydrates, so
  // picking the label in JS here would risk a hydration mismatch.
  return (
    <button
      id="theme-toggle"
      className="theme-toggle"
      aria-label="Toggle between light and dark"
    >
      <span className="tt-dot" aria-hidden="true" />
      <span className="tt-label tt-when-light">Light</span>
      <span className="tt-label tt-when-dark">Dark</span>
    </button>
  );
}
