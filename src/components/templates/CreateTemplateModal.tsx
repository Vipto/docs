import React, { useState } from 'react';
import { Sparkles, Check, FileText } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { PageTemplate } from '@/types';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialContent?: string;
  onSaveTemplate: (template: PageTemplate) => void;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  initialTitle = '',
  initialContent = '',
  onSaveTemplate,
}) => {
  const [title, setTitle] = useState(initialTitle || 'Custom Blueprint Template');
  const [description, setDescription] = useState('Standardized template for team documentation.');
  const [icon, setIcon] = useState('✨');
  const [category, setCategory] = useState<PageTemplate['category']>('Engineering');

  const categories: PageTemplate['category'][] = [
    'General',
    'Engineering',
    'Product',
    'Operations',
    'Design',
    'Custom',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTemplate: PageTemplate = {
      id: `custom_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      icon,
      category,
      content: initialContent || '<h1>[Template Title]</h1><p>Start documenting here...</p>',
      isCustom: true,
    };

    onSaveTemplate(newTemplate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Workspace Template"
      description="Create a reusable Confluence blueprint for your team members."
      maxWidth="md"
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-foreground mb-1">Template Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sprint Retrospective Blueprint"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-foreground mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PageTemplate['category'])}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Icon Emoji</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary text-center"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-foreground mb-1">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief explanation of when to use this template..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" /> Save Template
          </button>
        </div>
      </form>
    </Modal>
  );
};
