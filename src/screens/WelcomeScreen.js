import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, StatusBar, Text, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { CommonActions } from '@react-navigation/native';
import { MotiView, MotiText } from 'moti';
import Aurora from '../components/Aurora';
import { ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after animations complete
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <Aurora />
      
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-10">
          {/* Brand Icon */}
          <MotiView
            from={{ opacity: 0, scale: 0.5, rotate: '-10deg' }}
            animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
            transition={{ type: 'spring', damping: 15, delay: 200 }}
            className="w-24 h-24 bg-primary rounded-[32px] items-center justify-center shadow-2xl mb-12 border border-white/20"
          >
            <Text className="text-white text-6xl font-black">{"\u20B9"}</Text>
          </MotiView>

          {/* Staggered Branding Text */}
          <View className="items-center mb-16">
            <MotiText
              from={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'timing', duration: 800, delay: 500 }}
              className="text-white/40 text-[10px] font-black uppercase tracking-[12px] mb-6 text-center mr-[-12px]"
            >
              CHIRAG'S PRIVATE
            </MotiText>
            
            <MotiView className="items-center">
              <MotiText
                from={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'timing', duration: 800, delay: 800 }}
                className="text-white text-5xl font-light tracking-[-2px] text-center"
                style={{ fontFamily: 'serif' }}
              >
                Welcome Back
              </MotiText>
              <MotiText
                from={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'timing', duration: 800, delay: 1000 }}
                className="text-primary text-7xl font-black tracking-[-4px] text-center mt-[-10px]"
              >
                Chirag
              </MotiText>
            </MotiView>
          </View>

          {/* Glassmorphism Action Button */}
          <View className="w-full absolute bottom-16 items-center px-10">
            {showButton && (
              <MotiView
                from={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 12 }}
                className="w-full"
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={handleStart}
                  className="w-full bg-white/10 border border-white/20 h-18 rounded-[24px] flex-row items-center justify-between px-8 py-5 shadow-2xl overflow-hidden"
                  style={{ backdropFilter: 'blur(20px)' }}
                >
                  <Text className="text-white text-xl font-bold tracking-tight">Get Started</Text>
                  <View className="bg-primary p-2 rounded-xl">
                    <ChevronRight size={24} color="white" strokeWidth={3} />
                  </View>
                </TouchableOpacity>
              </MotiView>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default WelcomeScreen;
