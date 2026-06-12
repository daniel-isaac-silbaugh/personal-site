'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Item {
  slug: string;
  title: string;
  type: string;
  date?: string;
  published: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [merging, setMerging] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(setItems);
  }, []);

  const toggle = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleMerge = async () => {
    setMerging(true);
    const res = await fetch('/api/admin/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs: [...selected] }),
    });
    const { slug } = await res.json();
    router.push(`/admin/${slug}`);
  };

  const togglePublished = async (item: Item) => {
    await fetch(`/api/admin/content/${item.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !item.published }),
    });
    setItems(prev =>
      prev.map(i => i.slug === item.slug ? { ...i, published: !i.published } : i)
    );
  };

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Content Admin</h1>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {selected.size >= 2 && (
            <button
              onClick={handleMerge}
              disabled={merging}
              style={{ padding: '8px 18px', cursor: 'pointer', background: '#1a1918', color: '#fff', border: 'none', borderRadius: 4 }}
            >
              {merging ? 'Merging…' : `Merge ${selected.size} selected`}
            </button>
          )}
          {selected.size > 0 && (
            <button
              onClick={() => setSelected(new Set())}
              style={{ padding: '8px 12px', cursor: 'pointer', background: 'none', border: '1px solid #ccc', borderRadius: 4 }}
            >
              Clear
            </button>
          )}
          <a href="/" style={{ color: '#666', fontSize: 14 }}>← Back to site</a>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left', color: '#666' }}>
            <th style={{ padding: '8px 12px', width: 32 }} />
            <th style={{ padding: '8px 12px' }}>Title</th>
            <th style={{ padding: '8px 12px' }}>Type</th>
            <th style={{ padding: '8px 12px' }}>Date</th>
            <th style={{ padding: '8px 12px' }}>Status</th>
            <th style={{ padding: '8px 12px' }} />
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.slug}
              style={{
                borderBottom: '1px solid #f0f0f0',
                background: selected.has(item.slug) ? '#f5f3ee' : 'transparent',
              }}
            >
              <td style={{ padding: '8px 12px' }}>
                <input
                  type="checkbox"
                  checked={selected.has(item.slug)}
                  onChange={() => toggle(item.slug)}
                />
              </td>
              <td style={{ padding: '8px 12px' }}>{item.title}</td>
              <td style={{ padding: '8px 12px', color: '#888' }}>{item.type}</td>
              <td style={{ padding: '8px 12px', color: '#888' }}>{item.date ?? '—'}</td>
              <td style={{ padding: '8px 12px' }}>
                <button
                  onClick={() => togglePublished(item)}
                  style={{
                    fontSize: 12,
                    padding: '2px 10px',
                    borderRadius: 12,
                    border: '1px solid',
                    cursor: 'pointer',
                    background: 'none',
                    color: item.published ? '#2a7a2a' : '#999',
                    borderColor: item.published ? '#2a7a2a' : '#ccc',
                  }}
                >
                  {item.published ? 'live' : 'draft'}
                </button>
              </td>
              <td style={{ padding: '8px 12px' }}>
                <a href={`/admin/${item.slug}`} style={{ color: '#1a1918', fontSize: 13 }}>
                  Edit →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
