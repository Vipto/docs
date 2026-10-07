import React from 'react';
import { FileText, Code2, Printer, Download } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Page } from '@/types';
import { exportToMarkdown, exportToHtml, exportToPdf } from '@/utils/exportHelpers';

interface ExportModalProps {
  page: Page | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ page, isOpen, onClose }) => {
  if (!page) return null;

  const exportOptions = [
    {
      id: 'markdown',
      title: 'Export as Markdown (.md)',
      description: 'Clean formatted Markdown suitable for GitHub or local documentation.',
      icon: <Code2 className="w-5 h-5 text-indigo-500" />,
      action: () => {
        exportToMarkdown(page);
        onClose();
      },
    },
    {
      id: 'html',
      title: 'Export as Standalone HTML (.html)',
      description: 'Self-contained HTML file styled with modern typography and readable css.',
      icon: <FileText className="w-5 h-5 text-blue-500" />,
      action: () => {
        exportToHtml(page);
        onClose();
      },
    },
    {
      id: 'pdf',
      title: 'Export as PDF Document (.pdf)',
      description: 'High fidelity print-ready PDF formatted for document distribution.',
      icon: <Printer className="w-5 h-5 text-rose-500" />,
      action: () => {
        exportToPdf(page);
        onClose();
      },
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Document"
      description={`Download "${page.title}" in standard file formats.`}
      maxWidth="md"
    >
      <div className="space-y-3">
        {exportOptions.map((opt) => (
          <div
            key={opt.id}
            onClick={opt.action}
            className="flex items-start gap-3.5 p-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-muted/40 cursor-pointer transition-all"
          >
            <div className="p-2 rounded-lg bg-background border border-border shrink-0 mt-0.5">
              {opt.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>{opt.title}</span>
                <Download className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {opt.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
