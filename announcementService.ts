import { auth, db } from '@/src/infrastructure/mockFirebase';
import { collection, query, where, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, orderBy, limit } from '@/src/infrastructure/mockFirebase';
import { Announcement, Role } from '../../types/index';
import { handleFirestoreError, OperationType } from '../../utils/firestore-errors';

export const announcementService = {
  async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'announcements'), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  },

  async getLatestAnnouncements(userRole: Role, count: number = 5): Promise<Announcement[]> {
    try {
      // Query filter by targetRole and expiration
      const q = query(
        collection(db, 'announcements'),
        where('targetRoles', 'array-contains', userRole),
        limit(count)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
      return [];
    }
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  }
};
