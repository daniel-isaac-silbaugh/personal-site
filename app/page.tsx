import { getGroupedByType, getBlurb, type ContentItem } from '../lib/content';
import ThemeToggle from './ThemeToggle';
import Subscribe from './Subscribe';
import Socials from './Socials';
import { Dim, Bubble, TitleBlock } from './Drafting';
import type { CSSProperties } from 'react';

// CAD layer colours. Drawing sets really do assign a colour per layer, so
// this is the honest way to keep a palette in a restrained drawing.
const LAYERS = ['--l-cyan', '--l-red', '--l-green', '--l-magenta', '--l-blue'];

function layerStyle(i: number): CSSProperties {
  return { ['--layer' as string]: `var(${LAYERS[i % LAYERS.length]})` };
}

/** Sheet numbers run A-01, A-02, ... in manifest order. */
function sheetNo(i: number): string {
  return `A-${String(i + 1).padStart(2, '0')}`;
}

export default function Home() {
  const groups = getGroupedByType();
  const total = String(groups.length).padStart(2, '0');

  // One continuous item number across every section, like a drawing index.
  let counter = 0;

  return (
    <main className="home sheet">
      <div className="sheet-inner">
        <div className="topbar">
          <span className="topbar-ref">SILBAUGH &middot; PERSONAL WORKS</span>
          <ThemeToggle />
        </div>

        <div className="home-grid">
          {/* A drawing set opens with its sheet index; so does this. */}
          <aside className="rail">
            <div className="sheetindex">
              <p className="annot-head">Sheet Index</p>
              <ul>
                {groups.map(({ type, label, items }, i) => (
                  <li key={type} style={layerStyle(i)}>
                    <a className="si-row" href={`#${type}`}>
                      <span className="si-no">{sheetNo(i)}</span>
                      <span className="si-dot" />
                      <span className="si-name">{label}</span>
                      <span className="si-leader" />
                      <span className="si-count">
                        {String(items.length).padStart(2, '0')}
                      </span>
                    </a>
                    {type === 'project' && (
                      <ul className="si-sub">
                        {items.map(item => (
                          <li key={item.slug}>
                            <a href={`/projects/${item.slug}`}>{item.title}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <Subscribe />
          </aside>

          <div className="content">
            <header className="hero">
              <Dim label="SUBJECT" className="dim-top" />

              <h1 className="hero-name">Daniel Isaac Silbaugh</h1>
              <p className="hero-callout">
                <span className="leader" aria-hidden="true" />
                Seattle &middot; builds things &middot; writes things
              </p>

              <p className="hero-lede">
                I do manual labor, default to systems-level thinking, always
                have a few entrepreneurial projects going, and write science
                fiction. I am passionately disappointed in modern built
                environments. Much like a Vulcan, I think the only rational,
                logical way to live one&rsquo;s life is to try your best to be
                a good person. As a curious generalist, I&rsquo;m always going
                down Wikipedia rabbit holes. I enjoy vacationing in Hawaii,
                t&ecirc;te-&agrave;-t&ecirc;tes, literary realism, and reality
                baking competitions.
              </p>

              <p className="hero-sub">
                <span className="note-flag">NOTE 1</span> I build things that
                take dense or messy input and give back something clearer. The
                largest of them is{' '}
                <a href="https://bookmodernizer.com" target="_blank" rel="noopener noreferrer">
                  The Book Modernizer
                </a>
                . Write to me at{' '}
                <a href="mailto:dan@danielsilbaugh.com">dan@danielsilbaugh.com</a>.
              </p>

              <Socials />
            </header>

            <div className="index">
              {groups.map(({ type, label, items }, i) => (
                <section
                  key={type}
                  id={type}
                  className="index-group"
                  style={layerStyle(i)}
                >
                  <h2 className="index-label">
                    <span className="il-sheet">{sheetNo(i)}</span>
                    <span className="il-name">{label}</span>
                    <span className="il-rule" aria-hidden="true" />
                    <span className="il-meta">
                      {String(items.length).padStart(2, '0')} ITEMS
                    </span>
                  </h2>
                  <ul className="index-list">
                    {items.map(item => {
                      counter += 1;
                      return (
                        <Entry
                          key={item.slug}
                          item={item}
                          n={counter}
                          sheet={sheetNo(i)}
                        />
                      );
                    })}
                  </ul>
                </section>
              ))}

              <TitleBlock
                sheet="A-01"
                title="Index of Work"
                date={new Date().toISOString().slice(0, 10)}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Entry({
  item,
  n,
  sheet,
}: {
  item: ContentItem;
  n: number;
  sheet: string;
}) {
  const blurb = getBlurb(item);
  return (
    <li className="entry">
      <a href={`/projects/${item.slug}`}>
        <Bubble n={n} sheet={sheet} />
        <span className="entry-body">
          <span className="entry-title">{item.title}</span>
          {blurb && <span className="entry-blurb">{blurb}</span>}
        </span>
        <span className="entry-meta">
          {item.date && <span className="entry-rev">REV {item.date}</span>}
        </span>
      </a>
    </li>
  );
}
