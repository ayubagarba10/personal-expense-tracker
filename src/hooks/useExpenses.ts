import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  where,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt: Timestamp;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const expenseData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[];
        setExpenses(expenseData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching expenses:', error);
        setError('Failed to fetch expenses. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      const expenseData = {
        ...expense,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        amount: Number(expense.amount)
      };

      const docRef = await addDoc(collection(db, 'expenses'), expenseData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw new Error('Failed to add expense. Please try again.');
    }
  }, [currentUser]);

  const deleteExpense = useCallback(async (id: string) => {
    if (!currentUser) throw new Error('User not authenticated');

    try {
      await runTransaction(db, async (transaction) => {
        const docRef = doc(db, 'expenses', id);
        transaction.delete(docRef);
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense. Please try again.');
    }
  }, [currentUser]);

  return { 
    expenses, 
    loading, 
    error,
    addExpense, 
    deleteExpense 
  };
};

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];