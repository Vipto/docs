import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import { MessageSquarePlus, Sparkles } from 'lucide-react';

import { Callout } from './extensions/Callout';
import { InlineComment } from './extensions/InlineComment';
import { ColumnLayout, ColumnCell } from './extensions/Columns';
import { NativeTabs, TabItem } from './extensions/NativeTabs';
import { PageProperties } from './extensions/PageProperties';
import { Expand } from './extensions/Expand';
import { StatusLozenge } from './extensions/StatusLozenge';
import { DateLozenge } from './extensions/DateLozenge';
import { EditorToolbar } from './EditorToolbar';
import { SlashCommands } from './SlashCommands';
import { TableOfContentsItem } from '@/types';
import { slugify } from '@/utils/formatters';

interface EditorProps {
  initialContent: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onSave?: (content: string, isManual?: boolean) => void;
  onTocChange?: (toc: TableOfContentsItem[]) => void;
  onAddInlineComment?: (selectedText: string) => void;
  saveStatus?: 'saved' | 'saving' | 'unsaved';
  lastSavedAt?: string;
}

export const DocumentEditor: React.FC<EditorProps> = ({
  initialContent,
  readOnly = false,
  autoFocus = false,
  onSave,
  onTocChange,
  onAddInlineComment,
  saveStatus = 'saved',
  lastSavedAt,
}) => {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [selectionPopup, setSelectionPopup] = useState<{ visible: boolean; top: number; left: number; text: string }>({
    visible: false,
    top: 0,
    left: 0,
    text: '',
  });

  const extractToc = useCallback((htmlContent: string) => {
    if (!onTocChange) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headers = doc.querySelectorAll('h1, h2, h3');
    const items: TableOfContentsItem[] = [];

    headers.forEach((h, index) => {
      const level = parseInt(h.tagName.substring(1), 10);
      const text = h.textContent || '';
      const id = slugify(text) || `section-${index}`;
      items.push({ id, text, level });
    });

    onTocChange(items);
  }, [onTocChange]);

  const editor = useEditor({
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    content: initialContent,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-sm overflow-x-auto my-4 shadow-sm border border-slate-800',
          },
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline font-medium hover:text-primary/80 transition-colors',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 border border-border shadow-sm',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4 border border-border rounded-xl overflow-hidden shadow-xs',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/60 p-3 text-left font-bold text-foreground text-xs uppercase tracking-wider',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-3 text-foreground align-top text-xs',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2 space-y-1.5 my-2.5',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2.5',
        },
      }),
      Callout,
      InlineComment,
      ColumnLayout,
      ColumnCell,
      NativeTabs,
      TabItem,
      PageProperties,
      Expand,
      StatusLozenge,
      DateLozenge,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return 'Heading...';
          }
          return "Type '/' for Confluence blocks or start writing...";
        },
      }),
    ],
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to && !readOnly) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        if (text.trim().length > 0) {
          const domPos = editor.view.coordsAtPos(to);
          setSelectionPopup({
            visible: true,
            top: domPos.top - 42,
            left: domPos.left,
            text,
          });
          return;
        }
      }
      setSelectionPopup({ visible: false, top: 0, left: 0, text: '' });
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      extractToc(html);
      onSave?.(html, false);

      // Check for slash command
      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from, '\n');

      if (textBefore === '/') {
        const domPos = editor.view.coordsAtPos(from);
        setSlashMenuPosition({
          top: domPos.bottom + 8,
          left: domPos.left,
        });
        setSlashMenuOpen(true);
      } else {
        setSlashMenuOpen(false);
      }
    },
  });

  // Keep content updated if prop changes
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, false);
      extractToc(initialContent);
    }
  }, [initialContent, editor, extractToc]);

  // Initial TOC extract
  useEffect(() => {
    if (initialContent) {
      extractToc(initialContent);
    }
  }, [initialContent, extractToc]);

  // Update editable mode
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  // Autofocus when requested
  useEffect(() => {
    if (editor && autoFocus && !readOnly) {
      // Small timeout to ensure DOM rendering has settled
      const timer = setTimeout(() => {
        editor.commands.focus('end');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editor, autoFocus, readOnly]);

  const handleCreateInlineComment = () => {
    if (!editor || !selectionPopup.text) return;
    const commentId = `inline_${Date.now()}`;
    editor.chain().focus().setInlineComment({ commentId }).run();
    setSelectionPopup({ visible: false, top: 0, left: 0, text: '' });
    onAddInlineComment?.(selectionPopup.text);
  };

  return (
    <div className="relative flex flex-col w-full min-h-[600px] bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      {/* Save status pill & editor toolbar */}
      <div className="relative">
        <EditorToolbar editor={editor} readOnly={readOnly} />

        {!readOnly && (
          <div className="absolute right-4 top-2.5 z-30 flex items-center gap-2 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                saveStatus === 'saving'
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : saveStatus === 'unsaved'
                  ? 'bg-slate-100 dark:bg-slate-800 text-muted-foreground'
                  : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'saving'
                    ? 'bg-amber-500 animate-pulse'
                    : saveStatus === 'unsaved'
                    ? 'bg-slate-400'
                    : 'bg-emerald-500'
                }`}
              />
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'unsaved'
                ? 'Unsaved changes'
                : 'All changes saved'}
            </span>
          </div>
        )}
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 p-6 md:p-10 lg:p-12 focus-within:outline-none">
        <EditorContent
          editor={editor}
          className="vipto-prose max-w-4xl mx-auto focus:outline-none"
        />
      </div>

      {/* Floating Selection Tool (Add Comment / Format) */}
      {selectionPopup.visible && (
        <div
          style={{
            top: `${Math.max(10, selectionPopup.top)}px`,
            left: `${Math.min(window.innerWidth - 200, Math.max(20, selectionPopup.left))}px`,
          }}
          className="fixed z-50 flex items-center gap-1 p-1 rounded-xl bg-popover text-popover-foreground border border-border shadow-xl animate-in fade-in zoom-in-95 text-xs"
        >
          <button
            type="button"
            onClick={handleCreateInlineComment}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-2xs"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Comment</span>
          </button>
        </div>
      )}

      {/* Slash commands menu */}
      <SlashCommands
        editor={editor}
        isOpen={slashMenuOpen}
        onClose={() => setSlashMenuOpen(false)}
        position={slashMenuPosition}
      />
    </div>
  );
};
