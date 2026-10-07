import { Node, mergeAttributes } from '@tiptap/react';

export const PageProperties = Node.create({
  name: 'pageProperties',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.vipto-properties-card',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ class: 'vipto-properties-card' }, HTMLAttributes),
      ['div', { class: 'vipto-properties-header' }, '📋 Page Properties & Metadata'],
      ['div', { class: 'p-4 bg-card' }, 0],
    ];
  },
});
