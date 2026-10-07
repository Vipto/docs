import { collection, doc, getDocs, setDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Space, Page } from '@/types';
import { createPageVersion } from './historyService';
import { NOTION_SPACES, NOTION_PAGES } from './seedNotionData';

export const ALL_DEFAULT_SPACES: Space[] = NOTION_SPACES;
export const ALL_DEFAULT_PAGES: Page[] = NOTION_PAGES;

// In-memory / local cache fallback for instant offline/offline resilience
const LOCAL_STORAGE_SPACES_KEY = 'vipto_docs_spaces';
const LOCAL_STORAGE_PAGES_KEY = 'vipto_docs_pages';

export function getLocalSpaces(): Space[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SPACES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ALL_DEFAULT_SPACES;
}

export function saveLocalSpaces(spaces: Space[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_SPACES_KEY, JSON.stringify(spaces));
  } catch (e) {}
}

export function getLocalPages(): Page[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_PAGES_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return ALL_DEFAULT_PAGES;
}

export function saveLocalPages(pages: Page[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PAGES_KEY, JSON.stringify(pages));
  } catch (e) {}
}

export async function seedInitialWorkspaceData(
  userId: string = 'u1',
  userName: string = 'Ayush Kumar',
  force: boolean = false
): Promise<boolean> {
  const workspaceId = 'vipto-workspace';
  const now = new Date().toISOString();

  // Save to local cache first
  saveLocalSpaces(ALL_DEFAULT_SPACES);
  saveLocalPages(ALL_DEFAULT_PAGES);

  try {
    // 1. Workspace
    await setDoc(
      doc(db, 'workspaces', workspaceId),
      {
        id: workspaceId,
        name: 'Vipto',
        slug: 'vipto',
        description: 'Central documentation, engineering wiki, and Notion knowledge base for Vipto.',
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // 2. Spaces
    for (const space of ALL_DEFAULT_SPACES) {
      const spaceRef = doc(db, 'spaces', space.id);
      await setDoc(
        spaceRef,
        {
          ...space,
          workspaceId,
          ownerId: userId,
          ownerName: userName,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    // 3. Pages
    for (const page of ALL_DEFAULT_PAGES) {
      const pageRef = doc(db, 'pages', page.id);
      await setDoc(pageRef, page, { merge: true });

      // Add Version 1 in subcollection
      const verRef = doc(collection(db, 'pages', page.id, 'versions'));
      await setDoc(
        verRef,
        {
          id: verRef.id,
          pageId: page.id,
          versionNumber: 1,
          title: page.title,
          content: page.content,
          authorId: userId,
          authorName: userName,
          changeSummary: 'Imported from Notion Knowledge Base',
          createdAt: now,
        },
        { merge: true }
      );
    }

    return true;
  } catch (error) {
    console.warn('Firestore seeding notice (running in resilient hybrid mode):', error);
    return true;
  }
}
