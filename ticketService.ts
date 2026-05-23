import { auth, db } from '@/src/infrastructure/mockFirebase';
import { collection, query, where, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, orderBy, limit } from '@/src/infrastructure/mockFirebase';
import { Ticket, TicketMessage, Role } from '../../types/index';
import { handleFirestoreError, OperationType } from '../../utils/firestore-errors';

export const ticketService = {
  async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'lastMessageAt'>, initialMessage: string): Promise<string | undefined> {
    try {
      const ticketRef = await addDoc(collection(db, 'tickets'), {
        ...ticketData,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        status: 'OPEN'
      });

      // Add actual initial message to subcollection
      await addDoc(collection(db, 'tickets', ticketRef.id, 'messages'), {
        senderId: ticketData.userId,
        senderName: ticketData.userName,
        senderRole: ticketData.userRole,
        content: initialMessage,
        createdAt: serverTimestamp()
      });

      return ticketRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tickets');
    }
  },

  async addReply(ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>, newStatus?: Ticket['status']): Promise<void> {
    try {
      // Add message
      await addDoc(collection(db, 'tickets', ticketId, 'messages'), {
        ...message,
        createdAt: serverTimestamp()
      });

      // Update ticket metadata
      const ticketRef = doc(db, 'tickets', ticketId);
      const updates: any = {
        lastMessageAt: serverTimestamp()
      };
      if (newStatus) {
        updates.status = newStatus;
      }
      
      await updateDoc(ticketRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tickets/${ticketId}`);
    }
  },

  async getTickets(userId?: string, limitCount: number = 50, agencyId?: string): Promise<Ticket[]> {
    try {
      let q;
      const ticketsRef = collection(db, 'tickets');
      
      if (agencyId) {
        q = query(ticketsRef, where('agencyId', '==', agencyId), orderBy('lastMessageAt', 'desc'), limit(limitCount));
      } else if (userId) {
        q = query(ticketsRef, where('userId', '==', userId), orderBy('lastMessageAt', 'desc'), limit(limitCount));
      } else {
        q = query(ticketsRef, orderBy('lastMessageAt', 'desc'), limit(limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as Ticket[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'tickets');
      return [];
    }
  },

  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    try {
      const q = query(
        collection(db, 'tickets', ticketId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      })) as TicketMessage[];
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `tickets/${ticketId}/messages`);
      return [];
    }
  },

  async updateStatus(ticketId: string, status: Ticket['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tickets/${ticketId}`);
    }
  }
};
