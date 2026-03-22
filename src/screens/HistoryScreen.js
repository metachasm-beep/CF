import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { ArrowLeft, Clock } from 'lucide-react-native';

const HistoryScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row items-center mb-8">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2 mr-4"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the Home screen"
          >
            <ArrowLeft size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text">Transaction History</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <View className="w-20 h-20 bg-paper rounded-full items-center justify-center border border-border mb-4">
            <Clock size={32} color="#86868B" />
          </View>
          <Text className="text-xl font-bold text-text mb-2">No History Yet</Text>
          <Text className="text-muted text-center max-w-[250px]">
            Your past transactions will appear here once you start adding expenses.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
