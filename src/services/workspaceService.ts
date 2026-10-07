import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Workspace, WorkspaceMember, UserRole } from '@/types';
import { logAuditEvent } from './auditService';

const DEFAULT_WORKSPACE_ID = 'vipto-workspace';

export async function getWorkspace(workspaceId: string = DEFAULT_WORKSPACE_ID): Promise<Workspace | null> {
  const wsRef = doc(db, 'workspaces', workspaceId);
  const snap = await getDoc(wsRef);
  if (!snap.exists()) return null;
  return snap.data() as Workspace;
}

export async function getOrCreateDefaultWorkspace(ownerId: string = 'system', ownerName: string = 'Admin'): Promise<Workspace> {
  const existing = await getWorkspace(DEFAULT_WORKSPACE_ID);
  if (existing) return existing;

  const now = new Date().toISOString();
  const defaultWs: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    name: 'Vipto',
    slug: 'vipto',
    description: 'Central documentation and team knowledge base for Vipto.',
    ownerId,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'workspaces', DEFAULT_WORKSPACE_ID), defaultWs);

  // Add initial member
  const memberRef = doc(db, 'workspaces', DEFAULT_WORKSPACE_ID, 'members', ownerId);
  await setDoc(memberRef, {
    userId: ownerId,
    name: ownerName,
    email: 'admin@vipto.io',
    role: 'Owner',
    joinedAt: now,
  });

  return defaultWs;
}

export async function getWorkspaceMembers(workspaceId: string = DEFAULT_WORKSPACE_ID): Promise<WorkspaceMember[]> {
  const membersRef = collection(db, 'workspaces', workspaceId, 'members');
  const snap = await getDocs(membersRef);
  if (snap.empty) {
    // Return default seed members if empty
    return [
      {
        userId: 'u1',
        name: 'Ayush Kumar',
        email: 'ayush@vipto.io',
        role: 'Owner',
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'u2',
        name: 'Rahul Sharma',
        email: 'rahul@vipto.io',
        role: 'Admin',
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'u3',
        name: 'Priya Patel',
        email: 'priya@vipto.io',
        role: 'Editor',
        joinedAt: new Date().toISOString(),
      },
      {
        userId: 'u4',
        name: 'Alex Chen',
        email: 'alex@vipto.io',
        role: 'Viewer',
        joinedAt: new Date().toISOString(),
      },
    ];
  }
  return snap.docs.map((d) => d.data() as WorkspaceMember);
}

export async function addWorkspaceMember(
  workspaceId: string = DEFAULT_WORKSPACE_ID,
  member: Omit<WorkspaceMember, 'joinedAt'>
): Promise<WorkspaceMember> {
  const now = new Date().toISOString();
  const memberData: WorkspaceMember = {
    ...member,
    joinedAt: now,
  };

  const memberRef = doc(db, 'workspaces', workspaceId, 'members', member.userId);
  await setDoc(memberRef, memberData);

  await logAuditEvent({
    workspaceId,
    userId: member.userId,
    userName: member.name,
    userEmail: member.email,
    action: 'MEMBER_ADDED',
    entityType: 'member',
    entityId: member.userId,
    entityTitle: member.name,
    details: `Added ${member.name} as ${member.role}`,
  });

  return memberData;
}

export async function updateMemberRole(
  workspaceId: string = DEFAULT_WORKSPACE_ID,
  userId: string,
  role: UserRole,
  adminUserId: string,
  adminUserName: string
): Promise<void> {
  const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId);
  await updateDoc(memberRef, { role });

  await logAuditEvent({
    workspaceId,
    userId: adminUserId,
    userName: adminUserName,
    userEmail: '',
    action: 'PERMISSION_CHANGED',
    entityType: 'member',
    entityId: userId,
    entityTitle: `User ${userId}`,
    details: `Updated role to ${role}`,
  });
}

export async function removeWorkspaceMember(
  workspaceId: string = DEFAULT_WORKSPACE_ID,
  userId: string,
  adminUserId: string,
  adminUserName: string
): Promise<void> {
  const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId);
  await deleteDoc(memberRef);

  await logAuditEvent({
    workspaceId,
    userId: adminUserId,
    userName: adminUserName,
    userEmail: '',
    action: 'MEMBER_REMOVED',
    entityType: 'member',
    entityId: userId,
    entityTitle: `User ${userId}`,
    details: `Removed user from workspace`,
  });
}
