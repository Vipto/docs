import React, { useState } from 'react';
import { Sparkles, FileText, Check, Search, Eye, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { getAllTemplates } from './templateDefinitions';
import { PageTemplate, Space } from '@/types';
import { DocIcon } from '@/components/common/DocIcon';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: Space[];
  onSelectTemplate: (template: PageTemplate, spaceId: string) => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  spaces,
  onSelectTemplate,
}) => {
  const allTemplates = getAllTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<PageTemplate>(allTemplates[1] || allTemplates[0]);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(spaces[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'General', 'Product', 'Engineering', 'Design', 'Operations', 'Custom'];

  const filteredTemplates = allTemplates.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || (selectedCategory === 'Custom' ? t.isCustom : t.category === selectedCategory);
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = () => {
    const spaceId = selectedSpaceId || spaces[0]?.id;
    if (!spaceId) {
      alert('Please select a space first');
      return;
    }
    onSelectTemplate(selectedTemplate, spaceId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Browser"
      description="Accelerate your workflow with enterprise-standard Confluence documentation blueprints."
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {/* Top Controls: Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Split View: Left Templates List, Right Live Interactive Preview */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[420px] overflow-hidden">
          {/* Left Column: Template Cards */}
          <div className="md:col-span-5 overflow-y-auto pr-1 space-y-2">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No templates match "{searchQuery}"
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const isSelected = selectedTemplate.id === template.id;
                return (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                          <DocIcon icon={template.icon} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{template.title}</h4>
                          <span className="text-[10px] text-primary font-semibold">{template.category}</span>
                        </div>
                      </div>
                      {isSelected && (
                        <span className="p-1 rounded-full bg-primary text-primary-foreground shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Live Rendered Preview */}
          <div className="md:col-span-7 rounded-2xl border border-border bg-card/60 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Eye className="w-3.5 h-3.5 text-primary" />
                <span>Live Template Preview</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {selectedTemplate.category}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shrink-0">
                    <DocIcon icon={selectedTemplate.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-foreground">{selectedTemplate.title}</h3>
                    <p className="text-xs text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="h-px bg-border" />

                <div
                  className="vipto-prose text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Space Selection & Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-muted-foreground shrink-0">
              Target Space:
            </label>
            <select
              value={selectedSpaceId || (spaces[0]?.id ?? '')}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none"
            >
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.key})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUseTemplate}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Use Template
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
