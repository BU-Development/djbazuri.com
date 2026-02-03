'use client';

import { useTranslations } from 'next-intl';

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
}

interface TrackListProps {
  title: string;
  tracks: Track[];
  priority: 'must_have' | 'normal' | 'blacklist';
  onRemoveTrack: (trackId: string) => void;
}

export default function TrackList({ title, tracks, priority, onRemoveTrack }: TrackListProps) {
  const t = useTranslations('dashboard.playlist');

  const colors = {
    must_have: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      title: 'text-green-800',
      badge: 'bg-green-500',
    },
    normal: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      title: 'text-blue-800',
      badge: 'bg-blue-500',
    },
    blacklist: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      title: 'text-red-800',
      badge: 'bg-red-500',
    },
  };

  const color = colors[priority];

  return (
    <div className={`${color.bg} border ${color.border} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${color.title}`}>{title}</h3>
        <span className={`${color.badge} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
          {tracks.length}
        </span>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No songs added yet</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center flex-1 min-w-0">
                {track.albumImage && (
                  <img
                    src={track.albumImage}
                    alt={track.album}
                    className="w-10 h-10 rounded mr-3 flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">{track.name}</p>
                  <p className="text-xs text-gray-600 truncate">{track.artists}</p>
                </div>
              </div>

              <button
                onClick={() => onRemoveTrack(track.id)}
                className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                title={t('remove')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
