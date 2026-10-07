import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table,
  Image,
  Info,
  Minus,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  FileText,
  Columns,
  Layers,
  LayoutGrid,
  Link,
  AtSign,
  HelpCircle,
} from 'lucide-react';

interface SlashCommandsProps {
  editor: Editor | null;
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number };
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Basic Blocks' | 'Callouts & Notes' | 'Layouts & Containers' | 'Media & Tables';
  action: (editor: Editor) => void;
}

export const SlashCommands: React.FC<SlashCommandsProps> = ({
  editor,
  isOpen,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filter, setFilter] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    // Basic Blocks
    {
      title: 'Heading 1',
      description: 'Major section heading',
      icon: <Heading1 className="w-4 h-4 text-primary" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Heading 2',
      description: 'Medium sub-section heading',
      icon: <Heading2 className="w-4 h-4 text-primary" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Heading 3',
      description: 'Small topic heading',
      icon: <Heading3 className="w-4 h-4 text-primary" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Bullet List',
      description: 'Simple unordered bullet list',
      icon: <List className="w-4 h-4 text-emerald-500" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Numbered List',
      description: 'Sequential ordered list with numbers',
      icon: <ListOrdered className="w-4 h-4 text-emerald-500" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Task List / Checklist',
      description: 'Interactive checklist with checkboxes',
      icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleTaskList().run(),
    },
    {
      title: 'Quote Block',
      description: 'Capture styled quote or citation',
      icon: <Quote className="w-4 h-4 text-purple-500" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Code Block',
      description: 'Syntax-highlighted code container',
      icon: <Code className="w-4 h-4 text-indigo-500" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: 'Divider Line',
      description: 'Horizontal separator line',
      icon: <Minus className="w-4 h-4 text-muted-foreground" />,
      category: 'Basic Blocks',
      action: (ed) => ed.chain().focus().setHorizontalRule().run(),
    },

    // Callouts & Notes
    {
      title: 'Info Callout',
      description: 'Highlighted informational alert box',
      icon: <Info className="w-4 h-4 text-blue-500" />,
      category: 'Callouts & Notes',
      action: (ed) => ed.chain().focus().toggleCallout({ type: 'info' }).run(),
    },
    {
      title: 'Tip Callout',
      description: 'Helpful advice or best practice box',
      icon: <Lightbulb className="w-4 h-4 text-emerald-500" />,
      category: 'Callouts & Notes',
      action: (ed) => ed.chain().focus().toggleCallout({ type: 'tip' }).run(),
    },
    {
      title: 'Warning Callout',
      description: 'Important warning or caution highlight',
      icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
      category: 'Callouts & Notes',
      action: (ed) => ed.chain().focus().toggleCallout({ type: 'warning' }).run(),
    },
    {
      title: 'Danger / Error Callout',
      description: 'Critical error or high-risk notice',
      icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
      category: 'Callouts & Notes',
      action: (ed) => ed.chain().focus().toggleCallout({ type: 'danger' }).run(),
    },
    {
      title: 'Purple Note Callout',
      description: 'General remarks and memo highlight',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      category: 'Callouts & Notes',
      action: (ed) => ed.chain().focus().toggleCallout({ type: 'note' }).run(),
    },

    // Layouts & Containers
    {
      title: 'Status Lozenge Badge',
      description: 'Color-coded status pill (IN PROGRESS, APPROVED, BLOCKED)',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        const text = window.prompt('Status Label (e.g. IN PROGRESS, APPROVED, BLOCKED):', 'IN PROGRESS');
        if (text) {
          (ed.chain().focus() as any).setStatusLozenge({ text: text.toUpperCase(), color: 'blue' }).run();
        }
      },
    },
    {
      title: 'Date Badge',
      description: 'Inline formatted calendar date badge',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        const dateStr = new Date().toISOString().split('T')[0];
        (ed.chain().focus() as any).setDateLozenge({ timestamp: dateStr, label: 'Target' }).run();
      },
    },
    {
      title: 'Expand / Collapsible Section',
      description: 'Collapsible accordion block for hidden details or FAQs',
      icon: <Layers className="w-4 h-4 text-indigo-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        const title = window.prompt('Accordion Title:', 'Click to expand details...');
        (ed.chain().focus() as any).setExpand({ title: title || 'Click to expand...' }).run();
      },
    },
    {
      title: '2 Columns Layout',
      description: 'Split content into 2 equal side-by-side columns',
      icon: <Columns className="w-4 h-4 text-indigo-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        ed.chain()
          .focus()
          .insertContent(
            `<div class="vipto-columns-2" data-columns="2">
              <div class="vipto-column-cell"><p>Column 1 content...</p></div>
              <div class="vipto-column-cell"><p>Column 2 content...</p></div>
            </div><p></p>`
          )
          .run();
      },
    },
    {
      title: '3 Columns Layout',
      description: 'Split content into 3 side-by-side columns',
      icon: <LayoutGrid className="w-4 h-4 text-indigo-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        ed.chain()
          .focus()
          .insertContent(
            `<div class="vipto-columns-3" data-columns="3">
              <div class="vipto-column-cell"><p>Column 1</p></div>
              <div class="vipto-column-cell"><p>Column 2</p></div>
              <div class="vipto-column-cell"><p>Column 3</p></div>
            </div><p></p>`
          )
          .run();
      },
    },
    {
      title: 'Native Tabs Container',
      description: 'Multi-tabbed block for organized documentation',
      icon: <Layers className="w-4 h-4 text-blue-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        ed.chain()
          .focus()
          .insertContent(
            `<div class="vipto-tabs-container">
              <div class="vipto-tab-header-list">
                <div class="vipto-tab-btn active">Overview</div>
                <div class="vipto-tab-btn">API Specs</div>
                <div class="vipto-tab-btn">Examples</div>
              </div>
              <div class="vipto-tab-content">
                <p>Add overview documentation for this module...</p>
              </div>
            </div><p></p>`
          )
          .run();
      },
    },
    {
      title: 'Page Properties Card',
      description: 'Structured metadata block (Status, Owner, Due Date)',
      icon: <FileText className="w-4 h-4 text-amber-500" />,
      category: 'Layouts & Containers',
      action: (ed) => {
        ed.chain()
          .focus()
          .insertContent(
            `<div class="vipto-properties-card">
              <div class="vipto-properties-header">📋 Page Properties & Specifications</div>
              <div class="vipto-properties-grid">
                <div class="vipto-property-item">
                  <div class="vipto-property-label">Document Status</div>
                  <div class="vipto-property-value"><span class="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-semibold text-xs">Approved</span></div>
                </div>
                <div class="vipto-property-item">
                  <div class="vipto-property-label">Owner</div>
                  <div class="vipto-property-value">Engineering Team</div>
                </div>
                <div class="vipto-property-item">
                  <div class="vipto-property-label">Target Release</div>
                  <div class="vipto-property-value">Q3 2026</div>
                </div>
                <div class="vipto-property-item">
                  <div class="vipto-property-label">Review Priority</div>
                  <div class="vipto-property-value">P0 High</div>
                </div>
              </div>
            </div><p></p>`
          )
          .run();
      },
    },


    // Media & Tables
    {
      title: 'Table (3x3)',
      description: 'Insert responsive table with header row',
      icon: <Table className="w-4 h-4 text-blue-500" />,
      category: 'Media & Tables',
      action: (ed) =>
        ed.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Smart Link Preview Card',
      description: 'Insert rich preview card for external URL / GitHub / Figma',
      icon: <Link className="w-4 h-4 text-teal-500" />,
      category: 'Media & Tables',
      action: (ed) => {
        const url = window.prompt('Enter Resource URL (e.g. GitHub, Figma, Docs):');
        if (!url) return;
        let title = 'Resource Link';
        let domain = 'external';
        try {
          const parsed = new URL(url);
          domain = parsed.hostname;
          title = parsed.pathname.replace(/^\//, '') || domain;
        } catch (_) {}

        ed.chain()
          .focus()
          .insertContent(
            `<a href="${url}" target="_blank" rel="noreferrer" class="smart-link-card">
              <div class="smart-link-icon">🔗</div>
              <div class="min-w-0">
                <div class="smart-link-title">${title}</div>
                <div class="smart-link-domain">${domain}</div>
              </div>
            </a><p></p>`
          )
          .run();
      },
    },
    {
      title: 'Image Embed',
      description: 'Embed image from image URL',
      icon: <Image className="w-4 h-4 text-teal-500" />,
      category: 'Media & Tables',
      action: (ed) => {
        const url = window.prompt('Enter Image URL:');
        if (url) ed.chain().focus().setImage({ src: url }).run();
      },
    },
  ];

  const filteredCommands = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(filter.toLowerCase()) ||
      c.description.toLowerCase().includes(filter.toLowerCase()) ||
      c.category.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex] && editor) {
          editor.chain().focus().deleteRange({
            from: Math.max(0, editor.state.selection.from - 1),
            to: editor.state.selection.from,
          }).run();
          filteredCommands[selectedIndex].action(editor);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, editor, onClose]);

  if (!isOpen || !editor) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${Math.min(window.innerHeight - 380, Math.max(70, position.top))}px`,
        left: `${Math.min(window.innerWidth - 340, Math.max(20, position.left))}px`,
      }}
      className="fixed z-50 w-80 max-h-96 overflow-y-auto rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl p-2 animate-in fade-in zoom-in-95"
    >
      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Insert Confluence Block
      </div>
      <div className="space-y-0.5">
        {filteredCommands.length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground text-center">No blocks match "{filter}"</div>
        ) : (
          filteredCommands.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => {
                editor.chain().focus().deleteRange({
                  from: Math.max(0, editor.state.selection.from - 1),
                  to: editor.state.selection.from,
                }).run();
                item.action(editor);
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                index === selectedIndex
                  ? 'bg-primary/15 text-foreground font-medium'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-background border border-border shrink-0 shadow-2xs">
                {item.icon}
              </div>
              <div className="truncate flex-1 min-w-0">
                <div className="font-semibold text-foreground text-xs">{item.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{item.description}</div>
              </div>
              <span className="text-[9px] font-mono text-muted-foreground/60 px-1 py-0.5 rounded bg-muted/40 shrink-0">
                {item.category.split(' ')[0]}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
