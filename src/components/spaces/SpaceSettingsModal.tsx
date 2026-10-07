import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Space } from '@/types';
import { updateSpace, deleteSpace } from '@/services/spaceService';
import { useAuth } from '@/hooks/useAuth';
import { AVAILABLE_SPACE_ICONS } from '@/components/common/SpaceIcon';

interface SpaceSettingsModalProps {
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
  onSpaceUpdated: (updated: Space) => void;
  onSpaceDeleted: (spaceId: string) => void;
}

export const SpaceSettingsModal: React.FC<SpaceSettingsModalProps> = ({
  space,
  isOpen,
  onClose,
  onSpaceUpdated,
  onSpaceDeleted,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState(space?.name || '');
  const [description, setDescription] = useState(space?.description || '');
  const [icon, setIcon] = useState(space?.icon || 'folder');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  React.useEffect(() => {
    if (space) {
      setName(space.name);
      setDescription(space.description || '');
      setIcon(space.icon || 'folder');
      setConfirmDelete(false);
    }
  }, [space]);

  if (!space) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await updateSpace(
        space.id,
        {
          name: name.trim(),
          description: description.trim(),
          icon,
        },
        user?.uid || 'u1',
        user?.name || 'Admin'
      );
      onSpaceUpdated({
        ...space,
        name: name.trim(),
        description: description.trim(),
        icon,
      });
      onClose();
    } catch (e) {
      console.error('Update space error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteSpace(
        space.id,
        space.workspaceId,
        user?.uid || 'u1',
        user?.name || 'Admin'
      );
      onSpaceDeleted(space.id);
      onClose();
    } catch (e) {
      console.error('Delete space error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Space Settings: ${space.name}`}
      description={`Manage space metadata and configuration for [${space.key}].`}
      maxWidth="md"
    >
      <div className="space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Space Icon
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-36 overflow-y-auto">
              {AVAILABLE_SPACE_ICONS.map((item) => {
                const IconCmp = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                      icon === item.name
                        ? 'bg-primary/20 border-2 border-primary text-primary font-bold shadow-2xs'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                    title={item.label}
                  >
                    <IconCmp className="w-4 h-4" />
                    <span className="text-[9px] truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Space Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-1 focus:ring-primary outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-destructive/20">
          <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2">
            Danger Zone
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Deleting a space permanently removes all associated pages and comments. This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? 'Click again to permanently delete space' : 'Delete Space'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
