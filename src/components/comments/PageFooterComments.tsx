import React, { useState, useRef } from 'react';
import { MessageSquare, Send, CheckCircle2, CornerDownRight, Trash2, AtSign, Smile } from 'lucide-react';
import { Comment, WorkspaceMember } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { formatRelativeTime } from '@/utils/formatters';

interface PageFooterCommentsProps {
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  members: WorkspaceMember[];
  onAddComment: (content: string, parentId?: string | null, mentions?: string[]) => Promise<void>;
  onResolveComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
}

export const PageFooterComments: React.FC<PageFooterCommentsProps> = ({
  comments,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  members,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);

  // Filter root page-level comments (not inline quote comments)
  const pageRootComments = comments.filter((c) => !c.parentId && !c.content.startsWith('> "'));

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCommentText(val);
    const lastWord = val.split(/\s+/).pop() || '';
    setShowMentionMenu(lastWord.startsWith('@'));
  };

  const handleInsertMention = (member: WorkspaceMember) => {
    const words = commentText.split(/\s+/);
    words.pop();
    words.push(`@${member.name}`);
    setCommentText(words.join(' ') + ' ');
    setShowMentionMenu(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const mentions = members
        .filter((m) => commentText.includes(`@${m.name}`))
        .map((m) => m.userId);
      await onAddComment(commentText.trim(), null, mentions);
      setCommentText('');
    } catch (e) {
      console.error('Submit comment error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(replyText.trim(), parentId);
      setReplyText('');
      setReplyingId(null);
    } catch (e) {
      console.error('Reply error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Comments & Discussion ({pageRootComments.length})
          </h3>
        </div>
      </div>

      {/* New Comment Composer Box */}
      <div className="relative">
        {showMentionMenu && (
          <div className="absolute bottom-full left-0 mb-2 p-1.5 rounded-xl border border-border bg-popover shadow-2xl z-20 text-xs max-h-48 overflow-y-auto w-64 animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 font-bold text-[10px] uppercase text-muted-foreground">
              Mention Teammate
            </div>
            {members.map((m) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => handleInsertMention(m)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-muted text-foreground text-left"
              >
                <Avatar name={m.name} avatarUrl={m.avatar} size="sm" className="w-5 h-5 text-[9px]" />
                <span className="font-medium truncate">{m.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{m.role}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar name={currentUserName} avatarUrl={currentUserAvatar} size="md" />
            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                value={commentText}
                onChange={handleTextChange}
                placeholder="Write a comment... (Type @ to mention team members)"
                className="w-full p-3 rounded-2xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <AtSign className="w-3.5 h-3.5 text-primary" />
                  <span>Supports @mentions</span>
                </div>
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Post Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Root Comments List */}
      <div className="space-y-4 pt-2">
        {pageRootComments.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
            No comments on this document yet. Start the conversation!
          </div>
        ) : (
          pageRootComments.map((root) => {
            const replies = comments.filter((c) => c.parentId === root.id);
            return (
              <div
                key={root.id}
                className={`p-4 rounded-2xl border transition-all ${
                  root.isResolved
                    ? 'bg-muted/20 border-border opacity-70'
                    : 'bg-background border-border shadow-2xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={root.authorName} avatarUrl={root.authorAvatar} size="sm" />
                    <div>
                      <span className="font-bold text-xs text-foreground">{root.authorName}</span>
                      <span className="text-[10px] text-muted-foreground block">
                        {formatRelativeTime(root.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onResolveComment(root)}
                      className={`px-2 py-0.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                        root.isResolved
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                          : 'text-muted-foreground hover:text-emerald-600 hover:bg-muted'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-[10px]">{root.isResolved ? 'Resolved' : 'Resolve'}</span>
                    </button>

                    {currentUserId === root.authorId && (
                      <button
                        onClick={() => onDeleteComment(root.id)}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body */}
                <p className="mt-2 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed pl-8">
                  {root.content}
                </p>

                {/* Threaded Replies */}
                {replies.length > 0 && (
                  <div className="mt-3 pl-8 space-y-2">
                    {replies.map((reply) => (
                      <div key={reply.id} className="p-3 bg-muted/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Avatar name={reply.authorName} avatarUrl={reply.authorAvatar} size="sm" className="w-5 h-5 text-[9px]" />
                            <span className="font-bold text-foreground">{reply.authorName}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-foreground/90 pl-7 leading-relaxed">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply CTA */}
                {!root.isResolved && (
                  <div className="mt-3 pt-2 pl-8 border-t border-border/60">
                    {replyingId === root.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs outline-none focus:ring-1 focus:ring-primary resize-none"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={submitting || !replyText.trim()}
                            onClick={() => handleReplySubmit(root.id)}
                            className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingId(root.id)}
                        className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" /> Reply to thread
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
