#!/usr/bin/env node

/**
 * text-to-json.js
 *
 * Converts any text or HTML file into a site-ready content JSON file
 * using the OpenAI API to extract and structure the content.
 *
 * Usage:
 *   node scripts/text-to-json.js <input-file> [options]
 *
 * Options:
 *   --slug <slug>      URL slug for the entry (default: derived from filename)
 *   --type <type>      Content type: project, note, essay, writing (default: project)
 *   --publish          Add as published: true (default: false)
 *   --add-manifest     Add entry to manifest.json (default: true)
 *
 * Examples:
 *   node scripts/text-to-json.js ~/Downloads/my-project.html
 *   node scripts/text-to-json.js notes.txt --slug my-notes --type note
 *   node scripts/text-to-json.js project.html --slug cool-project --publish
 *
 * Requires: OPENAI_API_KEY environment variable
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────

const contentDir   = path.join(__dirname, '..', 'content');
const manifestPath = path.join(contentDir, 'manifest.json');
const OPENAI_KEY   = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.length === 0 || args[0].startsWith('--')) {
  console.error('Usage: node scripts/text-to-json.js <input-file> [--slug x] [--type x] [--publish] [--add-manifest]');
  process.exit(1);
}

const inputFile = args[0];
if (!fs.existsSync(inputFile)) {
  console.error(`Error: File not found: ${inputFile}`);
  process.exit(1);
}

function getFlag(name, defaultVal) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return defaultVal;
  return args[idx + 1] && !args[idx + 1].startsWith('--') ? args[idx + 1] : true;
}

const optSlug     = getFlag('slug', null);
const optType     = getFlag('type', 'project');
const optPublish  = args.includes('--publish');
const skipManifest = args.includes('--no-manifest');

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function callOpenAI(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a content structuring assistant. You convert raw text into structured JSON
for a personal portfolio website. Always respond with valid JSON only — no markdown, no code fences.
Never use straight double-quote characters inside JSON string values; use single quotes or curly quotes instead.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const req = https.request(
      {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            resolve(parsed.choices[0].message.content);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Schema prompt ─────────────────────────────────────────────────────────────

const SCHEMA_PROMPT = `
Analyze the following text and extract structured content for a personal portfolio website.

Return a JSON object with these fields:

{
  "title": "Project or entry title (string)",
  "date": "ISO date if found, e.g. 2025-08-19, otherwise null",
  "tagline": "One sentence — the clearest possible answer to what this is (string)",
  "objective": "One or two sentences on what the project/work was trying to accomplish (string)",
  "summary": "A condensed paragraph summarizing the overall work and outcome (string)",
  "sections": [
    {
      "heading": "Section heading (short, uppercase-style label)",
      "body": "Section body text. Use actual newline + blank line (\\n\\n) between paragraphs within a section.",
      "tools": ["tool1", "tool2"]  // array of specific tools, APIs, libraries, languages used in this section. Empty array if none.
    }
  ],
  "status": "One sentence on current status of the project (string or null)",
  "tags": ["tag1", "tag2"],  // short lowercase keywords
  "skills_demonstrated": ["skill1", "skill2"],  // skills shown in the work
  "entities": [
    { "name": "entity name", "note": "brief note about its role" }
  ],
  "actions": ["action1", "action2"]  // specific things that were done or built
}

Rules:
- sections should reflect the natural structure of the content
- tools arrays should contain only specific named tools/libraries/APIs/languages, not vague terms
- tags should be short, lowercase, hyphenated if multi-word
- Do NOT include source file paths, status fields from the original, or internal metadata
- Use single quotes or curly quotes for any quoted text inside string values — never straight double quotes
- If a field has no content, use null for strings or [] for arrays

Text to analyze:
`;

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nReading: ${inputFile}`);
  let raw = fs.readFileSync(inputFile, 'utf-8');

  // Strip HTML if needed
  const ext = path.extname(inputFile).toLowerCase();
  if (ext === '.html' || ext === '.htm' || raw.trimStart().startsWith('<')) {
    console.log('Detected HTML — stripping tags...');
    raw = stripHtml(raw);
  }

  // Truncate very long files to stay within context limits
  const maxChars = 24000;
  if (raw.length > maxChars) {
    console.log(`Text is long (${raw.length} chars) — truncating to ${maxChars}...`);
    raw = raw.slice(0, maxChars);
  }

  console.log('Sending to OpenAI...');
  const response = await callOpenAI(SCHEMA_PROMPT + raw);

  // Parse and validate
  let parsed;
  try {
    parsed = JSON.parse(response);
  } catch (e) {
    console.error('OpenAI returned invalid JSON:', e.message);
    console.error('Raw response:', response.slice(0, 500));
    process.exit(1);
  }

  // Determine slug and filename
  const slug     = optSlug || slugify(parsed.title || path.basename(inputFile, ext));
  const outFile  = `${slug}.json`;
  const outPath  = path.join(contentDir, outFile);

  // Check for conflicts
  if (fs.existsSync(outPath)) {
    console.warn(`Warning: ${outFile} already exists — overwriting.`);
  }

  // Write content file
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
  console.log(`\n✓ Written: content/${outFile}`);

  // Add to manifest
  if (!skipManifest) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const existing = manifest.find(e => e.slug === slug);

    if (existing) {
      console.log(`  Manifest: entry for "${slug}" already exists — not modified.`);
    } else {
      manifest.push({ slug, file: outFile, type: optType, published: optPublish });
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`  Manifest: added as type="${optType}", published=${optPublish}`);
    }
  }

  console.log(`\n  Slug:  ${slug}`);
  console.log(`  URL:   /projects/${slug}`);
  console.log(`  Admin: localhost:3000/admin/${slug}\n`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
