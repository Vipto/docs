import React, { useState } from 'react';
import { Copy, Check, Globe, Lock, ShieldCheck, Users } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Page, Space } from '@/types';

interface ShareModalProps {
  page: Page | null;
  space: Space | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  page,
  space,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!page) return null;

  const pageUrl = `${window.location.origin}/spaces/${space?.key || page.spaceId}/${page.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Documentation"
      description={`Share "${page.title}" with your team or copy direct link.`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Link Copy Bar */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Permanent Page URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pageUrl}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted/40 text-foreground text-xs font-mono select-all outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Access Permissions Breakdown */}
        <div className="rounded-xl border border-border bg-card p-3 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Workspace Access</div>
              <div className="text-xs text-muted-foreground">
                All members in <strong>Vipto</strong> with workspace permissions can access this document.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2 border-t border-border">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-foreground">Role Permissions</div>
              <div className="text-xs text-muted-foreground">
                <strong>Owners & Admins:</strong> Full access &bull; <strong>Editors:</strong> Edit & Comment &bull; <strong>Viewers:</strong> Read-only
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
