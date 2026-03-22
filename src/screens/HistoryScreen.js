import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { X, Wallet, SearchX } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { fetchExpenses } from '../services/api';

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadHistory = async () => {
        setLoading(true);
        const data = await fetchExpenses();
        setHistory(data);
        setLoading(false);
      };
      
      loadHistory();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 pt-6 px-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2" accessibilityLabel="Go back">
            <X size={28} color="#1D1D1F" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text">Transaction History</Text>
          <View className="w-10" />
        </View>

        {/* Content */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F766E" />
          </View>
        ) : (
          <FlashList
            data={history}
            estimatedItemSize={90}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="bg-paper p-8 rounded-apple border border-border items-center justify-center shadow-sm">
                <SearchX size={48} color="#86868B" className="mb-4" />
                <Text className="text-muted text-center text-lg">No history found.</Text>
                <Text className="text-muted text-center text-sm mt-2">Your synced transactions will appear here.</Text>
              </View>
            }
            renderItem={({ item: tx }) => (
              <View className="bg-paper p-5 rounded-apple border border-border flex-row items-center mb-4 shadow-sm">
                <View className="w-12 h-12 bg-background rounded-2xl items-center justify-center mr-4">
                  <Wallet size={24} color="#1D1D1F" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-lg">{tx.remarks || tx.subCategory}</Text>
                  <Text className="text-muted text-sm">{tx.category} • {tx.mode}</Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-text text-lg mb-1">₹{tx.amount ? tx.amount.toLocaleString() : '0'}</Text>
                  <Text className="text-muted text-xs">{tx.date}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
