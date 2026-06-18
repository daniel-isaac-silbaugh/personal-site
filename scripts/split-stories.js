#!/usr/bin/env node
/**
 * split-stories.js
 *
 * Splits a Google-Docs HTML export containing multiple stories into one
 * site-ready content JSON per story. All prose stays on disk — the only
 * thing printed is a title + paragraph-count summary.
 *
 * Story titles are <p class="c5"> paragraphs whose text is not "*".
 * A <p class="c5"> whose text is "*" is treated as an in-story scene break.
 *
 * Usage: node scripts/split-stories.js content/PlanetPaintingsAMAZON.html
 */

const fs   = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile || !fs.existsSync(inputFile)) {
  console.error('Usage: node scripts/split-stories.js <input.html>');
  process.exit(1);
}

const contentDir = path.join(__dirname, '..', 'content');
const raw = fs.readFileSync(inputFile, 'utf-8');

// ── Entity decoding ───────────────────────────────────────────────────────────
const NAMED = {
  '&nbsp;': ' ', '&ldquo;': '“', '&rdquo;': '”',
  '&lsquo;': '‘', '&rsquo;': '’', '&mdash;': '—',
  '&ndash;': '–', '&hellip;': '…', '&eacute;': 'é',
  '&egrave;': 'è', '&agrave;': 'à', '&ecirc;': 'ê',
  '&ocirc;': 'ô', '&uuml;': 'ü', '&ouml;': 'ö',
  '&auml;': 'ä', '&ccedil;': 'ç', '&quot;': '"',
};
function decodeEntities(s) {
  for (const [k, v] of Object.entries(NAMED)) s = s.split(k).join(v);
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
  s = s.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)));
  s = s.replace(/​/g, '');        // strip zero-width spaces
  s = s.split('&amp;').join('&');      // ampersand last
  return s;
}
function stripTags(s) { return s.replace(/<[^>]+>/g, ''); }
function clean(inner) {
  let t = decodeEntities(stripTags(inner));
  t = t.replace(/\s+/g, ' ').trim();   // collapse whitespace + drop indentation
  return t;
}
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

// ── Parse paragraphs ──────────────────────────────────────────────────────────
const paras = [];
const re = /<p\b([^>]*)>(.*?)<\/p>/gs;
let m;
while ((m = re.exec(raw)) !== null) {
  const isC5 = /class="[^"]*\bc5\b/.test(m[1]);
  paras.push({ isC5, text: clean(m[2]) });
}

// ── Assemble stories ──────────────────────────────────────────────────────────
const stories = [];
let cur = null;
const wordCount = t => t.split(/\s+/).filter(Boolean).length;
for (const p of paras) {
  if (p.isC5 && p.text === '*') {
    if (cur) cur.body.push('* * *');                 // scene break
  } else if (p.isC5 && p.text !== '' && wordCount(p.text) <= 8) {
    cur = { title: p.text, body: [] };               // short c5 = story title
    stories.push(cur);
  } else if (p.text) {
    if (cur) cur.body.push(p.text);                  // prose (incl. long c5 paragraphs)
  }
}

// ── Write JSON + summary ──────────────────────────────────────────────────────
console.log(`\nFound ${stories.length} stories:\n`);
const written = [];
for (const s of stories) {
  const slug = slugify(s.title);
  const obj = {
    title: s.title,
    date: null,
    tagline: '',
    summary: '',
    sections: [{ heading: '', body: s.body.join('\n\n'), tools: [] }],
    status: '',
    tags: ['fiction', 'science-fiction', 'short-story'],
  };
  const outPath = path.join(contentDir, `${slug}.json`);
  fs.writeFileSync(outPath, JSON.stringify(obj, null, 2));
  const words = s.body.join(' ').split(/\s+/).filter(Boolean).length;
  written.push({ slug, title: s.title });
  console.log(`  • ${s.title}`);
  console.log(`      slug: ${slug}.json | ${s.body.length} paragraphs | ~${words} words`);
  console.log(`      opens: ${s.body[0] ? s.body[0].slice(0, 70) : '(empty)'}…\n`);
}
console.log('Manifest slugs (in document order):');
console.log(written.map(w => w.slug).join(', '));
