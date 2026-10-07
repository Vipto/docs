import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { PageVersion } from '@/types';
import { updatePage } from './pageService';

export async function createPageVersion(
  pageId: string,
  versionData: Omit<PageVersion, 'id' | 'pageId' | 'createdAt'>
): Promise<PageVersion> {
  const versionsRef = collection(db, 'pages', pageId, 'versions');
  const newVerDoc = doc(versionsRef);
  const now = new Date().toISOString();

  const newVersion: PageVersion = {
    id: newVerDoc.id,
    pageId,
    versionNumber: versionData.versionNumber,
    title: versionData.title,
    content: versionData.content,
    authorId: versionData.authorId,
    authorName: versionData.authorName,
    authorAvatar: versionData.authorAvatar || '',
    changeSummary: versionData.changeSummary || 'Page edited',
    createdAt: now,
  };

  await setDoc(newVerDoc, newVersion);
  return newVersion;
}

export async function getPageHistory(pageId: string): Promise<PageVersion[]> {
  try {
    const versionsRef = collection(db, 'pages', pageId, 'versions');
    const q = query(versionsRef, orderBy('versionNumber', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as PageVersion);
  } catch {
    const versionsRef = collection(db, 'pages', pageId, 'versions');
    const snap = await getDocs(versionsRef);
    const versions = snap.docs.map((d) => d.data() as PageVersion);
    return versions.sort((a, b) => b.versionNumber - a.versionNumber);
  }
}

export async function restorePageVersion(
  pageId: string,
  version: PageVersion,
  userId: string,
  userName: string
): Promise<void> {
  await updatePage(
    pageId,
    {
      title: version.title,
      content: version.content,
    },
    userId,
    userName,
    true,
    `Restored to Version ${version.versionNumber}`
  );
}
