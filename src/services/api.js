import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPREADSHEET_ID = '17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k';
const API_URL = 'https://script.google.com/macros/s/AKfycbzCkN_J7ugWfEoUcjkO1ajTSQYspDd5gARsss9xOH4d3culb4hK-sbS7d2i1UfS5asY/exec'; 
const OFFLINE_QUEUE_KEY = '@cf_offline_queue';

export const saveExpense = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return { ...response.data, offline: false };
  } catch (error) {
    console.warn('Network error detected. Saving expense locally to sync later.', error.message);
    try {
      const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = existing ? JSON.parse(existing) : [];
      queue.push({ ...data, _queuedAt: Date.now() });
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      return { success: true, offline: true, message: "Saved offline. Will safely sync automatically when internet is restored." };
    } catch (storageError) {
      console.error('Fatal offline storage failure:', storageError);
      throw error;
    }
  }
};

export const syncOfflineExpenses = async () => {
  try {
    const existing = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!existing) return;
    
    const queue = JSON.parse(existing);
    if (queue.length === 0) return;
    
    console.log(`[Offline-First] Attempting to sync ${queue.length} cached expenses...`);
    const remaining = [];
    
    for (const expense of queue) {
      try {
        const { _queuedAt, ...payload } = expense;
        await axios.post(API_URL, payload);
      } catch (err) {
        remaining.push(expense);
      }
    }
    
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch (e) {
    console.error('Sync failure:', e);
  }
};
