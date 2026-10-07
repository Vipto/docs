import { PresenceUser } from '@/types';

// Palette of distinct collaborative presence colors
const PRESENCE_COLORS = [
  '#4f46e5', // indigo
  '#059669', // emerald
  '#d97706', // amber
  '#dc2626', // rose
  '#7c3aed', // purple
  '#0284c7', // sky
];

const activePresenceMap: Record<string, Map<string, PresenceUser>> = {};
const subscribers: Record<string, Set<(users: PresenceUser[]) => void>> = {};

// Demo synthetic collaborators to showcase live presence
const DEMO_COLLABORATORS: PresenceUser[] = [
  {
    userId: 'u2',
    name: 'Rahul Sharma',
    email: 'rahul@vipto.io',
    avatar: '',
    color: '#059669',
    status: 'editing',
    activeSection: 'Architecture',
    lastActive: new Date().toISOString(),
  },
  {
    userId: 'u3',
    name: 'Priya Patel',
    email: 'priya@vipto.io',
    avatar: '',
    color: '#d97706',
    status: 'viewing',
    activeSection: 'API Specs',
    lastActive: new Date().toISOString(),
  },
];

function notifySubscribers(pageId: string) {
  if (!subscribers[pageId]) return;
  const pageMap = activePresenceMap[pageId] || new Map();
  const list = Array.from(pageMap.values());
  subscribers[pageId].forEach((callback) => {
    try {
      callback(list);
    } catch (e) {
      console.error('Presence notify error:', e);
    }
  });
}

export function subscribeToPresence(
  pageId: string,
  callback: (users: PresenceUser[]) => void
): () => void {
  if (!subscribers[pageId]) {
    subscribers[pageId] = new Set();
  }
  subscribers[pageId].add(callback);

  // Initialize with demo collaborators + existing users
  if (!activePresenceMap[pageId]) {
    activePresenceMap[pageId] = new Map();
    DEMO_COLLABORATORS.forEach((demo) => {
      activePresenceMap[pageId].set(demo.userId, demo);
    });
  }

  // Trigger immediate initial snapshot
  const initial = Array.from(activePresenceMap[pageId].values());
  callback(initial);

  return () => {
    subscribers[pageId]?.delete(callback);
  };
}

export function broadcastPresence(
  pageId: string,
  user: Partial<PresenceUser> & { userId: string; name: string }
): void {
  if (!activePresenceMap[pageId]) {
    activePresenceMap[pageId] = new Map();
    DEMO_COLLABORATORS.forEach((demo) => {
      activePresenceMap[pageId].set(demo.userId, demo);
    });
  }

  const existing = activePresenceMap[pageId].get(user.userId);
  const colorIndex = activePresenceMap[pageId].size % PRESENCE_COLORS.length;
  const newUser: PresenceUser = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    avatar: user.avatar || '',
    color: existing?.color || PRESENCE_COLORS[colorIndex],
    status: user.status || 'viewing',
    activeSection: user.activeSection || 'Document Canvas',
    lastActive: new Date().toISOString(),
  };

  activePresenceMap[pageId].set(user.userId, newUser);
  notifySubscribers(pageId);
}

export function broadcastStatus(
  pageId: string,
  userId: string,
  status: 'editing' | 'viewing'
): void {
  const pageMap = activePresenceMap[pageId];
  if (!pageMap) return;

  const user = pageMap.get(userId);
  if (user) {
    user.status = status;
    user.lastActive = new Date().toISOString();
    notifySubscribers(pageId);
  }
}

export function removePresence(pageId: string, userId: string): void {
  const pageMap = activePresenceMap[pageId];
  if (!pageMap) return;

  pageMap.delete(userId);
  notifySubscribers(pageId);
}

export function getPagePresence(pageId: string, currentUserId?: string): PresenceUser[] {
  const pageMap = activePresenceMap[pageId];
  if (!pageMap) return DEMO_COLLABORATORS;
  return Array.from(pageMap.values());
}

