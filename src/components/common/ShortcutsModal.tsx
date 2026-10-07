import React from 'react';
import { Modal } from './Modal';
import { Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcutGroups = [
    {
      title: 'Navigation & Global',
      items: [
        { keys: ['Ctrl', 'K'], label: 'Open Global Search & Command Palette' },
        { keys: ['Ctrl', 'Shift', 'N'], label: 'Create New Page' },
        { keys: ['Ctrl', '/'], label: 'Open Keyboard Shortcuts' },
      ],
    },
    {
      title: 'Editor & Formatting',
      items: [
        { keys: ['/'], label: 'Open Slash Commands block menu' },
        { keys: ['Ctrl', 'B'], label: 'Bold' },
        { keys: ['Ctrl', 'I'], label: 'Italic' },
        { keys: ['Ctrl', 'U'], label: 'Underline' },
        { keys: ['Ctrl', 'S'], label: 'Save document immediately' },
        { keys: ['Ctrl', 'Shift', '7'], label: 'Numbered List' },
        { keys: ['Ctrl', 'Shift', '8'], label: 'Bullet List' },
        { keys: ['Ctrl', 'Z'], label: 'Undo' },
        { keys: ['Ctrl', 'Y'], label: 'Redo' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="lg">
      <div className="space-y-6">
        {shortcutGroups.map((group) => (
          <div key={group.title}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {group.title}
            </h4>
            <div className="space-y-2">
              {group.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="text-foreground">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="px-2 py-1 rounded bg-muted border border-border text-xs font-mono text-muted-foreground shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
