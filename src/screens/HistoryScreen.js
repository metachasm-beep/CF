import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { X, Wallet, SearchX } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import { fetchExpenses } from '../services/api';
import { LineGraph } from 'react-native-graph';

const { width } = Dimensions.get('window');
const GRAPH_RANGES = ['Weekly', 'Monthly', 'Annual'];

// Helper to convert DD/MM/YYYY or MM/DD/YYYY to Date Object safely
const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      if (parseInt(parts[0]) > 12) return new Date(parts[2], parts[1] - 1, parts[0]);
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
  }
  return new Date(dateStr);
};

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graphRange, setGraphRange] = useState('Monthly');

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

  const chartData = useMemo(() => {
    if (history.length === 0) return [{ date: new Date(), value: 0 }];
    
    // Convert string dates into unified timeline map
    const validData = history.map(h => ({
      date: parseDateString(h.date),
      value: Number(h.amount) || 0
    })).sort((a,b) => a.date - b.date);

    // Provide dynamic timeline cutoffs based on toggled range state
    const now = new Date();
    const cutoff = new Date();
    if (graphRange === 'Weekly') cutoff.setDate(now.getDate() - 7);
    if (graphRange === 'Monthly') cutoff.setDate(now.getDate() - 30);
    if (graphRange === 'Annual') cutoff.setFullYear(now.getFullYear() - 1);

    const filtered = validData.filter(d => d.date >= cutoff);
    if (filtered.length === 0) return [{ date: new Date(), value: 0 }];

    // Grouping by Date string to prevent duplicate X-axis crashing
    const grouped = {};
    filtered.forEach(d => {
      const k = d.date.toDateString();
      if(!grouped[k]) grouped[k] = 0;
      grouped[k] += d.value;
    });

    const parsed = Object.keys(grouped).map(d => ({ date: new Date(d), value: grouped[d] }));
    return parsed.length > 1 ? parsed : [{ date: new Date(now.setDate(now.getDate()-1)), value: 0 }, ...parsed];
  }, [history, graphRange]);

  const renderHeader = () => (
    <View className="mb-4">
      {/* Analytics Graph Block */}
      <View className="mb-6 items-center">
        <LineGraph 
          points={chartData}
          animated={true}
          color="#14B8A6"
          gradientFillColors={['rgba(20, 184, 166, 0.4)', 'rgba(20, 184, 166, 0)']}
          style={{ width: width - 48, height: 220 }}
          enableFadeInMask={true}
          enablePanGesture={true}
        />
      </View>

      {/* Toggles */}
      <View className="flex-row justify-between bg-paper p-1 rounded-xl shadow-sm mb-6 border border-border">
        {GRAPH_RANGES.map(range => {
          const isActive = graphRange === range;
          return (
            <TouchableOpacity 
              key={range}
              className={`flex-1 py-2 rounded-lg items-center ${isActive ? 'bg-primary' : ''}`}
              onPress={() => setGraphRange(range)}
            >
              <Text className={`font-semibold ${isActive ? 'text-white' : 'text-text'}`}>
                {range}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-xl font-bold text-text mb-2">Transactions</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 pt-6 px-6">
        {/* Navigation Drop Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2" accessibilityLabel="Go back">
            <X size={28} color="#1D1D1F" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text">History & Analytics</Text>
          <View className="w-10" />
        </View>

        {/* Content Body */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F766E" />
          </View>
        ) : (
          <FlashList
            data={history}
            ListHeaderComponent={renderHeader}
            estimatedItemSize={90}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="bg-paper p-8 rounded-apple border border-border items-center justify-center shadow-sm">
                <SearchX size={48} color="#86868B" className="mb-4" />
                <Text className="text-muted text-center text-lg">No history found.</Text>
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
