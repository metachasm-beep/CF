import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import LoginScreen from '../screens/LoginScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import useAuthStore from '../store/authStore';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return null; // or Splash screen
  }
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Projects" component={ProjectsScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
