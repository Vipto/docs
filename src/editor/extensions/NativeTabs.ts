import { Node, mergeAttributes } from '@tiptap/react';

export const NativeTabs = Node.create({
  name: 'nativeTabs',
  group: 'block',
  content: 'tabItem+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div.vipto-tabs-container',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ class: 'vipto-tabs-container' }, HTMLAttributes), 0];
  },
});

export const TabItem = Node.create({
  name: 'tabItem',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      title: {
        default: 'Tab',
        parseHTML: (element) => element.getAttribute('data-tab-title') || 'Tab',
        renderHTML: (attributes) => ({
          'data-tab-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-tab-title]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes({ class: 'vipto-tab-panel border-t border-border p-4 bg-card' }, HTMLAttributes),
      0,
    ];
  },
});
