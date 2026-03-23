import React, { useEffect } from 'react';
import { View, SafeAreaView, StatusBar, Text } from 'react-native';
import Animated, { FadeInDown, FadeIn, runOnJS, withTiming, useSharedValue, useAnimatedStyle, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { CommonActions } from '@react-navigation/native';

const AnimatedTextWord = ({ word, index }) => {
  return (
    <Animated.Text 
      className="text-4xl font-black text-primary mx-1"
    >
      {word}
    </Animated.Text>
  );
};

const WelcomeScreen = ({ navigation }) => {
  const phrase = "Sup Bro! Lets run some numbers !";
  const words = phrase.split(" ");
  const scale = useSharedValue(0.9);

  useEffect(() => {
    // Pulse effect
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    const timer = setTimeout(() => {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    }, 4500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <StatusBar barStyle="dark-content" />
      <Animated.View style={animatedStyle} className="items-center justify-center p-8 bg-paper rounded-[40px] shadow-2xl border border-primary/20 w-11/12">
        <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center shadow-lg mb-8">
          <Text className="text-paper text-6xl font-bold">₹</Text>
        </View>
        <View className="flex-row flex-wrap justify-center">
          {words.map((word, index) => (
            <AnimatedTextWord key={`${index}-${word}`} word={word} index={index} />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
