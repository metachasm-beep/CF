import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import useAuthStore from '../store/authStore';
import { LogIn } from 'lucide-react-native';

// Configure Google Sign-In with the specific Client ID if provided.
// On Android, if you don't need a server Auth Code or ID token, it natively validates against the Keystore SHA-1 natively
// and mostly uses implicit config. However, passing your web client ID is standard for `webClientId` property.
GoogleSignin.configure({
  // Only pass this if it's explicitly a Web Client ID; otherwise omit.
  // We omit it so that Google Play Services just natively authenticates the Android Client ID using SHA-1!
});

// CF Finance App Login Screen
const LoginScreen = () => {
  const { setUser } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      // userInfo structure changed in v11+, userInfo.user contains the data
      if (userInfo?.user) {
        const allowedEmails = ['metachasm@gmail.com', 'auzaarbazaar@gmail.com'];
        if (!allowedEmails.includes(userInfo.user.email)) {
          await GoogleSignin.signOut();
          Alert.alert('Access Denied', 'This app is for authorized users only.');
          setIsSigningIn(false);
          return;
        }

        setUser({
          email: userInfo.user.email,
          name: userInfo.user.name,
          picture: userInfo.user.photo
        });
      } else if (userInfo?.data?.user) { // Fallback for v13
        const allowedEmails = ['metachasm@gmail.com', 'auzaarbazaar@gmail.com'];
        if (!allowedEmails.includes(userInfo.data.user.email)) {
          await GoogleSignin.signOut();
          Alert.alert('Access Denied', 'This app is for authorized users only.');
          setIsSigningIn(false);
          return;
        }

        setUser({
          email: userInfo.data.user.email,
          name: userInfo.data.user.name,
          picture: userInfo.data.user.photo
        });
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        Alert.alert('Error', 'Play services not available');
      } else {
        Alert.alert('Sign-In Error', error.message || 'An unknown error occurred');
        console.error(error);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <StatusBar barStyle="dark-content" />
      <View className="w-full max-w-sm px-8">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-lg mb-6">
            <Text className="text-paper text-5xl font-bold">{"\u20B9"}</Text>
          </View>
          <Text className="text-3xl font-bold text-text mb-2">Welcome Back</Text>
          <Text className="text-muted text-center">Please sign in to manage your finances securely.</Text>
        </View>
        
        <TouchableOpacity 
          className={`flex-row items-center justify-center p-4 rounded-apple border mt-4 ${isSigningIn ? 'bg-gray-200 border-gray-300' : 'bg-paper border-border active:bg-gray-50'}`}
          onPress={signIn}
          disabled={isSigningIn}
        >
          <LogIn size={20} color={isSigningIn ? "#9CA3AF" : "#1D1D1F"} className="mr-3" />
          <Text className={`font-semibold text-lg ${isSigningIn ? 'text-gray-400' : 'text-text'}`}>
            {isSigningIn ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
        
        <Text className="text-muted text-xs text-center mt-8">
          Restricted access for authorized personnel only.
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
