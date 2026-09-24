'use client';

import { useState } from 'react';

/**
 * A cover image. Sources are given as a base path without an extension so
 * AVIF can be offered first and WebP used as the fallback.
 */
export function Cover({
  base,
  alt,
  className = '',
  eager = false,
}: {
  base: string;
  alt: string;
  className?: string;
  /** Set on anything above the fold: lazy-loading a hero delays the paint. */
  eager?: boolean;
}) {
  return (
    <picture className={`cover ${className}`}>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <img
        src={`${base}.webp`}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}

/**
 * A YouTube embed that does not load YouTube until it is clicked.
 *
 * Dropping an iframe straight into the page costs several hundred KB and
 * lets YouTube set cookies on every visitor who never presses play. This
 * shows the cover instead and swaps in the real player on click, using
 * the no-cookie host.
 */
export function Video({
  id,
  title,
  poster,
  posterAlt,
}: {
  id: string;
  title: string;
  poster?: string;
  posterAlt?: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="video">
      <button
        type="button"
        className="video-facade"
        onClick={() => setPlaying(true)}
        aria-label={`Play video: ${title}`}
      >
        {poster ? (
          <picture>
            <source srcSet={`${poster}.avif`} type="image/avif" />
            <img src={`${poster}.webp`} alt={posterAlt ?? ''} decoding="async" />
          </picture>
        ) : (
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            alt=""
            decoding="async"
          />
        )}
        <span className="video-play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
        <span className="video-label">{title}</span>
      </button>
    </div>
  );
}
