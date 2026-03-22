import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SPREADSHEET_ID = '17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k';
const API_URL = 'https://script.google.com/macros/s/AKfycbzCkN_J7ugWfEoUcjkO1ajTSQYspDd5gARsss9xOH4d3culb4hK-sbS7d2i1UfS5asY/exec'; 
const OFFLINE_QUEUE_KEY = '@cf_offline_queue';

export const saveExpense = async (data) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      // Google Apps Script requires text/plain to avoid OPTIONS preflight CORS errors
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return { ...result, offline: false };
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

export const fetchExpenses = async () => {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Sheet1`);
    const csvText = await response.text();
    
    // Fallback simple parsing until PapaParse is ready
    const lines = csvText.split('\n');
    const headers = lines[0].replace(/"/g, '').split(',');
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        // Handle basic commas inside quotes natively if PapaParse is absent
        const row = lines[i];
        if (!row) continue;
        
        let inQuotes = false;
        let cVal = '';
        const values = [];
        
        for (let j = 0; j < row.length; j++) {
            const char = row[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(cVal);
                cVal = '';
            } else {
                cVal += char;
            }
        }
        values.push(cVal);
        
        const expense = {
          id: i.toString(),
          date: values[0] || '',
          amount: parseFloat((values[1] || '0').replace(/,/g, '')),
          category: values[2] || '',
          subCategory: values[3] || '',
          mode: values[4] || '',
          remarks: values[5] || '',
          user: values[6] || ''
        };
        data.push(expense);
    }
    
    // Return reverse chronological order (newest first)
    return data.reverse();
  } catch (error) {
    console.error('Failed to fetch live expenses:', error);
    return [];
  }
};
