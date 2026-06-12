#!/usr/bin/env node

/**
 * sync-manifest.js
 *
 * Scans the content/ folder for JSON files not yet in manifest.json
 * and adds them as unpublished drafts with auto-generated slugs.
 *
 * Usage: node scripts/sync-manifest.js
 */

const fs   = require('fs');
const path = require('path');

const contentDir   = path.join(__dirname, '..', 'content');
const manifestPath = path.join(contentDir, 'manifest.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // strip special chars
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-')            // collapse multiple hyphens
    .slice(0, 80);                  // max length
}

function generateSlug(filename, existingSlugs) {
  // Try to derive a slug from the JSON title field first
  let base;
  try {
    const content = JSON.parse(fs.readFileSync(path.join(contentDir, filename), 'utf-8'));
    if (content.title) {
      // Prepend date if present, e.g. "2024-01-book-modernizer"
      const prefix = content.date ? content.date.slice(0, 10) + '-' : '';
      base = prefix + slugify(content.title);
    }
  } catch { /* fall through */ }

  // Fall back to slugifying the filename itself
  if (!base) {
    base = slugify(path.basename(filename, '.json'));
  }

  // Ensure uniqueness by appending a counter if needed
  let slug = base;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const knownFiles = new Set(manifest.map(e => e.file));
const knownSlugs = new Set(manifest.map(e => e.slug));

// Find all JSON files in content/ that aren't manifest.json itself
const allFiles = fs.readdirSync(contentDir).filter(
  f => f.endsWith('.json') && f !== 'manifest.json'
);

const newFiles = allFiles.filter(f => !knownFiles.has(f));

if (newFiles.length === 0) {
  console.log('✓ Manifest is already up to date — no new files found.');
  process.exit(0);
}

const newEntries = newFiles.map(file => {
  const slug = generateSlug(file, knownSlugs);
  knownSlugs.add(slug); // reserve it for uniqueness check on next iteration
  return { slug, file, type: 'project', published: false };
});

const updated = [...manifest, ...newEntries];
fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2));

console.log(`✓ Added ${newEntries.length} new file(s) to manifest.json:\n`);
newEntries.forEach(e => {
  console.log(`  ${e.slug}`);
  console.log(`    file: ${e.file}`);
  console.log('');
});
console.log('All entries start as published: false — review in /admin before going live.');
