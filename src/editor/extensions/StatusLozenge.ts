import { Node, mergeAttributes } from '@tiptap/react';

export type StatusColor = 'grey' | 'blue' | 'yellow' | 'green' | 'red' | 'purple';

export interface StatusLozengeOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    statusLozenge: {
      setStatusLozenge: (attributes: { text: string; color?: StatusColor }) => ReturnType;
    };
  }
}

export const StatusLozenge = Node.create<StatusLozengeOptions>({
  name: 'statusLozenge',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      text: {
        default: 'IN PROGRESS',
        parseHTML: (element) => element.getAttribute('data-status-text') || element.textContent || 'STATUS',
        renderHTML: (attributes) => ({
          'data-status-text': attributes.text,
        }),
      },
      color: {
        default: 'blue',
        parseHTML: (element) => element.getAttribute('data-status-color') || 'blue',
        renderHTML: (attributes) => ({
          'data-status-color': attributes.color,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-status-lozenge]',
      },
      {
        tag: 'span.status-lozenge',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const color = node.attrs.color || 'blue';
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-status-lozenge': 'true',
        class: `status-lozenge status-lozenge-${color} inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase tracking-wider select-none mx-1 transition-all shadow-2xs`,
      }),
      node.attrs.text,
    ];
  },

  addCommands() {
    return {
      setStatusLozenge:
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
