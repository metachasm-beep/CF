import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import useAuthStore from '../store/authStore';
import { LogIn } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

// CF Finance App Login Screen
const LoginScreen = () => {
  const { setUser } = useAuthStore();
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '1044924967725-6rv3ipv1gg6aovpo0usm6hp81fjq9eog.apps.googleusercontent.com',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    webClientId: '1044924967725-6rv3ipv1gg6aovpo0usm6hp81fjq9eog.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      // Fetch user info from Google API
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
      .then(res => res.json())
      .then(user => {
        setUser(user);
      })
      .catch(err => {
        console.error('Error fetching user info:', err);
      });
    }
  }, [response]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <StatusBar barStyle="dark-content" />
      <View className="w-full max-w-sm px-8">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center shadow-lg mb-6">
            <Text className="text-paper text-4xl font-bold">CF</Text>
          </View>
          <Text className="text-3xl font-bold text-text mb-2">Welcome Back</Text>
          <Text className="text-muted text-center">Please sign in to manage your finances securely.</Text>
        </View>
        
        <TouchableOpacity 
          className="flex-row items-center justify-center bg-paper p-4 rounded-apple border border-border mt-4 active:bg-gray-50"
          onPress={() => promptAsync()}
          disabled={!request}
        >
          {/* <Image 
            source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} 
            className="w-6 h-6 mr-3"
          /> */}
          <LogIn size={20} color="#1D1D1F" className="mr-3" />
          <Text className="text-text font-semibold text-lg">Continue with Google</Text>
        </TouchableOpacity>
        
        <Text className="text-muted text-xs text-center mt-8">
          Restricted access for authorized personnel only.
        </Text>
      </View>
    </View>
  );
};

export default LoginScreen;
