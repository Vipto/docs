import { collection, doc, getDocs, setDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Page } from '@/types';

export interface RecentPageItem {
  id: string;
  title: string;
  spaceId: string;
  icon: string;
  visitedAt: string;
}

export async function trackRecentPage(userId: string, page: Page): Promise<void> {
  if (!userId || !page?.id) return;
  try {
    const recentRef = doc(db, 'userRecentPages', userId, 'pages', page.id);
    await setDoc(
      recentRef,
      {
        id: page.id,
        title: page.title,
        spaceId: page.spaceId,
        icon: page.icon || 'file',
        visitedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Track recent page error:', error);
  }
}

export async function getUserRecentPages(userId: string, limitCount: number = 20): Promise<RecentPageItem[]> {
  if (!userId) return [];
  try {
    const recentRef = collection(db, 'userRecentPages', userId, 'pages');
    const q = query(recentRef, orderBy('visitedAt', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as RecentPageItem);
  } catch {
    const recentRef = collection(db, 'userRecentPages', userId, 'pages');
    const snap = await getDocs(recentRef);
    const pages = snap.docs.map((d) => d.data() as RecentPageItem);
    return pages
      .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime())
      .slice(0, limitCount);
  }
}
