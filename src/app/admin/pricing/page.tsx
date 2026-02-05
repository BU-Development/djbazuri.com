'use client';

import { useState, useEffect } from 'react';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
}

export default function AdminPricingPage() {
  const [packages, setPackages] = useState<Package[]>([
    {
      id: 'basic',
      name: 'Basis',
      price: '350',
      duration: '4 uur',
      features: [
        'Professionele DJ apparatuur',
        'Muziek naar keuze',
        'Basis verlichting',
        'Spotify playlist integratie',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '550',
      duration: '6 uur',
      features: [
        'Alles van Basis pakket',
        'Geavanceerde verlichting',
        'Rookmachine',
        'Microfoon voor aankondigingen',
        'Extra optreden tijd',
      ],
    },
    {
      id: 'deluxe',
      name: 'Deluxe',
      price: '750',
      duration: '8 uur',
      features: [
        'Alles van Premium pakket',
        'Complete licht- en geluidsysteem',
        'DJ booth decoratie',
        'Speciale effecten',
        'Onbeperkte playlist aanvragen',
      ],
    },
  ]);

  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // TODO: Save to database
    // For now, this shows the current values
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage({ ...pkg, features: [...pkg.features] });
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
      features: [...editingPackage.features, newFeature.trim()],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    if (!editingPackage) return;

    setEditingPackage({
      ...editingPackage,
      features: editingPackage.features.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-purple-500">Prijzen Beheer</h1>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Opslaan
        </button>
      </div>

      {saved && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg text-green-300">
          Wijzigingen opgeslagen!
        </div>
      )}

      <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 mb-8">
        <p className="text-yellow-300 text-sm">
          <strong>Let op:</strong> Prijzen worden momenteel uit de vertaalbestanden geladen.
          Om prijzen permanent te wijzigen, pas de bestanden <code className="bg-black/30 px-1 rounded">messages/nl.json</code> en <code className="bg-black/30 px-1 rounded">messages/en.json</code> aan.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-zinc-900 border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
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
              {pkg.features.map((feature, index) => (
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
              {editingPackage.name} Bewerken
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Naam</label>
                <input
                  type="text"
                  value={editingPackage.name}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-500/30 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Prijs (€)</label>
                <input
                  type="text"
                  value={editingPackage.price}
                  onChange={(e) => setEditingPackage({ ...editingPackage, price: e.target.value })}
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

              <div>
                <label className="block text-sm text-gray-400 mb-1">Features</label>
                <ul className="space-y-2 mb-2">
                  {editingPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...editingPackage.features];
                          newFeatures[index] = e.target.value;
                          setEditingPackage({ ...editingPackage, features: newFeatures });
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
