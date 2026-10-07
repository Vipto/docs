import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  CornerDownRight,
  Trash2,
  AtSign,
  Filter,
  Quote,
  Sparkles,
} from 'lucide-react';
import { Comment, Page, WorkspaceMember } from '@/types';
import { addComment, resolveComment, deleteComment, getComments } from '@/services/commentService';
import { getWorkspaceMembers } from '@/services/workspaceService';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/common/Avatar';
import { formatDate, formatRelativeTime } from '@/utils/formatters';

interface CommentsPanelProps {
  page: Page;
  isOpen: boolean;
  onClose: () => void;
  quotedText?: string;
  onClearQuotedText?: () => void;
}

export const CommentsPanel: React.FC<CommentsPanelProps> = ({
  page,
  isOpen,
  onClose,
  quotedText,
  onClearQuotedText,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterType, setFilterType] = useState<'open' | 'inline' | 'resolved' | 'all'>('open');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    try {
      const items = await getComments(page.id);
      setComments(items);
    } catch (e) {
      console.warn('Error fetching comments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchComments();
      getWorkspaceMembers().then(setMembers);
      if (quotedText) {
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    }
  }, [page.id, isOpen, quotedText]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewCommentText(val);

    const lastWord = val.split(/\s+/).pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  const handleInsertMention = (member: WorkspaceMember) => {
    const words = newCommentText.split(/\s+/);
    words.pop();
    words.push(`@${member.name}`);
    setNewCommentText(words.join(' ') + ' ');
    setShowMentionMenu(false);
    textareaRef.current?.focus();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;

    setSubmitting(true);
    try {
      const content = quotedText
        ? `> "${quotedText}"\n\n${newCommentText.trim()}`
        : newCommentText.trim();

      const mentions = members
        .filter((m) => content.includes(`@${m.name}`))
        .map((m) => m.userId);

      const created = await addComment(
        page.id,
        {
          content,
          authorId: user.uid,
          authorName: user.name,
          authorAvatar: user.avatar,
          parentId: null,
          mentions,
        },
        page.title
      );

      setComments((prev) => [...prev, created]);
      setNewCommentText('');
      onClearQuotedText?.();
    } catch (e) {
      console.error('Error adding comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !user) return;
    setSubmitting(true);
    try {
      const created = await addComment(
        page.id,
        {
          content: replyText.trim(),
          authorId: user.uid,
          authorName: user.name,
          authorAvatar: user.avatar,
          parentId: parentCommentId,
        },
        page.title
      );

      setComments((prev) => [...prev, created]);
      setReplyText('');
      setReplyingToId(null);
    } catch (e) {
      console.error('Error replying to comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleResolve = async (comment: Comment) => {
    if (!user) return;
    const newResolved = !comment.isResolved;
    await resolveComment(page.id, comment.id, user.uid, user.name, newResolved);
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? {
              ...c,
              isResolved: newResolved,
              resolvedById: newResolved ? user.uid : undefined,
              resolvedByName: newResolved ? user.name : undefined,
              resolvedAt: newResolved ? new Date().toISOString() : undefined,
            }
          : c
      )
    );
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    await deleteComment(page.id, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
  };

  // Group into threads
  const rootComments = comments.filter((c) => !c.parentId);

  const filteredRootComments = rootComments.filter((c) => {
    if (filterType === 'open') return !c.isResolved;
    if (filterType === 'inline') return !c.isResolved && c.content.startsWith('> "');
    if (filterType === 'resolved') return c.isResolved;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Unified Comments</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
              {rootComments.filter((c) => !c.isResolved).length} open
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Close Panel (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card text-xs">
          <span className="text-muted-foreground text-[11px] font-medium">Filter:</span>
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl">
            <button
              onClick={() => setFilterType('open')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filterType === 'open'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterType('inline')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filterType === 'inline'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Inline
            </button>
            <button
              onClick={() => setFilterType('resolved')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filterType === 'resolved'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-background text-foreground shadow-xs font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Quoted Text Selection Banner (if user highlighted text in editor) */}
        {quotedText && (
          <div className="p-3 bg-amber-500/10 border-b border-amber-500/20 text-xs flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Quote className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-semibold text-amber-700 dark:text-amber-300 block text-[11px]">
                  Inline selection anchor:
                </span>
                <p className="text-muted-foreground italic line-clamp-2">"{quotedText}"</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearQuotedText}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              &times;
            </button>
          </div>
        )}

        {/* Comments Thread List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
              <div className="h-20 bg-muted/50 rounded-2xl animate-pulse" />
            </div>
          ) : filteredRootComments.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold text-foreground">No {filterType !== 'all' ? filterType : ''} comments</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Highlight any text on the page to leave an inline comment, or write below.
              </p>
            </div>
          ) : (
            filteredRootComments.map((root) => {
              const replies = comments.filter((c) => c.parentId === root.id);
              const isInline = root.content.startsWith('> "');
              return (
                <div
                  key={root.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    root.isResolved
                      ? 'bg-muted/20 border-border opacity-70'
                      : 'bg-card border-border shadow-xs'
                  }`}
                >
                  {/* Root Comment Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={root.authorName} avatarUrl={root.authorAvatar} size="sm" />
                      <div>
                        <span className="text-xs font-bold text-foreground">{root.authorName}</span>
                        <span className="text-[10px] text-muted-foreground block">
                          {formatRelativeTime(root.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleResolve(root)}
                        className={`px-2 py-0.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
                          root.isResolved
                            ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 font-semibold'
                            : 'text-muted-foreground hover:text-emerald-600 hover:bg-muted'
                        }`}
                        title={root.isResolved ? 'Reopen comment' : 'Resolve thread'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{root.isResolved ? 'Resolved' : 'Resolve'}</span>
                      </button>

                      {user?.uid === root.authorId && (
                        <button
                          onClick={() => handleDelete(root.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="mt-2 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {root.content}
                  </div>

                  {/* Resolved Info Pill */}
                  {root.isResolved && root.resolvedByName && (
                    <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                      Resolved by {root.resolvedByName}
                    </div>
                  )}

                  {/* Replies List */}
                  {replies.length > 0 && (
                    <div className="mt-3 pl-3 border-l-2 border-primary/30 space-y-2.5">
                      {replies.map((reply) => (
                        <div key={reply.id} className="text-xs bg-muted/20 p-2.5 rounded-xl">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <Avatar name={reply.authorName} avatarUrl={reply.authorAvatar} size="sm" className="w-5 h-5 text-[9px]" />
                              <span className="font-bold text-foreground text-[11px]">{reply.authorName}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-foreground/90 pl-7 leading-relaxed">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Action */}
                  {!root.isResolved && (
                    <div className="mt-3 pt-2 border-t border-border">
                      {replyingToId === root.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyText('');
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] text-muted-foreground hover:bg-muted"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={submitting || !replyText.trim()}
                              onClick={() => handleAddReply(root.id)}
                              className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-bold hover:bg-primary/90 disabled:opacity-50"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingToId(root.id)}
                          className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" /> Reply to thread
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* New Comment Textarea & Mentions Popover */}
        <div className="p-4 border-t border-border bg-muted/20 relative">
          {showMentionMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 p-1.5 rounded-xl border border-border bg-popover shadow-2xl z-20 text-xs max-h-48 overflow-y-auto animate-in fade-in zoom-in-95">
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

          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={newCommentText}
              onChange={handleTextChange}
              placeholder="Write a comment... (Type @ to mention team members)"
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary outline-none resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <AtSign className="w-3.5 h-3.5 text-primary" />
                <span>Mentions supported</span>
              </div>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Post Comment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
