import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { AuditLog } from '@/types';

const COLLECTION = 'auditLogs';

export async function logAuditEvent(
  auditData: Omit<AuditLog, 'id' | 'createdAt'>
): Promise<AuditLog> {
  const logDoc = doc(collection(db, COLLECTION));
  const now = new Date().toISOString();

  const newLog: AuditLog = {
    id: logDoc.id,
    workspaceId: auditData.workspaceId,
    userId: auditData.userId,
    userName: auditData.userName || 'Team Member',
    userEmail: auditData.userEmail || '',
    action: auditData.action,
    entityType: auditData.entityType,
    entityId: auditData.entityId,
    entityTitle: auditData.entityTitle,
    details: auditData.details || '',
    createdAt: now,
  };

  try {
    await setDoc(logDoc, newLog);
  } catch (error) {
    console.warn('Audit log write error:', error);
  }

  return newLog;
}

export async function getAuditLogs(workspaceId: string, limitCount: number = 50): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('workspaceId', '==', workspaceId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as AuditLog);
  } catch {
    // Fallback in case index is pending
    const fallbackQ = query(
      collection(db, COLLECTION),
      where('workspaceId', '==', workspaceId),
      limit(limitCount)
    );
    const snap = await getDocs(fallbackQ);
    const logs = snap.docs.map((d) => d.data() as AuditLog);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
