import { useEffect } from 'react';

interface KeyboardShortcutHandlers {
  onOpenSearch?: () => void;
  onSave?: () => void;
  onOpenShortcuts?: () => void;
  onNewPage?: () => void;
}

export function useKeyboardShortcuts({
  onOpenSearch,
  onSave,
  onOpenShortcuts,
  onNewPage,
}: KeyboardShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + K -> Open Global Search / Command Palette
      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch?.();
      }

      // Ctrl/Cmd + S -> Save Page
      if (cmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl/Cmd + / -> Open Shortcuts Cheat Sheet
      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        onOpenShortcuts?.();
      }

      // Ctrl/Cmd + Shift + N -> New Page
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewPage?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch, onSave, onOpenShortcuts, onNewPage]);
}
