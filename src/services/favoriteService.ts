import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Page } from '@/types';

export async function toggleFavorite(userId: string, page: Page): Promise<boolean> {
  const favRef = doc(db, 'userFavorites', userId, 'pages', page.id);
  const snap = await getDoc(favRef);

  if (snap.exists()) {
    await deleteDoc(favRef);
    return false;
  } else {
    await setDoc(favRef, {
      id: page.id,
      title: page.title,
      spaceId: page.spaceId,
      icon: page.icon || 'file',
      updatedAt: page.updatedAt,
      starredAt: new Date().toISOString(),
    });
    return true;
  }
}

export async function isPageFavorite(userId: string, pageId: string): Promise<boolean> {
  if (!userId) return false;
  const favRef = doc(db, 'userFavorites', userId, 'pages', pageId);
  const snap = await getDoc(favRef);
  return snap.exists();
}

export async function getUserFavorites(userId: string): Promise<Array<{ id: string; title: string; spaceId: string; icon: string; updatedAt: string }>> {
  if (!userId) return [];
  try {
    const favsRef = collection(db, 'userFavorites', userId, 'pages');
    const snap = await getDocs(favsRef);
    return snap.docs.map((d) => d.data() as any);
  } catch {
    return [];
  }
}
