import React, { useState } from 'react';
import { Image, X, Sparkles, RefreshCw } from 'lucide-react';

interface PageCoverProps {
  coverUrl?: string;
  readOnly?: boolean;
  onUpdateCover: (url: string) => void;
  onRemoveCover: () => void;
}

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80', // Aurora Abstract
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80', // Rainbow Gradient
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80', // Cyber Tech Grid
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=80', // 3D Fluid Indigo
  'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=1600&q=80', // Dark Minimal Mountains
];

export const PageCover: React.FC<PageCoverProps> = ({
  coverUrl,
  readOnly = false,
  onUpdateCover,
  onRemoveCover,
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  if (!coverUrl) {
    if (readOnly) return null;
    return (
      <div className="group relative -mt-4 mb-2">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="opacity-0 group-hover:opacity-100 px-3 py-1 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground bg-muted/60 hover:bg-muted transition-all flex items-center gap-1.5"
        >
          <Image className="w-3.5 h-3.5" />
          <span>Add Header Cover</span>
        </button>

        {pickerOpen && (
          <div className="absolute left-0 top-full mt-2 p-3 rounded-2xl border border-border bg-popover shadow-2xl z-40 w-80 space-y-3 animate-in fade-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span>Select Cover Preset</span>
              <button onClick={() => setPickerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {PRESET_COVERS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onUpdateCover(url);
                    setPickerOpen(false);
                  }}
                  className="h-14 rounded-lg bg-cover bg-center cursor-pointer border border-border hover:scale-105 transition-transform"
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>

            <div className="pt-2 border-t border-border space-y-1.5">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Or paste image URL..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs outline-none"
              />
              {customUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateCover(customUrl);
                    setPickerOpen(false);
                  }}
                  className="w-full py-1 rounded-lg bg-primary text-primary-foreground font-bold text-xs"
                >
                  Use Custom Image
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group w-full rounded-3xl overflow-hidden mb-6 page-cover-banner border border-border shadow-xs">
      <img
        src={coverUrl}
        alt="Page Cover"
        className="w-full h-full object-cover object-center"
      />

      {!readOnly && (
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextCover = PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)];
              onUpdateCover(nextCover);
            }}
            className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Cover</span>
          </button>
          <button
            type="button"
            onClick={onRemoveCover}
            className="p-1.5 rounded-xl bg-black/60 hover:bg-rose-900/80 text-white text-xs font-semibold backdrop-blur-md transition-colors shadow-sm"
            title="Remove Cover"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
