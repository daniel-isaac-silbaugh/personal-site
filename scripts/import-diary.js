#!/usr/bin/env node
/**
 * import-diary.js
 *
 * Reusable importer: converts work-diary Markdown entries into site content
 * JSON and registers them in content/manifest.json.
 *
 *   - Filenames must be YYYY-MM-DD.md in the work_diary folder.
 *   - Each `## Heading` becomes its own section; prose is preserved verbatim.
 *   - Title is the long-form date. Tagline comes from TAGLINES below, or is
 *     derived from the section headings if absent.
 *   - Existing entries are NEVER overwritten by default. Published diary JSON
 *     often carries hand edits (pricing, supplier names and other details get
 *     scrubbed before going public) and the Markdown source is not the source
 *     of truth once an entry is live. Pass --force to overwrite anyway.
 *
 * Run:  node scripts/import-diary.js              # import new entries only
 *       node scripts/import-diary.js 2026-08-04   # import specific date(s)
 *       node scripts/import-diary.js --force      # re-import, discarding edits
 */

const fs   = require('fs');
const path = require('path');

const contentDir   = path.join(__dirname, '..', 'content');
const manifestPath = path.join(contentDir, 'manifest.json');
const diaryDir     = 'C:/Users/joech/projects/work_diary';

// Optional hand-written taglines, keyed by date. Anything not listed here gets
// a tagline derived from its section headings.
const TAGLINES = {
  '2026-08-01': 'Building in public: founding-post results, a pivot to paid ads for Dum Phones, offer math, and a rebuilt job search.',
  '2026-08-02': 'An import pipeline for essays, four essays published, and the work diary itself goes public.',
  '2026-08-04': 'A lost event, the gating problem with a structural fix, and publishing the screenplay analyzer to GitHub without the copyrighted corpus.',
};

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const paras = t => t.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

const longDate = iso => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

const argv   = process.argv.slice(2);
const force  = argv.includes('--force');
const wanted = argv.filter(a => !a.startsWith('--'));
const files = fs.readdirSync(diaryDir)
  .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
  .filter(f => wanted.length === 0 || wanted.includes(f.replace('.md', '')))
  .sort();

if (!files.length) {
  console.error('No matching diary files found.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
const imported = [];

for (const file of files) {
  const iso = file.replace('.md', '');
  const outPath = path.join(contentDir, `work-diary-${iso}.json`);

  if (fs.existsSync(outPath) && !force) {
    console.log(`  keep ${iso} — already imported (hand edits preserved; --force to overwrite)`);
    continue;
  }

  const raw = fs.readFileSync(path.join(diaryDir, file), 'utf-8');

  // Split on `## ` headings. Block 0 is the date line / preamble.
  const blocks = raw.split(/^##\s+/m);
  const sections = blocks.slice(1).map(b => {
    const nl = b.indexOf('\n');
    const heading = b.slice(0, nl).trim();
    const body = paras(b.slice(nl)).join('\n\n');
    return { heading, body, tools: [] };
  });

  if (!sections.length) {
    console.warn(`  skip ${file} — no '## ' sections found`);
    continue;
  }

  const tagline = TAGLINES[iso]
    || sections.slice(0, 3).map(s => s.heading).join(' · ');

  const obj = {
    title: longDate(iso),
    date: iso,
    tagline,
    sections,
    tags: ['work-diary', 'building-in-public'],
  };

  const slug = `work-diary-${iso}`;
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(obj, null, 2));

  const entry = { slug, file: `${slug}.json`, type: 'work-diary', published: true };
  const existing = manifest.findIndex(e => e.slug === slug);
  if (existing >= 0) manifest[existing] = entry;
  else manifest.push(entry);

  imported.push(slug);
  console.log(`diary → ${slug}.json   (${sections.length} sections)`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nmanifest updated (${manifest.length} entries)`);
console.log('imported:', imported.join(', '));
