import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  setUser: (user) => {
    // Restricted users only
    const allowedEmails = ['metachasm@gmail.com', 'auzaarbazaar@gmail.com', 'paullovessoccer@gmail.com'];
    if (user && allowedEmails.includes(user.email)) {
      set({ user, isAuthenticated: true, isLoading: false });
      SecureStore.setItemAsync('user', JSON.stringify(user));
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
      SecureStore.deleteItemAsync('user');
    }
  },
  
  logout: () => {
    set({ user: null, isAuthenticated: false, isLoading: false });
    SecureStore.deleteItemAsync('user');
  },
  
  checkAuth: async () => {
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;
