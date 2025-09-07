import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('addedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        addedAt: doc.data().addedAt?.toDate() || new Date(),
        lastUpdated: doc.data().lastUpdated?.toDate()
      })) as User[];
      
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addUser = async (userData: Omit<User, 'id' | 'addedAt'>) => {
    try {
      await addDoc(collection(db, 'users'), {
        ...userData,
        addedAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        lastUpdated: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser
  };
};