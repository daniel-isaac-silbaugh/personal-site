import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

function getManifest() {
  return JSON.parse(fs.readFileSync(path.join(contentDir, 'manifest.json'), 'utf-8'));
}

function saveManifest(manifest: any[]) {
  fs.writeFileSync(
    path.join(contentDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
}

function deduplicateEntities(entities: { name: string; note: string }[]) {
  const seen = new Set<string>();
  return entities.filter(e => {
    if (seen.has(e.name)) return false;
    seen.add(e.name);
    return true;
  });
}

function toDateMs(dateStr?: string) {
  if (!dateStr) return 0;
  return new Date(dateStr).getTime();
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { slugs } = await req.json();
  if (!slugs || slugs.length < 2) {
    return NextResponse.json({ error: 'Need at least 2 slugs to merge' }, { status: 400 });
  }

  const manifest = getManifest();

  // Load all items
  const items = slugs.map((slug: string) => {
    const entry = manifest.find((e: any) => e.slug === slug);
    if (!entry) throw new Error(`Slug not found: ${slug}`);
    const content = JSON.parse(
      fs.readFileSync(path.join(contentDir, entry.file), 'utf-8')
    );
    return { ...entry, ...content };
  });

  // Sort by date ascending — earliest first
  const sorted = [...items].sort(
    (a, b) => toDateMs(a.date) - toDateMs(b.date)
  );

  const SEP = '\n---\n';

  // Concatenate text fields in chronological order
  const objective = sorted.map((i: any) => i.objective).filter(Boolean).join(SEP) || undefined;
  const summary   = sorted.map((i: any) => i.summary).filter(Boolean).join(SEP) || undefined;
  const tagline   = sorted.map((i: any) => i.tagline).filter(Boolean).join(SEP) || undefined;

  // Merge sections in chronological order
  const sections = sorted.flatMap((i: any) => i.sections ?? []);

  // Deduplicate array fields
  const tags                = [...new Set<string>(sorted.flatMap((i: any) => i.tags ?? []))];
  const skills_demonstrated = [...new Set<string>(sorted.flatMap((i: any) => i.skills_demonstrated ?? []))];
  const entities            = deduplicateEntities(sorted.flatMap((i: any) => i.entities ?? []));
  const actions             = [...new Set<string>(sorted.flatMap((i: any) => [
    ...(i.actions ?? []),
    ...(i.work_completed ?? []),
  ]))];

  const merged = {
    title:  sorted[0].title,
    date:   sorted.find((i: any) => i.date)?.date,
    ...(tagline   && { tagline }),
    ...(objective && { objective }),
    ...(summary   && { summary }),
    ...(sections.length  > 0 && { sections }),
    ...(tags.length      > 0 && { tags }),
    ...(skills_demonstrated.length > 0 && { skills_demonstrated }),
    ...(entities.length  > 0 && { entities }),
    ...(actions.length   > 0 && { actions }),
  };

  // Write merged content file
  const newSlug = `merged-${Date.now()}`;
  const newFile = `${newSlug}.json`;
  fs.writeFileSync(path.join(contentDir, newFile), JSON.stringify(merged, null, 2));

  // Update manifest: mark sources unpublished, add new entry as draft
  const updatedManifest = manifest.map((e: any) =>
    slugs.includes(e.slug) ? { ...e, published: false } : e
  );
  updatedManifest.push({
    slug:      newSlug,
    file:      newFile,
    type:      sorted[0].type ?? 'project',
    published: false,
  });
  saveManifest(updatedManifest);

  return NextResponse.json({ slug: newSlug });
}
