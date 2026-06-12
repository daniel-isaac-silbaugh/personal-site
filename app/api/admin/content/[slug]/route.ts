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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { slug } = await params;
  const manifest = getManifest();
  const entry = manifest.find((e: any) => e.slug === slug);
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const content = JSON.parse(
    fs.readFileSync(path.join(contentDir, entry.file), 'utf-8')
  );
  return NextResponse.json({ ...entry, ...content });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { slug } = await params;
  const manifest = getManifest();
  const idx = manifest.findIndex((e: any) => e.slug === slug);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { type, published, ...contentFields } = body;

  // Update manifest entry
  manifest[idx] = {
    ...manifest[idx],
    ...(type !== undefined && { type }),
    ...(published !== undefined && { published }),
  };
  saveManifest(manifest);

  // Update content file
  const filePath = path.join(contentDir, manifest[idx].file);
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  fs.writeFileSync(filePath, JSON.stringify({ ...existing, ...contentFields }, null, 2));

  return NextResponse.json({ success: true });
}
