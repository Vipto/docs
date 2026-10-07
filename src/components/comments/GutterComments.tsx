import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, CornerDownRight, Trash2, Send, X, User } from 'lucide-react';
import { Comment } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { formatRelativeTime } from '@/utils/formatters';

interface GutterCommentsProps {
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  onResolveComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReply: (parentCommentId: string, content: string) => Promise<void>;
  onClose?: () => void;
}

export const GutterComments: React.FC<GutterCommentsProps> = ({
  comments,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  onResolveComment,
  onDeleteComment,
  onAddReply,
  onClose,
}) => {
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group inline comments
  const inlineRoots = comments.filter((c) => !c.parentId && c.content.startsWith('> "'));

  if (inlineRoots.length === 0) return null;

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onAddReply(parentId, replyText.trim());
      setReplyText('');
      setReplyingId(null);
    } catch (e) {
      console.error('Error replying:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-80 shrink-0 hidden 2xl:block space-y-3 pl-4 border-l border-border self-start sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
          <span>Inline Discussions ({inlineRoots.filter((c) => !c.isResolved).length})</span>
        </div>
      </div>

      <div className="space-y-3">
        {inlineRoots.map((root) => {
          const replies = comments.filter((c) => c.parentId === root.id);
          const quoteMatch = root.content.match(/^> "([\s\S]*?)"\n\n([\s\S]*)$/);
          const quotedSnippet = quoteMatch ? quoteMatch[1] : '';
          const commentBody = quoteMatch ? quoteMatch[2] : root.content;

          return (
            <div
              key={root.id}
              className={`p-3.5 rounded-2xl border transition-all text-xs gutter-comment-card ${
                root.isResolved
                  ? 'bg-muted/20 border-border opacity-60'
                  : 'bg-card border-border shadow-xs hover:border-primary/50'
              }`}
            >
              {/* Highlighted Quote Preview */}
              {quotedSnippet && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 italic mb-2 line-clamp-2">
                  "{quotedSnippet}"
                </div>
              )}

              {/* Author Row */}
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Avatar name={root.authorName} avatarUrl={root.authorAvatar} size="sm" className="w-5 h-5 text-[9px]" />
                  <div>
                    <span className="font-bold text-foreground text-xs">{root.authorName}</span>
                    <span className="text-[10px] text-muted-foreground block">
                      {formatRelativeTime(root.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onResolveComment(root)}
                    className={`p-1 rounded hover:bg-muted text-muted-foreground transition-colors ${
                      root.isResolved ? 'text-emerald-600' : 'hover:text-emerald-600'
                    }`}
                    title={root.isResolved ? 'Reopen' : 'Resolve'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  {root.authorId === currentUserId && (
                    <button
                      onClick={() => onDeleteComment(root.id)}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Main Body */}
              <p className="mt-2 text-foreground/90 whitespace-pre-wrap leading-relaxed">{commentBody}</p>

              {/* Thread Replies */}
              {replies.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-border space-y-2">
                  {replies.map((rep) => (
                    <div key={rep.id} className="p-2 bg-muted/30 rounded-xl">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">{rep.authorName}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {formatRelativeTime(rep.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-foreground/90 text-xs">{rep.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              {!root.isResolved && (
                <div className="mt-2.5 pt-2 border-t border-border">
                  {replyingId === root.id ? (
                    <div className="space-y-1.5">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="px-2 py-0.5 rounded text-[10px] text-muted-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={submitting || !replyText.trim()}
                          onClick={() => handleReply(root.id)}
                          className="px-2.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold hover:bg-primary/90 disabled:opacity-50"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingId(root.id)}
                      className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <CornerDownRight className="w-3 h-3" /> Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
