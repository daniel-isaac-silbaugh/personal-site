import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content');

// Open-ended string so any type in manifest.json works automatically
export type ContentType = string;

export interface ManifestEntry {
  slug: string;
  file: string;
  type: ContentType;
  published: boolean;
}

export interface Section {
  heading: string;
  body: string;       // single paragraph, or multiple separated by \n\n
  tools?: string[];   // optional per-section tech pills
}

export interface Entity {
  name: string;
  note: string;
}

export interface ContentItem extends ManifestEntry {
  title: string;
  date?: string;
  tagline?: string;
  external_url?: string;
  objective?: string;
  summary?: string;
  sections?: Section[];
  status?: string;
  tags?: string[];
  skills_demonstrated?: string[];
  entities?: Entity[];
  actions?: string[];        // preferred field name going forward
  work_completed?: string[]; // legacy alias — handled in getActions()
}

export function getManifest(): ManifestEntry[] {
  const raw = fs.readFileSync(path.join(contentDir, 'manifest.json'), 'utf-8');
  return JSON.parse(raw);
}

function getContentFile(file: string): Record<string, unknown> {
  const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  return JSON.parse(raw);
}

export function getAllPublished(): ContentItem[] {
  return getManifest()
    .filter(e => e.published)
    .map(e => ({ ...e, ...getContentFile(e.file) } as ContentItem));
}

export function getByType(type: ContentType): ContentItem[] {
  return getAllPublished().filter(e => e.type === type);
}

/**
 * Returns all published items grouped by type, in a stable display order.
 * Known types appear first in the preferred order; any new types are
 * appended alphabetically after them.
 */
const TYPE_ORDER = ['project', 'writing', 'fiction', 'essay', 'note'];

/** Explicit labels for known types; fallback capitalises and adds 's'. */
const TYPE_LABELS: Record<string, string> = {
  project:     'Projects',
  writing:     'Writing',
  fiction:     'Fiction',
  essay:       'Essays',
  note:        'Notes',
  brainstorm:  'Brainstorms',
};

function toLabel(type: string): string {
  if (TYPE_LABELS[type]) return TYPE_LABELS[type];
  const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
  // Don't pluralize gerunds (e.g. brainstorming) or words already ending in 's'
  if (type.endsWith('ing') || type.endsWith('s')) return capitalized;
  return capitalized + 's';
}

export function getGroupedByType(): { type: string; label: string; items: ContentItem[] }[] {
  const all = getAllPublished();
  const map = new Map<string, ContentItem[]>();

  for (const item of all) {
    if (!map.has(item.type)) map.set(item.type, []);
    map.get(item.type)!.push(item);
  }

  const knownTypes = TYPE_ORDER.filter(t => map.has(t));
  const unknownTypes = [...map.keys()]
    .filter(t => !TYPE_ORDER.includes(t))
    .sort();

  return [...knownTypes, ...unknownTypes].map(type => ({
    type,
    label: toLabel(type),
    items: map.get(type)!,
  }));
}

export function getBySlug(slug: string): ContentItem | null {
  const entry = getManifest().find(e => e.slug === slug);
  if (!entry) return null;
  return { ...entry, ...getContentFile(entry.file) } as ContentItem;
}

/** Homepage blurb — objective field, falling back to tagline or summary. */
export function getBlurb(item: ContentItem): string {
  const text = item.tagline || item.objective || item.summary || '';
  return text.length > 140 ? text.slice(0, 137).trimEnd() + '…' : text;
}

/** Returns the actions list, handling both field name variants. */
export function getActions(item: ContentItem): string[] {
  return item.actions ?? item.work_completed ?? [];
}
