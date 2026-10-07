import { Node, mergeAttributes } from '@tiptap/react';

export const ColumnLayout = Node.create({
  name: 'columnLayout',
  group: 'block',
  content: 'columnCell+',
  defining: true,

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => parseInt(element.getAttribute('data-columns') || '2', 10),
        renderHTML: (attributes) => ({
          'data-columns': attributes.columns,
          class: attributes.columns === 3 ? 'vipto-columns-3' : 'vipto-columns-2',
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-columns]',
      },
      {
        tag: 'div.vipto-columns-2',
        getAttrs: () => ({ columns: 2 }),
      },
      {
        tag: 'div.vipto-columns-3',
        getAttrs: () => ({ columns: 3 }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

export const ColumnCell = Node.create({
  name: 'columnCell',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.vipto-column-cell',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'vipto-column-cell' }, HTMLAttributes), 0];
  },
});
