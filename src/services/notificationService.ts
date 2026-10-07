import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Notification } from '@/types';

const COLLECTION = 'notifications';

export async function createNotification(
  notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>
): Promise<Notification> {
  const notifDoc = doc(collection(db, COLLECTION));
  const now = new Date().toISOString();

  const newNotif: Notification = {
    id: notifDoc.id,
    userId: notificationData.userId,
    title: notificationData.title,
    message: notificationData.message,
    link: notificationData.link || (notificationData.pageId ? `/page/${notificationData.pageId}` : ''),
    pageId: notificationData.pageId,
    spaceId: notificationData.spaceId,
    actorId: notificationData.actorId,
    actorName: notificationData.actorName,
    actorAvatar: notificationData.actorAvatar,
    type: notificationData.type,
    isRead: false,
    createdAt: now,
  };

  try {
    await setDoc(notifDoc, newNotif);
  } catch (error) {
    console.warn('Failed to save notification:', error);
  }

  return newNotif;
}

export async function getNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Notification);
  } catch {
    const fallbackQ = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      limit(limitCount)
    );
    const snap = await getDocs(fallbackQ);
    const notifs = snap.docs.map((d) => d.data() as Notification);
    return notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export async function markAsRead(notificationId: string): Promise<void> {
  const notifRef = doc(db, COLLECTION, notificationId);
  await updateDoc(notifRef, { isRead: true });
}

export async function markAllAsRead(userId: string): Promise<void> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  snap.forEach(async (docSnap) => {
    await updateDoc(docSnap.ref, { isRead: true });
  });
}
