<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Content pipeline

The site renders only what exists as `content/<slug>.json` AND is listed in `content/manifest.json` with `published: true`. Manifest order within a type is the curated display order (undated groups keep it; fully-dated groups like the work diary sort newest-first). See `lib/content.ts`.

- Essays are authored as Markdown in `C:/Users/joech/projects/essays/` and are NOT picked up automatically. `scripts/import-essays.js` converts them, but it is a one-off: its tagline map only covers a few slugs, so a wholesale rerun will blank curated taglines that exist only in the content JSONs (e.g. car-people, class-fears). Prefer a surgical add: write `content/<slug>.json` by hand (copy an existing essay JSON for the shape — title, date, tagline, sections[{heading, body, tools}], tags) and insert a manifest entry.
- `## Headings` in an essay can become separate sections with their own `heading` (see dans-wager.json's addendum).
- The tagline is the homepage blurb (`getBlurb()` truncates at 140 chars). Write one when adding content.

# Folder-naming trap

`C:/Users/joech/projects/personal-site-content/` is NOT this site's content. It holds archived chat-analysis JSON exports. This site's content lives only in `personal-site/content/`.
