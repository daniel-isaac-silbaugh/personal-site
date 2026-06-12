import { getAllPublished, getBySlug } from '../../../lib/content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getAllPublished().map(item => ({ slug: item.slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getBySlug(slug);
  if (!item) notFound();

  return (
    <main>
      <nav className="back-nav">
        <a href="/">← Daniel Silbaugh</a>
      </nav>

      <article className="project-page">
        <header className="project-header">
          <h1>{item.title}</h1>
          {item.date && (
            <p className="project-date">
              {new Date(item.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </p>
          )}
          {item.tagline && (
            <p className="project-tagline">{item.tagline}</p>
          )}
          {item.external_url && (
            <a
              href={item.external_url}
              className="project-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit {new URL(item.external_url).hostname} →
            </a>
          )}
        </header>

        {item.objective && (
          <section className="project-section">
            <h2>Objective</h2>
            <p>{item.objective}</p>
          </section>
        )}

        {item.sections?.map(section => (
          <section key={section.heading} className="project-section">
            <h2>{section.heading}</h2>
            {section.body.split(/\n+/).filter(p => p.trim()).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            {section.tools && section.tools.length > 0 && (
              <div className="tag-list section-tools">
                {section.tools.map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            )}
          </section>
        ))}

        {item.entities && item.entities.length > 0 && (
          <section className="project-section">
            <h2>Topics covered</h2>
            <ul className="entity-list">
              {item.entities.map(e => (
                <li key={e.name}>
                  <strong>{e.name}</strong> — {e.note}
                </li>
              ))}
            </ul>
          </section>
        )}

        {item.skills_demonstrated && item.skills_demonstrated.length > 0 && (
          <section className="project-section">
            <h2>Skills</h2>
            <div className="tag-list">
              {item.skills_demonstrated.map(s => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
          </section>
        )}

        {item.status && (
          <section className="project-section">
            <h2>Status</h2>
            <p>{item.status}</p>
          </section>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="tag-list">
            {item.tags.map(t => (
              <span key={t} className="tag">#{t}</span>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
