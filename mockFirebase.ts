// Mock Firebase to satisfy Vite Frontend while backend is fully migrated to Prisma/Express
export const auth: any = { currentUser: { uid: 'mock-uid', email: 'owner@nexus.local' } };
export const db: any = {};
export const signInWithPopup = async (...args: any[]) => ({ user: { uid: 'mock', email: 'owner@nexus.local' } });
export const GoogleAuthProvider = class { constructor(...args: any[]) {} };
export const createUserWithEmailAndPassword = async (...args: any[]) => ({ user: { uid: 'mock', email: 'owner@nexus.local' } });
export const signInWithEmailAndPassword = async (...args: any[]) => ({ user: { uid: 'mock', email: 'owner@nexus.local' } });
export const sendPasswordResetEmail = async (...args: any[]) => {};
export const signOut = async (...args: any[]) => {};
export const onAuthStateChanged = (...args: any[]) => { 
  if (typeof args[1] === 'function') {
    args[1]({ uid: 'mock-uid', email: 'owner@nexus.local', displayName: 'Mock User' }); 
  }
  return () => {}; 
};
export const browserPopupRedirectResolver = {};
export type FirebaseUser = any;

export const collection = (...args: any[]) => {};
export const query = (...args: any[]) => {};
export const where = (...args: any[]) => {};
export const getDocs = async (...args: any[]) => ({ docs: [], empty: true, forEach: () => {} });
export const getDoc = async (...args: any[]) => ({ exists: () => false, data: () => ({}), id: 'mock' });
export const setDoc = async (...args: any[]) => {};
export const updateDoc = async (...args: any[]) => {};
export const addDoc = async (...args: any[]) => ({ id: 'mock' });
export const deleteDoc = async (...args: any[]) => {};
export const doc = (...args: any[]) => {};
export const serverTimestamp = (...args: any[]) => new Date().toISOString();
export const onSnapshot = (...args: any[]) => { 
  if (typeof args[1] === 'function') {
    args[1]({ exists: () => false, data: () => ({}), docs: [] }); 
  }
  return () => {}; 
};
export const orderBy = (...args: any[]) => {};
export const limit = (...args: any[]) => {};

export const runTransaction = async (...args: any[]) => { 
  if (typeof args[1] === 'function') {
    await args[1]({ get: getDoc, update: updateDoc, set: setDoc, delete: deleteDoc }); 
  }
};
export const increment = (...args: any[]) => args[0] || 1;
export const writeBatch = (...args: any[]) => ({ set: () => {}, update: () => {}, delete: () => {}, commit: async () => {} });
