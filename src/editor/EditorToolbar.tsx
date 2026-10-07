import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
  Sparkles,
  Info,
  Highlighter,
  Trash2,
  Plus,
  Columns,
  Rows,
  Tag,
  Calendar,
  ChevronsUpDown,
} from 'lucide-react';
import { StatusColor } from './extensions/StatusLozenge';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor, readOnly }) => {
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  if (!editor || readOnly) return null;


  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-border bg-background/95 backdrop-blur px-4 py-2 text-foreground">
      {/* History */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bold')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('italic')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('underline')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('strike')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('code')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('highlight')
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Highlight text"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Bullet List (Ctrl+Shift+8)"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Numbered List (Ctrl+Shift+7)"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('taskList')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Checklist / Task List"
      >
        <CheckSquare className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Blocks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('blockquote')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('codeBlock')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Code Block"
      >
        <Sparkles className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCallout({ type: 'info' }).run()}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('callout')
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Callout Box"
      >
        <Info className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Divider"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Media & Links */}
      <button
        type="button"
        onClick={setLink}
        className={`p-1.5 rounded transition-colors ${
          editor.isActive('link')
            ? 'bg-primary/15 text-primary font-semibold'
            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
        }`}
        title="Link (Ctrl+K)"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={addImage}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Add Image URL"
      >
        <ImageIcon className="w-4 h-4" />
      </button>

      {/* Confluence Macros (Status, Date, Expand) */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          title="Insert Status Lozenge"
        >
          <Tag className="w-4 h-4 text-blue-500" />
        </button>

        {showStatusMenu && (
          <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-xl shadow-xl p-1.5 flex flex-col gap-1 z-30 min-w-[150px] text-xs animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
              Select Status
            </div>
            {[
              { label: 'IN PROGRESS', color: 'blue' as StatusColor },
              { label: 'APPROVED', color: 'green' as StatusColor },
              { label: 'IN REVIEW', color: 'yellow' as StatusColor },
              { label: 'BLOCKED', color: 'red' as StatusColor },
              { label: 'READY FOR DEV', color: 'purple' as StatusColor },
              { label: 'DRAFT', color: 'grey' as StatusColor },
            ].map((st) => (
              <button
                key={st.label}
                type="button"
                onClick={() => {
                  (editor.chain().focus() as any).setStatusLozenge({ text: st.label, color: st.color }).run();
                  setShowStatusMenu(false);
                }}
                className="px-2 py-1.5 rounded-lg hover:bg-muted text-left flex items-center justify-between"
              >
                <span className={`status-lozenge status-lozenge-${st.color} px-2 py-0.5 rounded text-[10px] font-bold`}>
                  {st.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          const dateStr = new Date().toISOString().split('T')[0];
          (editor.chain().focus() as any).setDateLozenge({ timestamp: dateStr, label: 'Due' }).run();
        }}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Insert Date Badge"
      >
        <Calendar className="w-4 h-4 text-amber-500" />
      </button>

      <button
        type="button"
        onClick={() => {
          (editor.chain().focus() as any).setExpand({ title: 'Click to expand / collapse details...' }).run();
        }}
        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="Insert Collapsible Accordion"
      >
        <ChevronsUpDown className="w-4 h-4 text-indigo-500" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Table tools */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!editor.isActive('table')) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            } else {
              setShowTableMenu(!showTableMenu);
            }
          }}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
            editor.isActive('table')
              ? 'bg-primary/15 text-primary font-semibold'
              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
          title="Table options"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        {editor.isActive('table') && (
          <div className="absolute top-full left-0 mt-1 bg-popover border border-border rounded-lg shadow-xl p-1.5 flex flex-col gap-1 z-30 min-w-[170px] text-xs">
            <button
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-1.5 rounded hover:bg-muted text-left flex items-center gap-2 text-foreground"
            >
              <Columns className="w-3.5 h-3.5 text-primary" /> Add Column After
            </button>
            <button
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-1.5 rounded hover:bg-muted text-left flex items-center gap-2 text-foreground"
            >
              <Rows className="w-3.5 h-3.5 text-primary" /> Add Row After
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-1.5 rounded hover:bg-muted text-left flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Column
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-1.5 rounded hover:bg-muted text-left flex items-center gap-2 text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Row
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-1.5 rounded hover:bg-destructive/10 text-left flex items-center gap-2 text-destructive font-medium border-t border-border pt-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

