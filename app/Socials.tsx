// Social links for the homepage rail. Icons are inline so there is no
// icon-font dependency; they inherit currentColor.

type Social = {
  label: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
};

const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor' } as const;

export const SOCIALS: Social[] = [
  {
    label: 'Email',
    href: 'mailto:dan@danielsilbaugh.com',
    icon: (
      <svg {...s} aria-hidden="true">
        <path d="M2 5.5A1.5 1.5 0 013.5 4h17A1.5 1.5 0 0122 5.5v13a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 18.5v-13zm2.2.5l7.8 5.9L19.8 6H4.2zM20 7.7l-7.4 5.6a1 1 0 01-1.2 0L4 7.7V18h16V7.7z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/daniel-silbaugh/',
    external: true,
    icon: (
      <svg {...s} aria-hidden="true">
        <path d="M4.98 3.5a2.5 2.5 0 11-.02 5 2.5 2.5 0 01.02-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C21.6 8.75 22 11.1 22 14.2V21h-4v-6c0-1.55-.03-3.55-2.2-3.55-2.2 0-2.53 1.7-2.53 3.44V21h-4V9z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/daniel-isaac-silbaugh',
    external: true,
    icon: (
      <svg {...s} aria-hidden="true">
        <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .26.18.58.69.48A10 10 0 0012 2z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/danielslbgh',
    external: true,
    icon: (
      <svg {...s} aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@DanielSilbaugh',
    external: true,
    icon: (
      <svg {...s} aria-hidden="true">
        <path d="M23.5 6.9a3 3 0 00-2.12-2.12C19.5 4.27 12 4.27 12 4.27s-7.5 0-9.38.51A3 3 0 00.5 6.9C0 8.78 0 12 0 12s0 3.22.5 5.1a3 3 0 002.12 2.12c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3 3 0 002.12-2.12C24 15.22 24 12 24 12s0-3.22-.5-5.1zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    ),
  },
];

export default function Socials() {
  return (
    <nav className="socials" aria-label="Elsewhere">
      {SOCIALS.map(link => (
        <a
          key={link.label}
          href={link.href}
          className="social-link"
          {...(link.external
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}
        >
          {link.icon}
          <span>{link.label}</span>
        </a>
      ))}
    </nav>
  );
}
