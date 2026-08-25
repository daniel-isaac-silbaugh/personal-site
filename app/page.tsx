import { getGroupedByType, getBlurb } from '../lib/content';
import ThemeToggle from './ThemeToggle';
import Subscribe from './Subscribe';

export default function Home() {
  const groups = getGroupedByType();

  return (
    <main className="site-shell">
      <header className="site-header">
        <h1 className="site-title">
          <a href="/">Daniel Isaac Silbaugh</a>
        </h1>
        <nav className="site-nav">
          <a href="mailto:dan@danielsilbaugh.com">Email</a>
          <a href="https://www.linkedin.com/in/daniel-silbaugh/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <ThemeToggle />
        </nav>
      </header>

      <section className="bio">
        <p>
          Can Dan the delivery driver become Dan the successful businessman?
        </p>
         <p>
          Follow my work diary to find out! I'm keeping detailed records of my journey to become an entrepreneur. Follow as I put myself out there, make mistakes, and figure out how to succeed. You can preview the first 10 entries down below. Sign up for a weekly update, with achievements, lessons learned, work summaries and detailed daily logs.
        </p>
      </section>

      <Subscribe />

      <section className="bio">
        <p>
          So far I have created{' '}
          <a href="https://bookmodernizer.com">The Book Modernizer</a>, a
          project that produces modern-language editions of classic literature
          and related reading tools.
        </p>
        <p>
          This site collects my projects, notes, experiments, fiction
          writing, musings, and other public work. You can email me at <a href="mailto:dan@danielsilbaugh.com">dan@danielsilbaugh.com.</a> Thanks for stopping by.

        </p>

      </section>

      {groups.map(({ type, label, items }) => (
        <Section key={type} title={label}>
          {items.map(item => (
            <li key={item.slug}>
              <a href={`/projects/${item.slug}`}>{item.title}</a>
              {getBlurb(item) && <span> — {getBlurb(item)}</span>}
            </li>
          ))}
        </Section>
      ))}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="content-section">
      <h2 className="section-title">{title}</h2>
      <ul className="link-list">{children}</ul>
    </section>
  );
}
