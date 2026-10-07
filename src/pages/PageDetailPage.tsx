import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useOutletContext, Link, useSearchParams } from 'react-router-dom';
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  File,
  Plus,
  Eye,
  Edit3,
  Search,
  Lock,
  BookmarkPlus,
} from 'lucide-react';
import {
  Page,
  Space,
  BreadcrumbItem,
  TableOfContentsItem,
  Attachment,
  PageRestrictions,
  PresenceUser,
  PageTemplate,
  Comment,
  WorkspaceMember,
} from '@/types';
import { getPage, updatePage, getPagesBySpace, getBreadcrumbs, createPage, duplicatePage, deletePage } from '@/services/pageService';
import { getSpaceByKey, getSpace } from '@/services/spaceService';
import { toggleFavorite, isPageFavorite } from '@/services/favoriteService';
import { trackRecentPage } from '@/services/recentService';
import { getComments, addComment, resolveComment, deleteComment } from '@/services/commentService';
import { getWorkspaceMembers } from '@/services/workspaceService';
import { uploadAttachment, getAttachments, deleteAttachment } from '@/services/attachmentService';
import { subscribeToPresence, broadcastPresence, broadcastStatus, removePresence } from '@/services/presenceService';
import { DocumentEditor } from '@/editor/Editor';
import { PageHeader } from '@/components/pages/PageHeader';
import { PageCover } from '@/components/pages/PageCover';
import { CommentsPanel } from '@/components/comments/CommentsPanel';
import { PageFooterComments } from '@/components/comments/PageFooterComments';
import { PageVersionsDrawer } from '@/components/pages/PageVersionsDrawer';
import { PageRestrictionsModal } from '@/components/pages/PageRestrictionsModal';
import { AttachmentPreviewModal } from '@/components/pages/AttachmentPreviewModal';
import { CreateTemplateModal } from '@/components/templates/CreateTemplateModal';
import { saveCustomTemplate } from '@/components/templates/templateDefinitions';
import { ShareModal } from '@/components/pages/ShareModal';
import { ExportModal } from '@/components/pages/ExportModal';
import { MovePageModal } from '@/components/pages/MovePageModal';
import { PageSkeleton } from '@/components/common/SkeletonLoader';
import { useAuth } from '@/hooks/useAuth';
import { canEditPage } from '@/permissions/roles';
import { formatFileSize, formatDate } from '@/utils/formatters';

export const PageDetailPage: React.FC = () => {
  const { spaceKey, pageId } = useParams<{ spaceKey: string; pageId: string }>();
  const [searchParams] = useSearchParams();
  const shouldAutoFocus = searchParams.get('focus') === 'editor';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { spaces, refreshSpaces } = useOutletContext<{ spaces: Space[]; refreshSpaces: () => void }>();

  const [page, setPage] = useState<Page | null>(null);
  const [space, setSpace] = useState<Space | null>(null);
  const [spacePages, setSpacePages] = useState<Page[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [pageComments, setPageComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [collaborators, setCollaborators] = useState<PresenceUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [previewOnly, setPreviewOnly] = useState(false);

  // Modals / Panels
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeQuotedText, setActiveQuotedText] = useState<string | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [restrictionsOpen, setRestrictionsOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autosaveTimeoutRef = useRef<any>(null);

  // Fetch Page Data
  const loadPageData = async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const pageData = await getPage(pageId);
      if (!pageData) {
        setPage(null);
        setLoading(false);
        return;
      }
      setPage(pageData);
      if (pageData.fullWidth !== undefined) {
        setIsFullWidth(pageData.fullWidth);
      }

      // Load space
      let foundSpace = spaces.find((s) => s.id === pageData.spaceId || s.key === spaceKey);
      if (!foundSpace) {
        foundSpace = (await getSpace(pageData.spaceId)) || undefined;
      }
      setSpace(foundSpace || null);

      // Load breadcrumbs
      const crumbs = await getBreadcrumbs(pageData, foundSpace);
      setBreadcrumbs(crumbs);

      // Load sibling pages for tree
      if (foundSpace) {
        const pagesInSpace = await getPagesBySpace(foundSpace.id);
        setSpacePages(pagesInSpace);
      }

      // Track recent page visit
      if (user) {
        trackRecentPage(user.uid, pageData);
        isPageFavorite(user.uid, pageData.id).then(setIsFavorite);
      }

      // Load attachments & workspace members
      getAttachments(pageData.id).then(setAttachments);
      getWorkspaceMembers().then(setMembers);

      // Load comments
      const comments = await getComments(pageData.id);
      setPageComments(comments);
      setCommentsCount(comments.filter((item) => !item.isResolved).length);
    } catch (e) {
      console.error('Error loading page:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [pageId, spaceKey, user?.uid]);

  // Subscribe to real-time multiplayer presence
  useEffect(() => {
    if (!pageId || !user) return;

    broadcastPresence(pageId, {
      userId: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: 'viewing',
    });

    const unsubscribe = subscribeToPresence(pageId, (activeUsers: PresenceUser[]) => {
      setCollaborators(activeUsers);
    });

    return () => {
      unsubscribe();
      removePresence(pageId, user.uid);
    };
  }, [pageId, user?.uid]);

  // Debounced Auto-save handler
  const handleEditorContentChange = useCallback(
    (newContent: string, isManual: boolean = false) => {
      if (!page || !user || !canEditPage(user.role)) return;

      if (newContent === page.content) return;

      // Broadcast active editing presence
      broadcastStatus(page.id, user.uid, 'editing');

      setSaveStatus('unsaved');
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      const saveAction = async () => {
        setSaveStatus('saving');
        try {
          await updatePage(
            page.id,
            { content: newContent },
            user.uid,
            user.name,
            false // don't create full version on every autosave keystroke
          );
          setPage((prev) => (prev ? { ...prev, content: newContent, updatedAt: new Date().toISOString() } : null));
          setSaveStatus('saved');
          broadcastStatus(page.id, user.uid, 'viewing');
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveStatus('unsaved');
        }
      };

      if (isManual) {
        saveAction();
      } else {
        autosaveTimeoutRef.current = setTimeout(saveAction, 1200); // 1.2s debounce
      }
    },
    [page, user]
  );

  const handleTitleChange = async (newTitle: string) => {
    if (!page || !user || !canEditPage(user.role)) return;
    setPage((prev) => (prev ? { ...prev, title: newTitle } : null));

    try {
      await updatePage(page.id, { title: newTitle }, user.uid, user.name);
      if (space) {
        getPagesBySpace(space.id).then(setSpacePages);
      }
    } catch (e) {
      console.error('Title update error:', e);
    }
  };

  const handleIconChange = async (newIcon: string) => {
    if (!page || !user || !canEditPage(user.role)) return;
    setPage((prev) => (prev ? { ...prev, icon: newIcon } : null));

    try {
      await updatePage(page.id, { icon: newIcon }, user.uid, user.name);
      if (space) {
        getPagesBySpace(space.id).then(setSpacePages);
      }
    } catch (e) {
      console.error('Icon update error:', e);
    }
  };

  const handleCoverChange = async (coverUrl: string | undefined) => {
    if (!page || !user || !canEditPage(user.role)) return;
    setPage((prev) => (prev ? { ...prev, coverUrl, coverImage: coverUrl } : null));

    try {
      await updatePage(page.id, { coverUrl, coverImage: coverUrl }, user.uid, user.name);
    } catch (e) {
      console.error('Cover update error:', e);
    }
  };

  const handleToggleFullWidth = async () => {
    if (!page || !user) return;
    const nextVal = !isFullWidth;
    setIsFullWidth(nextVal);
    setPage((prev) => (prev ? { ...prev, fullWidth: nextVal } : null));

    try {
      await updatePage(page.id, { fullWidth: nextVal }, user.uid, user.name);
    } catch (e) {
      console.error('Full width update error:', e);
    }
  };

  const handleToggleReaction = async (emoji: string) => {
    if (!page || !user) return;

    const currentReactions = page.reactions || {};
    const existingUsers = currentReactions[emoji] || [];
    let updatedUsers: string[];

    if (existingUsers.includes(user.uid)) {
      updatedUsers = existingUsers.filter((id) => id !== user.uid);
    } else {
      updatedUsers = [...existingUsers, user.uid];
    }

    const updatedReactions = {
      ...currentReactions,
      [emoji]: updatedUsers,
    };

    setPage((prev) => (prev ? { ...prev, reactions: updatedReactions } : null));

    try {
      await updatePage(page.id, { reactions: updatedReactions }, user.uid, user.name);
    } catch (e) {
      console.error('Reaction toggle error:', e);
    }
  };

  const handleSaveRestrictions = async (newRestrictions: PageRestrictions) => {
    if (!page || !user) return;
    setPage((prev) => (prev ? { ...prev, restrictions: newRestrictions } : null));

    try {
      await updatePage(page.id, { restrictions: newRestrictions }, user.uid, user.name);
    } catch (e) {
      console.error('Restrictions update error:', e);
    }
  };

  const handleSaveAsTemplate = (newTemplate: PageTemplate) => {
    saveCustomTemplate(newTemplate);
    alert(`Template "${newTemplate.title}" saved to workspace blueprints!`);
  };

  const handleAddFooterComment = async (content: string, parentId?: string | null, mentions?: string[]) => {
    if (!page || !user) return;
    const added = await addComment(
      page.id,
      {
        content,
        authorId: user.uid,
        authorName: user.name,
        authorAvatar: user.avatar,
        parentId: parentId || null,
        mentions: mentions || [],
      },
      page.title
    );
    setPageComments((prev) => [...prev, added]);
    setCommentsCount((prev) => prev + 1);
  };

  const handleResolveFooterComment = async (comment: Comment) => {
    if (!page || !user) return;
    await resolveComment(page.id, comment.id, user.uid, user.name, !comment.isResolved);
    setPageComments((prev) =>
      prev.map((c) => (c.id === comment.id ? { ...c, isResolved: !comment.isResolved } : c))
    );
    setCommentsCount((prev) => (comment.isResolved ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleDeleteFooterComment = async (commentId: string) => {
    if (!page) return;
    await deleteComment(page.id, commentId);
    setPageComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
  };

  const handleToggleFavorite = async () => {
    if (!page || !user) return;
    const newState = await toggleFavorite(user.uid, page);
    setIsFavorite(newState);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !page || !user) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadAttachment(page.id, file, user.uid, user.name);
      setAttachments((prev) => [...prev, uploaded]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (att: Attachment) => {
    if (!window.confirm(`Delete ${att.fileName}?`)) return;
    try {
      await deleteAttachment(att.pageId, att.id, att.storagePath);
      setAttachments((prev) => prev.filter((a) => a.id !== att.id));
    } catch (err) {
      console.error('Delete attachment error:', err);
    }
  };

  const handleCreateChildPage = async (parentId?: string | null) => {
    if (!space || !user) return;
    try {
      const created = await createPage({
        workspaceId: space.workspaceId,
        spaceId: space.id,
        parentId: parentId !== undefined ? parentId : page?.id || null,
        title: 'Untitled Document',
        authorId: user.uid,
        authorName: user.name,
      });
      refreshSpaces?.();
      navigate(`/spaces/${space.key}/${created.id}`);
    } catch (e) {
      console.error('Create child page error:', e);
    }
  };

  const handleDuplicate = async () => {
    if (!page || !user || !space) return;
    try {
      const dup = await duplicatePage(page.id, user.uid, user.name);
      refreshSpaces?.();
      navigate(`/spaces/${space.key}/${dup.id}`);
    } catch (e) {
      console.error('Duplicate error:', e);
    }
  };

  const handleDeleteCurrentPage = async () => {
    if (!page || !user || !space) return;
    if (!window.confirm(`Are you sure you want to delete "${page.title}"?`)) return;
    try {
      await deletePage(page.id, user.uid, user.name);
      refreshSpaces?.();
      navigate(`/spaces/${space.key}`);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleInlineComment = (selectedText: string) => {
    setActiveQuotedText(selectedText);
    setCommentsOpen(true);
  };

  const handleRenamePageInTree = async (targetId: string, newTitle: string) => {
    if (!user) return;
    try {
      await updatePage(targetId, { title: newTitle }, user.uid, user.name);
      if (targetId === page?.id) {
        setPage((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
      if (space) {
        getPagesBySpace(space.id).then(setSpacePages);
      }
    } catch (e) {
      console.error('Tree rename error:', e);
    }
  };

  const handleReorderPage = async (draggedId: string, targetId: string) => {
    if (!user || !space) return;
    try {
      // Reparent dragged page inside target
      await updatePage(draggedId, { parentId: targetId }, user.uid, user.name);
      getPagesBySpace(space.id).then(setSpacePages);
    } catch (e) {
      console.error('Reorder tree error:', e);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <PageSkeleton />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-16 text-center text-muted-foreground">
        <File className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <h2 className="text-xl font-bold text-foreground">Document Not Found</h2>
        <p className="text-xs text-muted-foreground mt-1">This page may have been moved or deleted.</p>
        <Link to="/" className="mt-4 inline-block text-xs text-primary font-semibold hover:underline">
          Return to Workspace Home
        </Link>
      </div>
    );
  }

  const userRole = user?.role || 'Viewer';
  const isOwnerOrAdmin = userRole === 'Owner' || userRole === 'Admin';
  const isAuthor = page.authorId === user?.uid;

  // Granular Confluence Access Restrictions Logic
  const restrictionLevel = page.restrictions?.lockType || page.restrictions?.level || 'open';
  const isStrictPrivate = restrictionLevel === 'private';
  const isEditRestricted = restrictionLevel === 'edit_restricted';

  const hasViewPermission =
    !isStrictPrivate ||
    isOwnerOrAdmin ||
    isAuthor ||
    (page.restrictions?.allowedViewers || []).includes(user?.uid || '') ||
    (page.restrictions?.allowedEditors || []).includes(user?.uid || '');

  const hasEditPermission =
    canEditPage(userRole) &&
    !previewOnly &&
    (!isEditRestricted ||
      isOwnerOrAdmin ||
      isAuthor ||
      (page.restrictions?.allowedEditors || []).includes(user?.uid || ''));

  if (!hasViewPermission) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-8">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Access Restricted</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This document has been locked with page-level restrictions by its author (
            <span className="font-semibold text-foreground">{page.authorName}</span>). Only designated collaborators can view this content.
          </p>
          <div className="pt-2">
            <Link
              to={`/spaces/${space?.key || page.spaceId}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-md"
            >
              Back to Space
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden w-full">
      {/* Main Document Body */}
      <div className="flex-1 overflow-y-auto pb-16 w-full">
        {/* Full-width header cover banner */}
        <PageCover
          coverUrl={page.coverUrl || page.coverImage}
          readOnly={!hasEditPermission}
          onUpdateCover={handleCoverChange}
          onRemoveCover={() => handleCoverChange(undefined)}
        />

        <div className={`px-4 sm:px-8 lg:px-12 py-8 transition-all duration-300 ${isFullWidth ? 'max-w-[96%] mx-auto' : 'max-w-4xl mx-auto'} space-y-8`}>
          {/* Page Header (Title, Icon, Breadcrumbs, Actions, Padlock, Reactions) */}
          <PageHeader
            page={page}
            space={space}
            breadcrumbs={breadcrumbs}
            userRole={userRole}
            currentUserId={user?.uid || ''}
            currentUserName={user?.name || 'Ayush'}
            isFavorite={isFavorite}
            commentsCount={commentsCount}
            collaborators={collaborators}
            isFullWidth={isFullWidth}
            onToggleFullWidth={handleToggleFullWidth}
            onToggleFavorite={handleToggleFavorite}
            onOpenShare={() => setShareOpen(true)}
            onOpenComments={() => {
              setActiveQuotedText(undefined);
              setCommentsOpen(true);
            }}
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenExport={() => setExportOpen(true)}
            onOpenMove={() => setMoveOpen(true)}
            onOpenRestrictions={() => setRestrictionsOpen(true)}
            onToggleReaction={handleToggleReaction}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteCurrentPage}
            onTitleChange={handleTitleChange}
            onIconChange={handleIconChange}
            readOnly={!hasEditPermission}
          />

          {/* Block Editor */}
          <DocumentEditor
            initialContent={page.content}
            readOnly={!hasEditPermission}
            autoFocus={shouldAutoFocus}
            onSave={handleEditorContentChange}
            onTocChange={setTocItems}
            onAddInlineComment={handleInlineComment}
            saveStatus={saveStatus}
            lastSavedAt={page.updatedAt}
          />

          {/* In-Canvas Page Footer Comments Section */}
          <PageFooterComments
            comments={pageComments}
            currentUserId={user?.uid || ''}
            currentUserName={user?.name || 'Ayush'}
            currentUserAvatar={user?.avatar}
            members={members}
            onAddComment={handleAddFooterComment}
            onResolveComment={handleResolveFooterComment}
            onDeleteComment={handleDeleteFooterComment}
          />

          {/* Attachments & Files Section */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Attachments & Files ({attachments.length})
                </h3>
              </div>

              {canEditPage(userRole) && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              )}
            </div>

            {attachments.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                No files attached to this page. You can upload PDFs, images, DOCX, and spreadsheets.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-background hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={() => setPreviewAttachment(att)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                        <File className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-xs text-foreground group-hover:text-primary truncate block">
                          {att.fileName}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatFileSize(att.fileSize)} &bull; Click to preview
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={att.downloadUrl}
                        download={att.fileName}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      {canEditPage(userRole) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-muted"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save as Template CTA banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <BookmarkPlus className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xs font-bold text-foreground">Save as Workspace Template</div>
                <div className="text-[11px] text-muted-foreground">
                  Turn this document structure into a reusable blueprint for squad members.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCreateTemplateOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-2xs shrink-0"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Comments Panel */}
      <CommentsPanel
        page={page}
        isOpen={commentsOpen}
        quotedText={activeQuotedText}
        onClearQuotedText={() => setActiveQuotedText(undefined)}
        onClose={() => {
          setCommentsOpen(false);
          setActiveQuotedText(undefined);
          getComments(page.id).then((c) => {
            setPageComments(c);
            setCommentsCount(c.filter((item) => !item.isResolved).length);
          });
        }}
      />

      {/* Page Version History Drawer */}
      <PageVersionsDrawer
        page={page}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onVersionRestored={loadPageData}
      />

      {/* Page Restrictions Padlock Modal */}
      {page && (
        <PageRestrictionsModal
          isOpen={restrictionsOpen}
          onClose={() => setRestrictionsOpen(false)}
          page={page}
          members={members}
          onSaveRestrictions={handleSaveRestrictions}
        />
      )}

      {/* Attachment In-App Lightbox Modal */}
      <AttachmentPreviewModal
        attachment={previewAttachment}
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
      />

      {/* Custom Template Creator Modal */}
      {page && (
        <CreateTemplateModal
          isOpen={createTemplateOpen}
          onClose={() => setCreateTemplateOpen(false)}
          initialTitle={page.title}
          initialContent={page.content}
          onSaveTemplate={handleSaveAsTemplate}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        page={page}
        space={space}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        page={page}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />

      {/* Move Page Modal */}
      <MovePageModal
        page={page}
        spaces={spaces}
        allPages={spacePages}
        isOpen={moveOpen}
        onClose={() => setMoveOpen(false)}
        onPageMoved={loadPageData}
      />
    </div>
  );
};


