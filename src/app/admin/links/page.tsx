'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Link = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  order: number;
  visible: boolean;
};

export default function AdminLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: '',
    visible: true,
  });

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('order', { ascending: true });

    if (!error && data) {
      setLinks(data);
    }
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      // Update bestaande link
      await supabase
        .from('links')
        .update({
          title: formData.title,
          url: formData.url,
          icon: formData.icon || null,
          visible: formData.visible,
        })
        .eq('id', editingId);
    } else {
      // Voeg nieuwe link toe
      const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order)) : 0;
      await supabase
        .from('links')
        .insert({
          title: formData.title,
          url: formData.url,
          icon: formData.icon || null,
          order: maxOrder + 1,
          visible: formData.visible,
        });
    }

    setFormData({ title: '', url: '', icon: '', visible: true });
    setEditingId(null);
    loadLinks();
  }

  async function handleDelete(id: string) {
    if (confirm('Weet je zeker dat je deze link wilt verwijderen?')) {
      await supabase.from('links').delete().eq('id', id);
      loadLinks();
    }
  }

  function handleEdit(link: Link) {
    setEditingId(link.id);
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon || '',
      visible: link.visible,
    });
  }

  async function handleMove(id: string, direction: 'up' | 'down') {
    const index = links.findIndex(l => l.id === id);
    if (index === -1) return;

    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === links.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newLinks = [...links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];

    // Update orders
    for (let i = 0; i < newLinks.length; i++) {
      await supabase
        .from('links')
        .update({ order: i })
        .eq('id', newLinks[i].id);
    }

    loadLinks();
  }

  if (isLoading) {
    return <div className="text-center">Laden...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8 text-primary">Linktree Beheer</h1>

      {/* Form */}
      <div className="bg-dark-50 border border-primary/20 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">
          {editingId ? 'Link Bewerken' : 'Nieuwe Link Toevoegen'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Titel</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Icon (emoji of lege laten)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="input-field"
              placeholder="🎵"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-5 h-5 rounded border-primary/30 bg-dark-50 checked:bg-primary"
            />
            <label htmlFor="visible" className="text-sm font-medium">
              Zichtbaar op /links pagina
            </label>
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn-primary">
              {editingId ? 'Opslaan' : 'Toevoegen'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ title: '', url: '', icon: '', visible: true });
                }}
                className="btn-secondary"
              >
                Annuleren
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Links List */}
      <div className="space-y-4">
        {links.map((link) => (
          <div
            key={link.id}
            className="bg-dark-50 border border-primary/20 rounded-xl p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 flex-1">
              {link.icon && <span className="text-2xl">{link.icon}</span>}
              <div>
                <h3 className="font-semibold text-lg">{link.title}</h3>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  {link.url}
                </a>
                <div className="mt-1">
                  {link.visible ? (
                    <span className="text-xs text-green-400">Zichtbaar</span>
                  ) : (
                    <span className="text-xs text-gray-500">Verborgen</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMove(link.id, 'up')}
                className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                title="Omhoog"
              >
                ↑
              </button>
              <button
                onClick={() => handleMove(link.id, 'down')}
                className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                title="Omlaag"
              >
                ↓
              </button>
              <button
                onClick={() => handleEdit(link)}
                className="px-4 py-2 bg-primary hover:bg-primary-600 rounded-lg transition-colors"
              >
                Bewerken
              </button>
              <button
                onClick={() => handleDelete(link.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Geen links gevonden. Voeg je eerste link toe!
          </div>
        )}
      </div>
    </div>
  );
}
