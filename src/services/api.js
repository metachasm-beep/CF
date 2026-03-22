import axios from 'axios';

// SpreadSheet ID: 17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k

const SPREADSHEET_ID = '17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k';

// Recomended: Use a Google Apps Script (Web App) as a backend for personal spreadsheets
// to avoid exposing Google API Keys or managing complex OAuth in client
const API_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; 

export const saveExpense = async (data) => {
  try {
    // If using Google Apps Script Web App
    if (API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
      const response = await axios.post(API_URL, data);
      return response.data;
    }
    
    // Fallback: If using direct Google Sheets API (requires API Key)
    // const response = await axios.post(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`, {
    //   values: [[data.date, data.amount, data.category, data.subCategory, data.mode, data.remarks, data.user]]
    // });
    // return response.data;
    
    console.warn('API URL not configured. Data:', data);
    return { success: true, mock: true };
  } catch (error) {
    console.error('Error saving expense:', error);
    throw error;
  }
};
