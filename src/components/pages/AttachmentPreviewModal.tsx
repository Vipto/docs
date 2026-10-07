import React from 'react';
import { Download, X, File, ExternalLink, ZoomIn } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Attachment } from '@/types';
import { formatFileSize, formatDate } from '@/utils/formatters';

interface AttachmentPreviewModalProps {
  attachment: Attachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttachmentPreviewModal: React.FC<AttachmentPreviewModalProps> = ({
  attachment,
  isOpen,
  onClose,
}) => {
  if (!attachment) return null;

  const isImage = attachment.fileType.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.fileName);
  const isPdf = attachment.fileType.includes('pdf') || attachment.fileName.endsWith('.pdf');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={attachment.fileName}
      description={`Uploaded by ${attachment.uploadedByName} • ${formatFileSize(attachment.fileSize)} • ${formatDate(attachment.createdAt)}`}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {/* Preview Container */}
        <div className="min-h-[380px] max-h-[600px] flex items-center justify-center rounded-2xl bg-muted/30 border border-border overflow-hidden p-4">
          {isImage ? (
            <img
              src={attachment.downloadUrl}
              alt={attachment.fileName}
              className="max-h-[540px] max-w-full object-contain rounded-xl shadow-md"
            />
          ) : isPdf ? (
            <iframe
              src={attachment.downloadUrl}
              title={attachment.fileName}
              className="w-full h-[520px] rounded-xl border border-border"
            />
          ) : (
            <div className="text-center space-y-3 p-8">
              <File className="w-16 h-16 mx-auto text-primary opacity-60" />
              <div>
                <h4 className="font-bold text-sm text-foreground">{attachment.fileName}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Preview not directly supported in-browser for this file format ({attachment.fileType}).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground font-mono">
            {formatFileSize(attachment.fileSize)}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={attachment.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in New Tab</span>
            </a>

            <a
              href={attachment.downloadUrl}
              download={attachment.fileName}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
};
