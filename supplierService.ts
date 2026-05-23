import { collection, query, where, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, orderBy, limit } from '@/src/infrastructure/mockFirebase';
import { auth, db } from '@/src/infrastructure/mockFirebase';
import { SupplierConnection } from '../../types/index';
import { handleFirestoreError, OperationType } from '../../utils/firestore-errors';
import { SupplierFactory } from './supplierFactory';

const COLLECTION_NAME = 'supplierConnections';

export const supplierService = {
  async getConnections(agencyId: string): Promise<SupplierConnection[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('agencyId', '==', agencyId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupplierConnection));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async addConnection(agencyId: string, data: Partial<SupplierConnection>): Promise<string> {
    // Validate with adapter first
    // data.supplierName is the type (e.g. DIGIFLAZZ, SUPPLIER_A)
    const type = data.supplierName || '';
    const adapter = SupplierFactory.getAdapter(type, data);
    
    if (!adapter) throw new Error('Unsupported supplier');

    const validation = await adapter.validateCredentials(data);
    if (!validation.isValid) {
      throw new Error(validation.message || 'Invalid credentials');
    }

    try {
      const newDoc = {
        agencyId: agencyId,
        supplierName: adapter.name,
        apiKey: data.apiKey,
        secretKey: data.secretKey || null,
        resellerId: data.resellerId || null,
        accessToken: data.accessToken || null,
        status: 'ACTIVE',
        lastSyncAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  async updateConnection(id: string, data: Partial<SupplierConnection>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(docRef, {
        ...data,
        lastSyncAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteConnection(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async syncConnection(id: string): Promise<void> {
    try {
      const response = await fetch('/api/suppliers/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ connectionId: id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync with supplier');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
};
