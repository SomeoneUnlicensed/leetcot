import { Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui/components/tooltip';
import { Maximize2, Minimize2 } from '@repo/ui/icons';
import { useEffect } from 'react';
import { create } from 'zustand';

export const FS_SETTINGS = {
  isFullscreen: false,
};

type FSSettings = typeof FS_SETTINGS;

interface FSState {
  fssettings: FSSettings;
  updateFSSettings: (settings: Partial<FSSettings>) => void;
}

export const useFullscreenSettingsStore = create<FSState>()((set, get) => ({
  fssettings: FS_SETTINGS,
  updateFSSettings: (fssettings) => set({ fssettings: { ...get().fssettings, ...fssettings } }),
}));

export function FullscreenButton() {
  const { fssettings, updateFSSettings } = useFullscreenSettingsStore();

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    updateFSSettings({ ...fssettings, isFullscreen: !fssettings.isFullscreen });
  };

  useEffect(() => {
    const fullscreenchanged = () => {
      if (!document.fullscreenElement) {
        updateFSSettings({ ...fssettings, isFullscreen: false });
      }
    };
    document.addEventListener('fullscreenchange', fullscreenchanged);
    return () => document.removeEventListener('fullscreenchange', fullscreenchanged);
  }, [fssettings, updateFSSettings]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className="flex items-center justify-center rounded-lg p-1.5 text-zinc-400 transition-all hover:bg-zinc-800/60 hover:text-zinc-200 focus:outline-none"
          onClick={handleToggleFullscreen}
          aria-label="Во весь экран"
        >
          {fssettings.isFullscreen ? (
            <Minimize2 className="stroke-current stroke-[1.5]" size={18} />
          ) : (
            <Maximize2 className="stroke-current stroke-[1.5]" size={18} />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{fssettings.isFullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
