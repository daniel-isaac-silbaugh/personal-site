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

  return (
    <button id="theme-toggle" className="theme-toggle" aria-label="Toggle color theme" />
  );
}
