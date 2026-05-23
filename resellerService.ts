import { collection, query, where, getDocs, getDoc, setDoc, updateDoc, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot, orderBy, limit } from '@/src/infrastructure/mockFirebase';
import { auth, db } from '@/src/infrastructure/mockFirebase';
import { Reseller } from '../../types/index';
import { handleFirestoreError, OperationType } from '../../utils/firestore-errors';

const COLLECTION_NAME = 'resellers';

export const resellerService = {
  async getResellers(agencyId: string, parentId?: string): Promise<Reseller[]> {
    try {
      let q;
      if (parentId) {
        q = query(
          collection(db, COLLECTION_NAME), 
          where('agencyId', '==', agencyId),
          where('parentId', '==', parentId),
          orderBy('name', 'asc')
        );
      } else {
        q = query(
          collection(db, COLLECTION_NAME), 
          where('agencyId', '==', agencyId),
          orderBy('hierarchyLevel', 'asc'),
          orderBy('name', 'asc'),
          limit(100)
        );
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Reseller));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return [];
    }
  },

  async getAncestors(resellerId: string, agencyId: string): Promise<Reseller[]> {
    const ancestors: Reseller[] = [];
    let currentId: string | undefined | null = resellerId;
    
    // We fetch one by one up the chain. To prevent infinite loops or excessive reads, limit to 10 depths.
    let depth = 0;
    while (currentId && depth < 10) {
      try {
        const docRef = doc(db, COLLECTION_NAME, currentId);
        const snapshot = await getDocs(query(collection(db, COLLECTION_NAME), where('__name__', '==', currentId), where('agencyId', '==', agencyId)));
        if (snapshot.empty) break;

        const data = snapshot.docs[0].data() as Reseller;
        // Don't add the original reseller itself to ancestors
        if (currentId !== resellerId) {
          ancestors.push({ id: snapshot.docs[0].id, ...data });
        }
        currentId = data.parentId;
        depth++;
      } catch (error) {
        console.error("Error fetching ancestor:", error);
        break;
      }
    }
    
    return ancestors;
  },

  async getDescendants(resellerId: string, agencyId: string): Promise<Reseller[]> {
    try {
      // For a truly generic descent, we'd recursively fetch.
      // Or query by parentPath if parentPath contains the ancestor ID.
      const q = query(
        collection(db, COLLECTION_NAME),
        where('agencyId', '==', agencyId),
        where('parentPath', '>=', resellerId),
        where('parentPath', '<=', resellerId + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const descendants = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any } as Reseller));
      // In case we don't have parentPath effectively queried, let's also fetch by parentId directly
      
      return descendants;
    } catch (error) {
       handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
       return [];
    }
  },

  async getResellerByEmail(email: string, agencyId: string): Promise<Reseller | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('email', '==', email),
        where('agencyId', '==', agencyId)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() as any } as Reseller;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      return null;
    }
  },

  async addReseller(agencyId: string, data: { 
    name: string; 
    email: string; 
    balance: number; 
    parentId?: string;
    hierarchyLevel?: number;
    parentPath?: string;
  }): Promise<string> {
    try {
      const newReseller: any = {
        agencyId,
        parentId: data.parentId || null,
        hierarchyLevel: data.hierarchyLevel || 0,
        name: data.name,
        email: data.email,
        status: 'ACTIVE',
        balance: data.balance,
        pendingBalance: 0,
        frozenBalance: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), newReseller);
      
      // Update path with the new ID
      const path = data.parentPath ? `${data.parentPath}/${docRef.id}` : `${agencyId}/${docRef.id}`;
      await updateDoc(doc(db, COLLECTION_NAME, docRef.id), { path });
      
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
      throw error;
    }
  },

  async updateResellerBalance(agencyId: string, id: string, amount: number, description: string = 'Manual Adjustment'): Promise<void> {
    try {
      const type = amount >= 0 ? '/api/wallet/credit' : '/api/wallet/debit';
      const response = await fetch(type, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resellerId: id,
          agencyId: agencyId,
          amount: Math.abs(amount),
          description
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to update balance');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },

  async updateReseller(id: string, data: Partial<Reseller>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
      throw error;
    }
  },

  async updateResellerStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await updateDoc(docRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async deleteReseller(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    try {
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
    }
  },

  async updateResellerTier(resellerId: string, tierId: string | null): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, resellerId);
    try {
      await updateDoc(docRef, { tierId });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${resellerId}`);
      throw error;
    }
  },

  // Tier Management
  async getTiers(agencyId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/reseller-tiers?agencyId=${encodeURIComponent(agencyId)}`);
      if (!response.ok) {
        throw new Error(`Platform API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tiers via API:', error);
      return [];
    }
  },

  async addTier(agencyId: string, data: any): Promise<string> {
    try {
      const response = await fetch('/api/reseller-tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...data, agencyId })
      });
      if (!response.ok) {
        throw new Error(`Platform API error: ${response.statusText}`);
      }
      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error adding tier via API:', error);
      throw error;
    }
  },

  async updateTier(tierId: string, data: any): Promise<void> {
    try {
      const response = await fetch(`/api/reseller-tiers/${encodeURIComponent(tierId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(`Platform API error: ${response.statusText}`);
      }
      await response.json();
    } catch (error) {
      console.error('Error updating tier via API:', error);
      throw error;
    }
  },

  async deleteTier(tierId: string): Promise<void> {
    try {
      const response = await fetch(`/api/reseller-tiers/${encodeURIComponent(tierId)}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`Platform API error: ${response.statusText}`);
      }
      await response.json();
    } catch (error) {
      console.error('Error deleting tier via API:', error);
      throw error;
    }
  }
};
