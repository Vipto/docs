import { Node, mergeAttributes } from '@tiptap/react';

export interface DateLozengeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    dateLozenge: {
      setDateLozenge: (attributes: { timestamp?: string; label?: string }) => ReturnType;
    };
  }
}

export const DateLozenge = Node.create<DateLozengeOptions>({
  name: 'dateLozenge',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      timestamp: {
        default: new Date().toISOString().split('T')[0],
        parseHTML: (element) => element.getAttribute('data-date') || new Date().toISOString().split('T')[0],
        renderHTML: (attributes) => ({
          'data-date': attributes.timestamp,
        }),
      },
      label: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-label') || '',
        renderHTML: (attributes) => ({
          'data-label': attributes.label,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-date-lozenge]',
      },
      {
        tag: 'span.date-lozenge',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const rawDate = node.attrs.timestamp || new Date().toISOString().split('T')[0];
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-date-lozenge': 'true',
        class: 'date-lozenge inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground border border-border font-mono text-[11px] select-none mx-1 font-medium shadow-2xs',
      }),
      `📅 ${node.attrs.label ? `${node.attrs.label}: ` : ''}${rawDate}`,
    ];
  },

  addCommands() {
    return {
      setDateLozenge:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
