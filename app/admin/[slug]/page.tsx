'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Section { heading: string; body: string; tools?: string; }
interface Entity  { name: string; note: string; }

interface FormData {
  title: string;
  date: string;
  type: string;
  published: boolean;
  tagline: string;
  objective: string;
  summary: string;
  status: string;
  external_url: string;
  tags: string;
  skills_demonstrated: string;
  sections: Section[];
  entities: Entity[];
  actions: string;
}

const EMPTY: FormData = {
  title: '', date: '', type: 'project', published: false,
  tagline: '', objective: '', summary: '', status: '', external_url: '',
  tags: '', skills_demonstrated: '', sections: [], entities: [], actions: '',
};

export default function EditPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/content/${slug}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          title:               data.title         ?? '',
          date:                data.date          ?? '',
          type:                data.type          ?? 'project',
          published:           data.published     ?? false,
          tagline:             data.tagline       ?? '',
          objective:           data.objective     ?? '',
          summary:             data.summary       ?? '',
          status:              data.status        ?? '',
          external_url:        data.external_url  ?? '',
          tags:                (data.tags               ?? []).join(', '),
          skills_demonstrated: (data.skills_demonstrated ?? []).join(', '),
          actions:             (data.actions ?? data.work_completed ?? []).join(', '),
          sections:            (data.sections ?? []).map((s: any) => ({
            ...s,
            tools: (s.tools ?? []).join(', '),
          })),
          entities:            data.entities      ?? [],
        });
      });
  }, [slug]);

  const set = (field: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateSection = (i: number, field: keyof Section, value: string) => {
    const next = form.sections.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s
    );
    set('sections', next);
  };

  const addSection    = () => set('sections', [...form.sections, { heading: '', body: '' }]);
  const removeSection = (i: number) => set('sections', form.sections.filter((_, idx) => idx !== i));

  const updateEntity = (i: number, field: keyof Entity, value: string) => {
    const next = form.entities.map((e, idx) =>
      idx === i ? { ...e, [field]: value } : e
    );
    set('entities', next);
  };

  const addEntity    = () => set('entities', [...form.entities, { name: '', note: '' }]);
  const removeEntity = (i: number) => set('entities', form.entities.filter((_, idx) => idx !== i));

  const splitCSV = (s: string) =>
    s.split(',').map(t => t.trim()).filter(Boolean);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/admin/content/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:               form.title,
        date:                form.date,
        type:                form.type,
        published:           form.published,
        tagline:             form.tagline,
        objective:           form.objective,
        summary:             form.summary,
        status:              form.status,
        external_url:        form.external_url,
        tags:                splitCSV(form.tags),
        skills_demonstrated: splitCSV(form.skills_demonstrated),
        actions:             splitCSV(form.actions),
        sections:            form.sections.map(s => ({
              ...s,
              tools: s.tools ? s.tools.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
            })),
        entities:            form.entities,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field  = (label: string, key: keyof FormData, multiline = false) => (
    <div style={row}>
      <label style={lbl}>{label}</label>
      {multiline
        ? <textarea
            value={form[key] as string}
            onChange={e => set(key, e.target.value)}
            rows={5}
            style={{ ...input, resize: 'vertical' }}
          />
        : <input
            value={form[key] as string}
            onChange={e => set(key, e.target.value)}
            style={input}
          />
      }
    </div>
  );

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <a href="/admin" style={{ color: '#666', fontSize: 14 }}>← All content</a>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {saved && <span style={{ color: 'green', fontSize: 13 }}>Saved ✓</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '8px 20px', cursor: 'pointer', background: '#1a1918', color: '#fff', border: 'none', borderRadius: 4 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div style={{ background: '#f8f6f2', borderRadius: 8, padding: 20, marginBottom: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={row}>
            <label style={lbl}>Type</label>
            <input value={form.type} onChange={e => set('type', e.target.value)} style={input} />
          </div>
          <div style={row}>
            <label style={lbl}>Date</label>
            <input value={form.date} onChange={e => set('date', e.target.value)} placeholder="YYYY-MM-DD" style={input} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={form.published}
            onChange={e => set('published', e.target.checked)}
            id="published"
          />
          <label htmlFor="published" style={{ fontSize: 14, cursor: 'pointer' }}>
            Published (visible on site)
          </label>
        </div>
      </div>

      {/* Core fields */}
      {field('Title', 'title')}
      {field('Tagline', 'tagline')}
      {field('External URL', 'external_url')}
      {field('Objective', 'objective', true)}
      {field('Summary', 'summary', true)}
      {field('Status', 'status')}

      {/* Sections */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Sections</label>
          <button onClick={addSection} style={addBtn}>+ Add section</button>
        </div>
        {form.sections.map((s, i) => (
          <div key={i} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#999' }}>Section {i + 1}</span>
              <button onClick={() => removeSection(i)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 12 }}>Remove</button>
            </div>
            <input
              placeholder="Heading"
              value={s.heading}
              onChange={e => updateSection(i, 'heading', e.target.value)}
              style={{ ...input, marginBottom: 8 }}
            />
            <textarea
              placeholder="Body (separate paragraphs with a blank line)"
              value={s.body}
              onChange={e => updateSection(i, 'body', e.target.value)}
              rows={4}
              style={{ ...input, resize: 'vertical', marginBottom: 8 }}
            />
            <input
              placeholder="Tools (comma-separated, e.g. Python, ffmpeg, OpenAI API)"
              value={s.tools ?? ''}
              onChange={e => updateSection(i, 'tools', e.target.value)}
              style={input}
            />
          </div>
        ))}
      </div>

      {/* Tags & Skills */}
      {field('Tags (comma-separated)', 'tags')}
      {field('Skills (comma-separated)', 'skills_demonstrated')}
      {field('Actions (comma-separated)', 'actions')}

      {/* Entities */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <label style={{ fontWeight: 600, fontSize: 14 }}>Entities</label>
          <button onClick={addEntity} style={addBtn}>+ Add entity</button>
        </div>
        {form.entities.map((e, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Name"
              value={e.name}
              onChange={ev => updateEntity(i, 'name', ev.target.value)}
              style={input}
            />
            <input
              placeholder="Note"
              value={e.note}
              onChange={ev => updateEntity(i, 'note', ev.target.value)}
              style={input}
            />
            <button onClick={() => removeEntity(i)} style={{ background: 'none', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', color: '#c00', padding: '0 10px' }}>×</button>
          </div>
        ))}
      </div>

      {/* Bottom save */}
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        {saved && <span style={{ color: 'green', fontSize: 13, alignSelf: 'center' }}>Saved ✓</span>}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '10px 28px', cursor: 'pointer', background: '#1a1918', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

    </main>
  );
}

// Styles
const row: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 };
const lbl: React.CSSProperties = { fontWeight: 600, fontSize: 13, color: '#444' };
const input: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 14, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' };
const addBtn: React.CSSProperties = { background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '4px 12px', cursor: 'pointer', fontSize: 13 };
