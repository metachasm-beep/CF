import axios from 'axios';

// SpreadSheet ID: 17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k

const SPREADSHEET_ID = '17BmDP2w1T_NgadN2f751KpYEMquNQk7EdXHJegylE8k';

const API_URL = 'https://script.google.com/macros/s/AKfycbzCkN_J7ugWfEoUcjkO1ajTSQYspDd5gARsss9xOH4d3culb4hK-sbS7d2i1UfS5asY/exec'; 

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
