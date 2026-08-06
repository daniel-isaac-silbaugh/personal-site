#!/usr/bin/env node
/**
 * import-content.js
 *
 * Imports essay markdown (projects/essays) and work-diary markdown
 * (projects/work_diary) into site content JSON. Idempotent: SKIPS any file
 * whose target JSON already exists, so hand-edited/scrubbed entries (e.g. the
 * 8/1 diary) are never clobbered.
 *
 * Essays  : `# Title` → title, rest → single section.
 * Diary   : `## Heading` → sections; timestamped entries with no `##` become
 *           one section. Every non-blank source line becomes its own paragraph
 *           (handles prose, bullets, and time labels); inline **bold** / `code`
 *           markers are stripped.
 *
 * Run: node scripts/import-content.js
 */

const fs   = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const essaysDir  = 'C:/Users/joech/projects/essays';
const diaryDir   = 'C:/Users/joech/projects/work_diary';

const MONTHS = ['January','February','March','April','May','June','July',
                'August','September','October','November','December'];

const slugify = s => s.toLowerCase().replace(/\.md$/, '')
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

const inlineClean = l => l
  .replace(/\*\*(.+?)\*\*/g, '$1').replace(/__(.+?)__/g, '$1')
  .replace(/`([^`]+)`/g, '$1');

// Essays: split on blank lines, collapse wrapping within a paragraph.
const essayParas = t => t.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n');
// Diary: every non-blank line is its own paragraph.
const lineJoin = t => t.split('\n').map(l => inlineClean(l.replace(/\s+/g, ' ').trim())).filter(Boolean).join('\n\n');

const ESSAY_TAGLINES = {
  'car-people': 'On dehumanization as a dial we turn all day — the car-person, the uniform-person, the screen-name — and how a book turns it the other way.',
  'class-fears': 'Reading our collective fantasies — Player Piano, Brave New World, Wall-E, Dune — for clues about where technology and class are heading.',
};
const DIARY_TAGLINES = {
  'work-diary-2026-07-27': 'Built a master to-do list across every project, cut the first two weeks down to size, and corrected the record on what Dum Phones actually is.',
  'work-diary-2026-07-29': 'Wired the small-business research project into the plan, drafted the Dum Phones pitch and founding post, and standardized the 78-book Book Modernizer corpus.',
  'work-diary-2026-07-30': 'Researching one-person AI-leveraged businesses, posting the founding phone photo despite the nerves, and a long push on the Book Modernizer cover pipeline.',
  'work-diary-2026-08-02': 'Built the essay import pipeline, published four essays and the first work-diary entry, then spent the day with my girlfriend.',
  'work-diary-2026-08-04': 'An AI House event fell through, so I fixed the structural problem — ungated venues — and published the screenplay analyzer to GitHub after a copyright cleanup.',
  'work-diary-2026-08-05': 'Where online communities actually help, ranking my contact methods around arriving with a role or an artifact, and fixing a promise the landing page got wrong.',
  'work-diary-2026-08-06': 'Sorted out where the domain really lives, chose a clean transfer path, picked a form service, and built the one-file landing page.',
};

const created = [], skipped = [];

// ── Essays ──
for (const f of fs.readdirSync(essaysDir).filter(f => f.endsWith('.md'))) {
  const slug = slugify(f);
  const out = path.join(contentDir, `${slug}.json`);
  if (fs.existsSync(out)) { skipped.push(slug); continue; }
  const raw = fs.readFileSync(path.join(essaysDir, f), 'utf-8');
  const titleLine = raw.split('\n').find(l => l.startsWith('# '));
  const title = titleLine.replace(/^#\s*/, '').trim();
  const body = essayParas(raw.slice(raw.indexOf(titleLine) + titleLine.length));
  const obj = { title, date: null, tagline: ESSAY_TAGLINES[slug] || '',
                sections: [{ heading: '', body, tools: [] }], tags: ['essay'] };
  fs.writeFileSync(out, JSON.stringify(obj, null, 2));
  created.push(`essay  ${slug}`);
}

// ── Work diary ──
for (const f of fs.readdirSync(diaryDir).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))) {
  const date = f.replace(/\.md$/, '');
  const slug = `work-diary-${date}`;
  const out = path.join(contentDir, `${slug}.json`);
  if (fs.existsSync(out)) { skipped.push(slug); continue; }
  const [y, m, d] = date.split('-').map(Number);
  const title = `${MONTHS[m - 1]} ${d}, ${y}`;
  let raw = fs.readFileSync(path.join(diaryDir, f), 'utf-8').replace(/^.*\n/, ''); // drop title line
  const parts = raw.split(/^##\s+/m);
  let sections;
  if (parts.length > 1) {
    sections = parts.slice(1).map(b => {
      const nl = b.indexOf('\n');
      return { heading: inlineClean(b.slice(0, nl).trim()), body: lineJoin(b.slice(nl)), tools: [] };
    });
  } else {
    sections = [{ heading: '', body: lineJoin(raw), tools: [] }];
  }
  const obj = { title, date, tagline: DIARY_TAGLINES[slug] || '', sections,
                tags: ['work-diary', 'building-in-public'] };
  fs.writeFileSync(out, JSON.stringify(obj, null, 2));
  created.push(`diary  ${slug}  (${sections.length} section${sections.length > 1 ? 's' : ''})`);
}

console.log('CREATED:');
created.forEach(c => console.log('  ' + c));
console.log('\nSKIPPED (already exist): ' + skipped.join(', '));
