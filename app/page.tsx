import { getGroupedByType, getBlurb } from '../lib/content';
import ThemeToggle from './ThemeToggle';

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
          <a href="https://substack.com/@danielsilbaugh" target="_blank" rel="noopener noreferrer">Substack</a>
          <a href="https://twitter.com/danielsilbaugh" target="_blank" rel="noopener noreferrer">Twitter</a>
          <ThemeToggle />
        </nav>
      </header>

      <section className="bio">
        <p>
          Dan Silbaugh does manual labor, defaults to systems-level thinking, always has a few entrepreneurial projects going and writes science fiction. He has strong feelings about built environments. He is always going down Wikipedia rabbit holes. Someday, he'd like to live in Hawaii. Much like a Vulcan, he thinks the only rational, logical way to live one's life is to try your best to be a good person. Typically, you'll find him dressed in black.
        </p>
        <p>
          He is the creator of{' '}
          <a href="https://bookmodernizer.com">The Book Modernizer</a>, a
          project that produces modern-language editions of classic literature
          and related reading tools.
        </p>
        <p>
          This site collects his projects, notes, experiments, fiction
          writing, musings, and other public work.
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
