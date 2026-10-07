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
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Space } from '@/types';
import { logAuditEvent } from './auditService';
import { getLocalSpaces, saveLocalSpaces, getLocalPages } from './seedService';

const COLLECTION = 'spaces';

export async function createSpace(
  spaceData: Omit<Space, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Space> {
  const newDocRef = doc(collection(db, COLLECTION));
  const now = new Date().toISOString();

  const newSpace: Space = {
    id: newDocRef.id,
    workspaceId: spaceData.workspaceId || 'vipto-workspace',
    name: spaceData.name,
    key: spaceData.key.toUpperCase(),
    description: spaceData.description || '',
    icon: spaceData.icon || 'folder',
    coverImage: spaceData.coverImage || '',
    ownerId: spaceData.ownerId,
    ownerName: spaceData.ownerName,
    isPrivate: spaceData.isPrivate || false,
    pageCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newSpace);
  } catch (e) {
    console.warn('Firestore setDoc notice:', e);
  }

  // Update local cache
  const spaces = getLocalSpaces();
  spaces.push(newSpace);
  saveLocalSpaces(spaces);

  await logAuditEvent({
    workspaceId: newSpace.workspaceId,
    userId: newSpace.ownerId,
    userName: newSpace.ownerName,
    userEmail: '',
    action: 'SPACE_CREATED',
    entityType: 'space',
    entityId: newSpace.id,
    entityTitle: newSpace.name,
    details: `Created space ${newSpace.name} (${newSpace.key})`,
  });

  return newSpace;
}

export async function updateSpace(
  spaceId: string,
  updates: Partial<Space>,
  userId: string,
  userName: string
): Promise<void> {
  const spaceRef = doc(db, COLLECTION, spaceId);
  const now = new Date().toISOString();

  try {
    await updateDoc(spaceRef, {
      ...updates,
      updatedAt: now,
    });
  } catch (e) {
    console.warn('Firestore updateDoc notice:', e);
  }

  const spaces = getLocalSpaces();
  const index = spaces.findIndex((s) => s.id === spaceId);
  if (index !== -1) {
    spaces[index] = { ...spaces[index], ...updates, updatedAt: now };
    saveLocalSpaces(spaces);
  }

  await logAuditEvent({
    workspaceId: updates.workspaceId || 'vipto-workspace',
    userId,
    userName,
    userEmail: '',
    action: 'SPACE_UPDATED',
    entityType: 'space',
    entityId: spaceId,
    entityTitle: updates.name || 'Space',
    details: 'Updated space settings',
  });
}

export async function deleteSpace(
  spaceId: string,
  workspaceId: string,
  userId: string,
  userName: string
): Promise<void> {
  const spaceRef = doc(db, COLLECTION, spaceId);
  try {
    await deleteDoc(spaceRef);
  } catch (e) {
    console.warn('Firestore deleteDoc notice:', e);
  }

  const spaces = getLocalSpaces().filter((s) => s.id !== spaceId);
  saveLocalSpaces(spaces);

  await logAuditEvent({
    workspaceId,
    userId,
    userName,
    userEmail: '',
    action: 'SPACE_DELETED',
    entityType: 'space',
    entityId: spaceId,
    entityTitle: spaceId,
    details: 'Deleted space',
  });
}

export async function getSpace(spaceId: string): Promise<Space | null> {
  try {
    const spaceRef = doc(db, COLLECTION, spaceId);
    const snap = await getDoc(spaceRef);
    if (snap.exists()) return snap.data() as Space;
  } catch (e) {}

  const local = getLocalSpaces().find((s) => s.id === spaceId || s.key.toLowerCase() === spaceId.toLowerCase());
  return local || null;
}

export async function getSpaceByKey(workspaceId: string, key: string): Promise<Space | null> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('workspaceId', '==', workspaceId),
      where('key', '==', key.toUpperCase())
    );
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs[0].data() as Space;
  } catch (e) {}

  const local = getLocalSpaces().find((s) => s.key.toUpperCase() === key.toUpperCase() || s.id === key);
  return local || null;
}

export async function getSpaces(workspaceId: string): Promise<Space[]> {
  let spaces: Space[] = [];
  try {
    const q = query(collection(db, COLLECTION), where('workspaceId', '==', workspaceId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      spaces = snap.docs.map((d) => d.data() as Space);
    }
  } catch (e) {}

  if (spaces.length === 0) {
    spaces = getLocalSpaces();
  }

  // Aggregate dynamic page counts
  const allPages = getLocalPages();
  const countMap: Record<string, number> = {};
  allPages.forEach((p) => {
    countMap[p.spaceId] = (countMap[p.spaceId] || 0) + 1;
  });

  return spaces.map((s) => ({
    ...s,
    pageCount: countMap[s.id] || s.pageCount || 0,
  }));
}
