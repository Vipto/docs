import { Mark, mergeAttributes } from '@tiptap/react';

export interface InlineCommentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    inlineComment: {
      setInlineComment: (attributes: { commentId: string }) => ReturnType;
      unsetInlineComment: () => ReturnType;
    };
  }
}

export const InlineComment = Mark.create<InlineCommentOptions>({
  name: 'inlineComment',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) => {
          if (!attributes.commentId) return {};
          return {
            'data-comment-id': attributes.commentId,
            class: 'inline-comment-anchor',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'mark[data-comment-id]',
      },
      {
        tag: 'mark.inline-comment-anchor',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setInlineComment:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes);
        },
      unsetInlineComment:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
