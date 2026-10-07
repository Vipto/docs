import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { storage, db } from '@/firebase/config';
import { Attachment } from '@/types';

export async function uploadAttachment(
  pageId: string,
  file: File,
  userId: string,
  userName: string,
  onProgress?: (progress: number) => void
): Promise<Attachment> {
  const fileExtension = file.name.split('.').pop() || '';
  const storagePath = `attachments/${pageId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const attDoc = doc(collection(db, 'pages', pageId, 'attachments'));
          const now = new Date().toISOString();

          const attachment: Attachment = {
            id: attDoc.id,
            pageId,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || fileExtension,
            downloadUrl,
            storagePath,
            uploadedById: userId,
            uploadedByName: userName,
            createdAt: now,
          };

          await setDoc(attDoc, attachment);
          resolve(attachment);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

export async function getAttachments(pageId: string): Promise<Attachment[]> {
  try {
    const attRef = collection(db, 'pages', pageId, 'attachments');
    const snap = await getDocs(attRef);
    return snap.docs.map((d) => d.data() as Attachment);
  } catch {
    return [];
  }
}

export async function deleteAttachment(
  pageId: string,
  attachmentId: string,
  storagePath: string
): Promise<void> {
  try {
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef).catch((e) => console.warn('Storage delete warning:', e));
    }
    const attDoc = doc(db, 'pages', pageId, 'attachments', attachmentId);
    await deleteDoc(attDoc);
  } catch (error) {
    console.error('Delete attachment error:', error);
    throw error;
  }
}
