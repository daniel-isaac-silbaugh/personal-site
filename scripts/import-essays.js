#!/usr/bin/env node
/**
 * import-essays.js
 *
 * One-off importer: converts Dan's essay Markdown files and the 8/1 work-diary
 * entry into site content JSON, preserving the prose verbatim.
 *   - Essays: `# Title` line becomes the title, the rest is one section body.
 *   - Diary:  each `## Heading` becomes its own section.
 *
 * Run: node scripts/import-essays.js
 */

const fs   = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const essaysDir  = 'C:/Users/joech/projects/essays';
const diaryFile  = 'C:/Users/joech/projects/work_diary/2026-08-01.md';

const slugify = s => s.toLowerCase().replace(/\.md$/, '')
  .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

// Split a markdown blob into paragraphs, rejoined with blank lines.
const paras = t => t.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

// ── Essays ────────────────────────────────────────────────────────────────────
const ESSAY_TAGLINES = {
  'goskomtsen-and-star-trek-communes': 'What if the computer the 1960s communes needed had arrived on time? A counterfactual running from Soviet central planning to the hippie farmhouse.',
  'a-chess-board-of-feedback-loops': 'On why knowledge work turned out to be real work after all — and what happens as AI absorbs the office\u2019s endless loops of documents and decisions.',
  'the-going-rate': 'Prices aren\u2019t set by the market so much as by talk — the phone calls, forum threads, and hushed confessions behind every going rate.',
  'we-already-know': 'If AI makes goods nearly free, what will life mean? We already know — a few people have lived in post-scarcity for centuries: the upper classes.',
};

const files = fs.readdirSync(essaysDir).filter(f => f.endsWith('.md'));
const essaySlugs = [];
for (const f of files) {
  const raw = fs.readFileSync(path.join(essaysDir, f), 'utf-8');
  const lines = raw.split('\n');
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine.replace(/^#\s*/, '').trim();
  const bodyRaw = raw.slice(raw.indexOf(titleLine) + titleLine.length);
  const body = paras(bodyRaw).join('\n\n');
  const slug = slugify(f);
  const obj = {
    title,
    date: null,
    tagline: ESSAY_TAGLINES[slug] || '',
    sections: [{ heading: '', body, tools: [] }],
    tags: ['essay'],
  };
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(obj, null, 2));
  essaySlugs.push(slug);
  console.log(`essay  → ${slug}.json   (${paras(bodyRaw).length} paragraphs)`);
}

// ── Work diary (8/1) ──────────────────────────────────────────────────────────
const draw = fs.readFileSync(diaryFile, 'utf-8');
const blocks = draw.split(/^##\s+/m);          // [preamble, "Heading\n\nbody", ...]
const sections = blocks.slice(1).map(b => {
  const nl = b.indexOf('\n');
  const heading = b.slice(0, nl).trim();
  const body = paras(b.slice(nl)).join('\n\n');
  return { heading, body, tools: [] };
});
const diary = {
  title: 'August 1, 2026',
  date: '2026-08-01',
  tagline: 'Building in public: founding-post results, a pivot to paid ads for Dum Phones, offer math, and a rebuilt job search.',
  sections,
  tags: ['work-diary', 'building-in-public'],
};
const diarySlug = 'work-diary-2026-08-01';
fs.writeFileSync(path.join(contentDir, `${diarySlug}.json`), JSON.stringify(diary, null, 2));
console.log(`diary  → ${diarySlug}.json   (${sections.length} sections)`);

console.log('\nEssay slugs:', essaySlugs.join(', '));
console.log('Diary slug :', diarySlug);
