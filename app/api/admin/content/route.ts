import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

function getManifest() {
  return JSON.parse(fs.readFileSync(path.join(contentDir, 'manifest.json'), 'utf-8'));
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const manifest = getManifest();
  const items = manifest.map((entry: any) => {
    try {
      const content = JSON.parse(
        fs.readFileSync(path.join(contentDir, entry.file), 'utf-8')
      );
      return { ...entry, title: content.title || entry.slug, date: content.date };
    } catch {
      return { ...entry, title: entry.slug };
    }
  });

  return NextResponse.json(items);
}
