// Vipto Docs - Central Type Definitions

export type UserRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  joinedAt: string;
}

export interface Space {
  id: string;
  workspaceId: string;
  name: string;
  key: string; // e.g. "ENG", "PROD", "DSGN"
  description: string;
  icon: string; // emoji or lucide icon name
  coverImage?: string;
  ownerId: string;
  ownerName: string;
  isPrivate?: boolean;
  pageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PageRestrictions {
  level?: 'open' | 'edit_restricted' | 'private';
  lockType?: 'open' | 'edit_restricted' | 'private';
  allowedEditors: string[]; // userIds
  allowedViewers: string[]; // userIds
}

export interface PageReaction {
  emoji: string;
  count: number;
  users: Array<{ userId: string; name: string }>;
}

export interface PresenceUser {
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  status: 'editing' | 'viewing';
  activeSection?: string;
  lastActive: string;
}

export interface Page {
  id: string;
  workspaceId: string;
  spaceId: string;
  parentId: string | null; // null for top-level pages
  title: string;
  slug: string;
  icon?: string;
  coverImage?: string;
  coverUrl?: string;
  content: string; // HTML or TipTap JSON string
  excerpt?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  lastModifiedById: string;
  lastModifiedByName: string;
  order: number; // for manual ordering in tree
  version: number;
  isFavorite?: boolean;
  isArchived?: boolean;
  isLocked?: boolean;
  restrictions?: PageRestrictions;
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  fullWidth?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PageVersion {
  id: string;
  pageId: string;
  versionNumber: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  changeSummary?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  pageId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  isResolved: boolean;
  resolvedById?: string;
  resolvedByName?: string;
  resolvedAt?: string;
  parentId?: string | null; // null for top-level comment, id for replies
  mentions?: string[]; // userIds
  reactions?: Record<string, string[]>; // emoji -> array of userIds
  inlineAnchorId?: string; // id of highlighted mark
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  pageId: string;
  fileName: string;
  fileSize: number; // bytes
  fileType: string;
  downloadUrl: string;
  storagePath: string;
  uploadedById: string;
  uploadedByName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  pageId?: string;
  spaceId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  type: 'mention' | 'comment' | 'page_update' | 'permission_change' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  action:
    | 'PAGE_CREATED'
    | 'PAGE_UPDATED'
    | 'PAGE_DELETED'
    | 'PAGE_RESTORED'
    | 'SPACE_CREATED'
    | 'SPACE_UPDATED'
    | 'SPACE_DELETED'
    | 'MEMBER_ADDED'
    | 'MEMBER_REMOVED'
    | 'PERMISSION_CHANGED'
    | 'RESTRICTIONS_UPDATED';
  entityType: 'page' | 'space' | 'workspace' | 'member';
  entityId: string;
  entityTitle: string;
  details?: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  spaceId: string;
  spaceName: string;
  spaceKey: string;
  snippet: string;
  type: 'page' | 'space' | 'attachment';
  authorName: string;
  updatedAt: string;
  matchScore?: number;
}

export interface PageTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'General' | 'Engineering' | 'Product' | 'Operations' | 'Design' | 'Custom';
  content: string;
  isCustom?: boolean;
  authorName?: string;
}

export interface BreadcrumbItem {
  id?: string;
  title: string;
  link?: string;
  isCurrent?: boolean;
}

export interface TableOfContentsItem {
  id: string;
  text: string;
  level: number; // 1, 2, 3 for h1, h2, h3
}

