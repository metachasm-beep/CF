import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { X, Wallet, SearchX, Briefcase, HardHat, UserCheck } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import { useFocusEffect } from '@react-navigation/native';
import { Easing } from 'react-native-reanimated';
import { fetchExpenses } from '../services/api';
import { LineGraph } from 'react-native-graph';

const { width } = Dimensions.get('window');
const GRAPH_RANGES = ['Today', 'Weekly', 'Monthly', 'Annual'];

// Helper to convert DD/MM/YYYY or MM/DD/YYYY to Date Object safely
const parseDateString = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      // Check if it's DD/MM/YYYY or MM/DD/YYYY
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
    const now = new Date();
    const todayStr = now.toDateString();

    if (history.length === 0) return [{ date: now, value: 0 }];
    
    // Convert string dates into unified timeline map
    const validData = history.map(h => ({
      date: parseDateString(h.date),
      value: Number(h.amount) || 0
    })).sort((a,b) => a.date - b.date);

    if (graphRange === 'Today') {
      const totalToday = validData
        .filter(d => d.date.toDateString() === todayStr)
        .reduce((sum, d) => sum + d.value, 0);
      
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      return [
        { date: startOfDay, value: 0 },
        { date: now, value: totalToday }
      ];
    }

    // Provide dynamic timeline cutoffs based on toggled range state
    const cutoff = new Date();
    if (graphRange === 'Weekly') cutoff.setDate(now.getDate() - 7);
    if (graphRange === 'Monthly') cutoff.setDate(now.getDate() - 30);
    if (graphRange === 'Annual') cutoff.setFullYear(now.getFullYear() - 1);

    const filtered = validData.filter(d => d.date >= cutoff);
    if (filtered.length === 0) {
      const start = new Date(cutoff);
      return [{ date: start, value: 0 }, { date: now, value: 0 }];
    }

    // Grouping by Date string to prevent duplicate X-axis crashing
    const grouped = {};
    filtered.forEach(d => {
      const k = d.date.toDateString();
      if(!grouped[k]) grouped[k] = 0;
      grouped[k] += d.value;
    });

    const parsed = Object.keys(grouped).map(d => ({ date: new Date(d), value: grouped[d] }));
    const sorted = parsed.sort((a, b) => a.date - b.date);
    const yesterday = new Date(now.getTime() - 86400000);
    return sorted.length > 1 ? sorted : [{ date: yesterday, value: 0 }, ...sorted];
  }, [history, graphRange]);

  const [selectedPoint, setSelectedPoint] = useState(null);

  const stats = useMemo(() => {
    if (chartData.length <= 1 && chartData[0].value === 0) return { total: 0, peak: 0 };
    const total = chartData.reduce((sum, p) => sum + p.value, 0);
    const peak = Math.max(...chartData.map(p => p.value));
    return { total, peak };
  }, [chartData]);

  const renderHeader = () => (
    <View className="mb-4">
      {/* Analytics Summary */}
      <View className="flex-row justify-between items-end mb-6 px-1">
        <View>
          <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-1">Expense Trend</Text>
          <Text className="text-3xl font-black text-text tracking-tighter">
            {"\u20B9"}{stats.total.toLocaleString()}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-1">Peak Daily</Text>
          <Text className="text-xl font-bold text-teal-600 tracking-tight">
            {"\u20B9"}{stats.peak.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Analytics Graph Block */}
      <View className="mb-6 items-center">
        {selectedPoint && (
          <View className="absolute top-0 z-10 bg-paper/90 px-4 py-2 rounded-2xl border border-primary/20 shadow-sm items-center">
            <Text className="text-primary font-black text-lg">{"\u20B9"}{selectedPoint.value.toLocaleString()}</Text>
            <Text className="text-muted text-[10px] font-bold uppercase">{selectedPoint.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
          </View>
        )}
        <MotiView
          key={graphRange}
          from={{ opacity: 0, scale: 0.9, translateY: 10 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800, easing: Easing.out(Easing.quad) }}
        >
          <LineGraph 
            points={chartData}
            animated={true}
            color="#14B8A6"
            gradientFillColors={['rgba(20, 184, 166, 0.4)', 'rgba(20, 184, 166, 0)']}
            style={{ width: width - 48, height: 220 }}
            enableFadeInMask={true}
            enablePanGesture={true}
            onPointSelected={(p) => setSelectedPoint(p)}
            onGestureEnd={() => setSelectedPoint(null)}
          />
        </MotiView>
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
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ExpenseDetails', { expense: tx })}
                className="bg-paper p-5 rounded-[28px] border border-systemGray6 flex-row items-center mb-4 shadow-sm active:bg-systemGray6 active:scale-[0.99]"
              >
                <View className="w-14 h-14 bg-systemGray6 rounded-[20px] items-center justify-center mr-4">
                  {tx.category === 'Business Expenses' ? <Briefcase size={24} color="#007AFF" /> :
                   tx.category === 'Site Expenses' ? <HardHat size={24} color="#FF9500" /> :
                   <UserCheck size={24} color="#34C759" />}
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-[17px] leading-tight mb-1" numberOfLines={1}>
                    {tx.expenseHead || tx.subCategory || "Misc Expense"}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-muted text-[11px] font-bold uppercase tracking-wider">
                      {tx.subCategory}
                    </Text>
                    <View className="w-1 h-1 rounded-full bg-systemGray4 mx-2" />
                    <Text className="text-muted text-[11px] font-bold uppercase tracking-wider">
                      {tx.mode}
                    </Text>
                  </View>
                  {tx.remarks ? (
                    <Text className="text-[#8E8E93] text-[12px] mt-2 font-medium" numberOfLines={2}>
                      "{tx.remarks}"
                    </Text>
                  ) : null}
                </View>
                <View className="items-end ml-2">
                  <Text className="font-bold text-text text-lg tracking-tight">{"\u20B9"}{(Number(tx.amount) || 0).toLocaleString()}</Text>
                  <Text className="text-[#8E8E93] text-[10px] font-medium mt-1">{tx.date}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
