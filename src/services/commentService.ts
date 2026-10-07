import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Comment } from '@/types';
import { createNotification } from './notificationService';

export async function addComment(
  pageId: string,
  commentData: {
    content: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    parentId?: string | null;
    mentions?: string[];
  },
  pageTitle?: string
): Promise<Comment> {
  const commentsRef = collection(db, 'pages', pageId, 'comments');
  const newCommentDoc = doc(commentsRef);
  const now = new Date().toISOString();

  const newComment: Comment = {
    id: newCommentDoc.id,
    pageId,
    content: commentData.content,
    authorId: commentData.authorId,
    authorName: commentData.authorName,
    authorAvatar: commentData.authorAvatar || '',
    isResolved: false,
    parentId: commentData.parentId || null,
    mentions: commentData.mentions || [],
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newCommentDoc, newComment);

  // Send notifications for mentions
  if (commentData.mentions && commentData.mentions.length > 0) {
    for (const mentionedUserId of commentData.mentions) {
      if (mentionedUserId !== commentData.authorId) {
        await createNotification({
          userId: mentionedUserId,
          title: 'You were mentioned',
          message: `${commentData.authorName} mentioned you in a comment on "${pageTitle || 'a page'}"`,
          type: 'mention',
          pageId,
          actorId: commentData.authorId,
          actorName: commentData.authorName,
          actorAvatar: commentData.authorAvatar,
        });
      }
    }
  }

  return newComment;
}

export async function resolveComment(
  pageId: string,
  commentId: string,
  userId: string,
  userName: string,
  isResolved: boolean = true
): Promise<void> {
  const commentRef = doc(db, 'pages', pageId, 'comments', commentId);
  const now = new Date().toISOString();

  await updateDoc(commentRef, {
    isResolved,
    resolvedById: isResolved ? userId : null,
    resolvedByName: isResolved ? userName : null,
    resolvedAt: isResolved ? now : null,
    updatedAt: now,
  });
}

export async function deleteComment(pageId: string, commentId: string): Promise<void> {
  const commentRef = doc(db, 'pages', pageId, 'comments', commentId);
  await deleteDoc(commentRef);
}

export async function getComments(pageId: string): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'pages', pageId, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Comment);
  } catch {
    const commentsRef = collection(db, 'pages', pageId, 'comments');
    const snap = await getDocs(commentsRef);
    const comments = snap.docs.map((d) => d.data() as Comment);
    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}
