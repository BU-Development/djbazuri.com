'use client';

import { useState, useEffect } from 'react';

interface Package {
  id: string;
  name_nl: string;
  name_en: string;
  price: number;
  duration: string;
  features_nl: string[];
  features_en: string[];
  sort_order: number;
}

export default function AdminPricingPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPricing();
  }, []);

  async function loadPricing() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pricing');
      const result = await response.json();

      if (!response.ok) {
        // Gebruik default data als tabel niet bestaat
        setPackages([
          { id: 'basic', name_nl: 'Basis', name_en: 'Basic', price: 350, duration: '4 uur', features_nl: ['Professionele DJ apparatuur', 'Muziek naar keuze', 'Basis verlichting', 'Spotify playlist integratie'], features_en: ['Professional DJ equipment', 'Music of your choice', 'Basic lighting', 'Spotify playlist integration'], sort_order: 1 },
          { id: 'premium', name_nl: 'Premium', name_en: 'Premium', price: 550, duration: '6 uur', features_nl: ['Alles van Basis pakket', 'Geavanceerde verlichting', 'Rookmachine', 'Microfoon'], features_en: ['Everything from Basic', 'Advanced lighting', 'Smoke machine', 'Microphone'], sort_order: 2 },
          { id: 'deluxe', name_nl: 'Deluxe', name_en: 'Deluxe', price: 750, duration: '8 uur', features_nl: ['Alles van Premium pakket', 'Complete licht/geluid', 'DJ booth decoratie', 'Speciale effecten'], features_en: ['Everything from Premium', 'Complete light/sound', 'DJ booth decoration', 'Special effects'], sort_order: 3 },
        ]);
        setMessage({ type: 'error', text: result.error || 'Kon prijzen niet laden' });
      } else {
        setPackages(result.data || []);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Kon prijzen niet laden' });
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packages }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Kon prijzen niet opslaan');
      }

      setMessage({ type: 'success', text: 'Prijzen opgeslagen!' });
    } catch (error: any) {
      console.error('Error saving:', error);
      setMessage({ type: 'error', text: `Fout bij opslaan: ${error.message}` });
    }

    setSaving(false);
  }

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage({ ...pkg, features_nl: [...pkg.features_nl], features_en: [...pkg.features_en] });
  };

  const handleUpdatePackage = () => {
    if (!editingPackage) return;

    setPackages(packages.map(p =>
      p.id === editingPackage.id ? editingPackage : p
    ));
    setEditingPackage(null);
  };

  const handleAddFeature = () => {
    if (!editingPackage || !newFeature.trim()) return;

    setEditingPackage({
      ...editingPackage,
      features_nl: [...editingPackage.features_nl, newFeature.trim()],
      features_en: [...editingPackage.features_en, newFeature.trim()],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPackage) return;

    setEditingPackage({
      ...editingPackage,
      features_nl: editingPackage.features_nl.filter((_, i) => i !== index),
      features_en: editingPackage.features_en.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-purple-500">Prijzen Beheer</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-900/50 border border-green-600 text-green-300'
            : 'bg-red-900/50 border border-red-600 text-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{pkg.name_nl}</h3>
              <button
                onClick={() => handleEditPackage(pkg)}
                className="text-purple-400 hover:text-purple-300"
              >
                Bewerken
              </button>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-purple-400">€{pkg.price}</span>
              <span className="text-gray-400 ml-2">/ {pkg.duration}</span>
            </div>

            <ul className="space-y-2">
              {pkg.features_nl.map((feature, index) => (
                <li key={index} className="flex items-start text-gray-300">
                  <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingPackage.name_nl} Bewerken
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Naam (NL)</label>
                  <input
                    type="text"
                    value={editingPackage.name_nl}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name_nl: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Naam (EN)</label>
                  <input
                    type="text"
                    value={editingPackage.name_en}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name_en: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prijs (€)</label>
                  <input
                    type="number"
                    value={editingPackage.price}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duur</label>
                  <input
                    type="text"
                    value={editingPackage.duration}
                    onChange={(e) => setEditingPackage({ ...editingPackage, duration: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Features (NL)</label>
                <ul className="space-y-2 mb-2">
                  {editingPackage.features_nl.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingPackage.features_nl];
                          newFeatures[index] = e.target.value;
                          setEditingPackage({ ...editingPackage, features_nl: newFeatures });
                        }}
                        className="flex-1 px-3 py-1 bg-black border border-purple-500/30 rounded text-white text-sm"
                      />
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Nieuwe feature..."
                    className="flex-1 px-3 py-1 bg-black border border-purple-500/30 rounded text-white text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                  />
                  <button
                    onClick={handleAddFeature}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleUpdatePackage}
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Opslaan
              </button>
              <button
                onClick={() => setEditingPackage(null)}
                className="flex-1 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
