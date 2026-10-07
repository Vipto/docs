import { Node, mergeAttributes } from '@tiptap/react';

export interface ExpandOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    expand: {
      setExpand: (attributes?: { title?: string }) => ReturnType;
      toggleExpand: (attributes?: { title?: string }) => ReturnType;
    };
  }
}

export const Expand = Node.create<ExpandOptions>({
  name: 'expand',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: 'Click to expand / collapse details...',
        parseHTML: (element) => element.getAttribute('data-title') || 'Click to expand / collapse details...',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
      open: {
        default: true,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => (attributes.open ? { open: 'true' } : {}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details[data-expand]',
      },
      {
        tag: 'details.vipto-expand',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'vipto-expand my-4 rounded-xl border border-border bg-card shadow-2xs overflow-hidden',
        'data-expand': 'true',
      }),
      [
        'summary',
        {
          class: 'vipto-expand-summary font-semibold text-xs text-foreground bg-muted/30 px-4 py-2.5 cursor-pointer hover:bg-muted/60 select-none flex items-center gap-2 transition-colors border-b border-border/60',
        },
        node.attrs.title,
      ],
      ['div', { class: 'vipto-expand-body p-4 text-xs leading-relaxed space-y-2' }, 0],
    ];
  },

  addCommands() {
    return {
      setExpand:
        (attributes) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },
      toggleExpand:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', attributes);
        },
    };
  },
});
