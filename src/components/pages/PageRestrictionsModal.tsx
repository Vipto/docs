import React, { useState } from 'react';
import { Lock, Unlock, Shield, ShieldAlert, User, Check, Plus, Trash2, Users } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Page, PageRestrictions, WorkspaceMember } from '@/types';
import { Avatar } from '@/components/common/Avatar';

interface PageRestrictionsModalProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
  onSaveRestrictions: (restrictions: PageRestrictions) => Promise<void>;
}

export const PageRestrictionsModal: React.FC<PageRestrictionsModalProps> = ({
  page,
  isOpen,
  onClose,
  members,
  onSaveRestrictions,
}) => {
  const currentRestrictions = page?.restrictions || {
    lockType: 'open',
    allowedEditors: [],
    allowedViewers: [],
  };

  const [lockType, setLockType] = useState<'open' | 'edit_restricted' | 'private'>(
    currentRestrictions.lockType || currentRestrictions.level || 'open'
  );
  const [allowedEditors, setAllowedEditors] = useState<string[]>(
    currentRestrictions.allowedEditors || []
  );
  const [allowedViewers, setAllowedViewers] = useState<string[]>(
    currentRestrictions.allowedViewers || []
  );
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const [saving, setSaving] = useState(false);

  if (!page) return null;

  const handleAddMember = () => {
    if (!selectedMemberId) return;
    if (selectedRole === 'editor') {
      if (!allowedEditors.includes(selectedMemberId)) {
        setAllowedEditors((prev) => [...prev, selectedMemberId]);
        setAllowedViewers((prev) => prev.filter((id) => id !== selectedMemberId));
      }
    } else {
      if (!allowedViewers.includes(selectedMemberId)) {
        setAllowedViewers((prev) => [...prev, selectedMemberId]);
        setAllowedEditors((prev) => prev.filter((id) => id !== selectedMemberId));
      }
    }
    setSelectedMemberId('');
  };

  const handleRemoveMember = (memberId: string) => {
    setAllowedEditors((prev) => prev.filter((id) => id !== memberId));
    setAllowedViewers((prev) => prev.filter((id) => id !== memberId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveRestrictions({
        lockType,
        allowedEditors: lockType === 'open' ? [] : allowedEditors,
        allowedViewers: lockType === 'private' ? allowedViewers : [],
      });
      onClose();
    } catch (e) {
      console.error('Save restrictions error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Page Access Restrictions"
      description={`Control who can view and edit "${page.title}".`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Lock Level Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Restriction Level
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Option 1: Open */}
            <div
              onClick={() => setLockType('open')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                lockType === 'open'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Unlock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">No restrictions (Open)</span>
                  {lockType === 'open' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Anyone in the workspace with standard permissions can view and edit this page.
                </p>
              </div>
            </div>

            {/* Option 2: Edit Restricted */}
            <div
              onClick={() => setLockType('edit_restricted')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                lockType === 'edit_restricted'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Editing restricted</span>
                  {lockType === 'edit_restricted' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Anyone can view, but only designated people below can edit.
                </p>
              </div>
            </div>

            {/* Option 3: Strict Private */}
            <div
              onClick={() => setLockType('private')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                lockType === 'private'
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Only specific people can view or edit</span>
                  {lockType === 'private' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Completely confidential. Hidden from other team members in search and page trees.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Member Overrides List (When not Open) */}
        {lockType !== 'open' && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Designated Permissions
            </div>

            {/* Add Member Row */}
            <div className="flex items-center gap-2">
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Select team member...</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                className="w-32 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="editor">Can edit</option>
                {lockType === 'private' && <option value="viewer">Can view</option>}
              </select>

              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedMemberId}
                className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {/* Existing Overrides Table */}
            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden text-xs">
              <div className="p-3 flex items-center justify-between bg-muted/20 text-muted-foreground font-semibold text-[11px]">
                <span>Member</span>
                <span>Permission</span>
              </div>

              {allowedEditors.length === 0 && allowedViewers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No specific member overrides added yet. Page author has full access.
                </div>
              ) : (
                <>
                  {allowedEditors.map((userId) => {
                    const member = members.find((m) => m.userId === userId);
                    return (
                      <div key={userId} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={member?.name || 'User'} avatarUrl={member?.avatar} size="sm" />
                          <div>
                            <span className="font-semibold text-foreground">{member?.name || userId}</span>
                            <span className="text-[10px] text-muted-foreground block">{member?.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                            Can edit
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(userId)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {allowedViewers.map((userId) => {
                    const member = members.find((m) => m.userId === userId);
                    return (
                      <div key={userId} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={member?.name || 'User'} avatarUrl={member?.avatar} size="sm" />
                          <div>
                            <span className="font-semibold text-foreground">{member?.name || userId}</span>
                            <span className="text-[10px] text-muted-foreground block">{member?.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                            Can view
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(userId)}
                            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Applying...' : 'Apply Restrictions'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
