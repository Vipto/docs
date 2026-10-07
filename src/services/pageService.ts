import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Page, BreadcrumbItem, Space } from '@/types';
import { slugify, extractTextFromHtml } from '@/utils/formatters';
import { createPageVersion } from './historyService';
import { logAuditEvent } from './auditService';
import { getLocalPages, saveLocalPages, getLocalSpaces } from './seedService';

const COLLECTION = 'pages';

export async function createPage(pageData: Partial<Page> & { title: string; spaceId: string; authorId: string; authorName: string }): Promise<Page> {
  const newDocRef = doc(collection(db, COLLECTION));
  const now = new Date().toISOString();
  const slug = slugify(pageData.title || 'untitled-page');

  const allPages = getLocalPages();
  const siblingCount = allPages.filter(p => p.spaceId === pageData.spaceId && p.parentId === (pageData.parentId || null)).length;

  const newPage: Page = {
    id: newDocRef.id,
    workspaceId: pageData.workspaceId || 'vipto-workspace',
    spaceId: pageData.spaceId,
    parentId: pageData.parentId || null,
    title: pageData.title || 'Untitled Page',
    slug: slug,
    icon: pageData.icon || 'file',
    coverImage: pageData.coverImage || '',
    content: pageData.content || '<p>Start typing here, or use <code>/</code> for commands...</p>',
    excerpt: extractTextFromHtml(pageData.content || '').substring(0, 160),
    authorId: pageData.authorId,
    authorName: pageData.authorName,
    authorAvatar: pageData.authorAvatar || '',
    lastModifiedById: pageData.authorId,
    lastModifiedByName: pageData.authorName,
    order: siblingCount,
    version: 1,
    isFavorite: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newPage);
  } catch (e) {
    console.warn('Firestore createPage notice:', e);
  }

  allPages.push(newPage);
  saveLocalPages(allPages);

  // Version 1
  try {
    await createPageVersion(newPage.id, {
      versionNumber: 1,
      title: newPage.title,
      content: newPage.content,
      authorId: newPage.authorId,
      authorName: newPage.authorName,
      authorAvatar: newPage.authorAvatar,
      changeSummary: 'Created initial page',
    });
  } catch (e) {}

  return newPage;
}

export async function updatePage(
  pageId: string,
  updates: Partial<Page>,
  userId: string,
  userName: string,
  createHistory: boolean = false,
  changeSummary?: string
): Promise<void> {
  const now = new Date().toISOString();
  const allPages = getLocalPages();
  const index = allPages.findIndex(p => p.id === pageId);

  if (index !== -1) {
    const currentData = allPages[index];
    const nextVersion = (currentData.version || 1) + 1;
    const updatedPage: Page = {
      ...currentData,
      ...updates,
      lastModifiedById: userId,
      lastModifiedByName: userName,
      updatedAt: now,
      version: createHistory ? nextVersion : currentData.version,
    };

    if (updates.title) {
      updatedPage.slug = slugify(updates.title);
    }
    if (updates.content) {
      updatedPage.excerpt = extractTextFromHtml(updates.content).substring(0, 160);
    }

    allPages[index] = updatedPage;
    saveLocalPages(allPages);
  }

  try {
    const pageRef = doc(db, COLLECTION, pageId);
    await updateDoc(pageRef, {
      ...updates,
      lastModifiedById: userId,
      lastModifiedByName: userName,
      updatedAt: now,
    });
  } catch (e) {
    console.warn('Firestore updateDoc notice:', e);
  }
}

export async function deletePage(pageId: string, userId: string, userName: string): Promise<void> {
  const allPages = getLocalPages();
  const page = allPages.find(p => p.id === pageId);

  const updatedPages = allPages.filter(p => p.id !== pageId).map(p => {
    if (p.parentId === pageId) {
      return { ...p, parentId: page?.parentId || null };
    }
    return p;
  });
  saveLocalPages(updatedPages);

  try {
    const pageRef = doc(db, COLLECTION, pageId);
    await deleteDoc(pageRef);
  } catch (e) {
    console.warn('Firestore deleteDoc notice:', e);
  }
}

export async function getPage(pageId: string): Promise<Page | null> {
  try {
    const pageRef = doc(db, COLLECTION, pageId);
    const snap = await getDoc(pageRef);
    if (snap.exists()) return snap.data() as Page;
  } catch (e) {}

  const local = getLocalPages().find(p => p.id === pageId || p.slug === pageId);
  return local || null;
}

export async function getPagesBySpace(spaceId: string): Promise<Page[]> {
  let pages: Page[] = [];
  try {
    const q = query(collection(db, COLLECTION), where('spaceId', '==', spaceId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      pages = snap.docs.map((d) => d.data() as Page);
    }
  } catch (e) {}

  if (pages.length === 0) {
    pages = getLocalPages().filter(p => p.spaceId === spaceId);
  }

  return pages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getAllPages(workspaceId: string = 'vipto-workspace'): Promise<Page[]> {
  let pages: Page[] = [];
  try {
    const q = query(collection(db, COLLECTION), where('workspaceId', '==', workspaceId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      pages = snap.docs.map((d) => d.data() as Page);
    }
  } catch (e) {}

  if (pages.length === 0) {
    pages = getLocalPages();
  }

  return pages.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function reorderPages(spaceId: string, orderedPageIds: string[]): Promise<void> {
  const allPages = getLocalPages();
  orderedPageIds.forEach((id, idx) => {
    const p = allPages.find(item => item.id === id);
    if (p) p.order = idx;
  });
  saveLocalPages(allPages);
}

export async function movePage(pageId: string, newParentId: string | null, newSpaceId?: string): Promise<void> {
  const allPages = getLocalPages();
  const p = allPages.find(item => item.id === pageId);
  if (p) {
    p.parentId = newParentId;
    if (newSpaceId) p.spaceId = newSpaceId;
    p.updatedAt = new Date().toISOString();
    saveLocalPages(allPages);
  }
}

export async function duplicatePage(pageId: string, userId: string, userName: string): Promise<Page> {
  const original = await getPage(pageId);
  if (!original) throw new Error('Original page not found');

  return createPage({
    workspaceId: original.workspaceId,
    spaceId: original.spaceId,
    parentId: original.parentId,
    title: `${original.title} (Copy)`,
    icon: original.icon,
    content: original.content,
    authorId: userId,
    authorName: userName,
  });
}

export async function getBreadcrumbs(page: Page, space?: Space | null): Promise<BreadcrumbItem[]> {
  const breadcrumbs: BreadcrumbItem[] = [];

  if (space) {
    breadcrumbs.push({
      id: space.id,
      title: space.name,
      link: `/spaces/${space.key || space.id}`,
    });
  }

  let currentParentId = page.parentId;
  const parentChain: Page[] = [];
  const allPages = getLocalPages();

  while (currentParentId) {
    const parent = allPages.find(p => p.id === currentParentId);
    if (parent) {
      parentChain.unshift(parent);
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }

  parentChain.forEach((p) => {
    breadcrumbs.push({
      id: p.id,
      title: p.title,
      link: `/spaces/${space?.key || p.spaceId}/${p.id}`,
    });
  });

  breadcrumbs.push({
    id: page.id,
    title: page.title,
    isCurrent: true,
  });

  return breadcrumbs;
}

export async function getRecentUpdatedPages(workspaceId: string, limitCount: number = 6): Promise<Page[]> {
  let pages: Page[] = [];
  try {
    const q = query(
      collection(db, COLLECTION),
      where('workspaceId', '==', workspaceId),
      limit(20)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      pages = snap.docs.map((d) => d.data() as Page);
    }
  } catch (e) {}

  if (pages.length === 0) {
    pages = getLocalPages();
  }

  return pages.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limitCount);
}
