import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Plus, LogOut, ArrowUpRight, ArrowDownLeft, Clock, BarChart3, Receipt, Wallet } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import useAuthStore from '../store/authStore';
import { syncOfflineExpenses } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    // Safely attempt to sync offline expenses when the home screen mounts
    syncOfflineExpenses();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: logout }
      ]
    );
  };

  const renderHeader = () => (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8 pt-4">
        <View>
          <Text className="text-muted text-lg mb-1">Hello,</Text>
          <Text className="text-3xl font-bold text-text">{user?.name || 'User'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} className="bg-paper p-3 rounded-full border border-border shadow-sm">
          <LogOut size={20} color="#1D1D1F" />
        </TouchableOpacity>
      </View>

      {/* Summary Bento Grid */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-primary p-5 rounded-3xl shadow-md min-h-[160px] justify-between">
          <View className="flex-row justify-between items-start">
            <View className="bg-white/20 p-2 rounded-xl">
              <ArrowDownLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <BarChart3 size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-white/70 text-sm mb-1">Total Expenses</Text>
            <Text className="text-white text-3xl font-bold">₹0</Text>
          </View>
        </View>
        
        <View className="flex-1 bg-paper p-5 rounded-3xl border border-border min-h-[160px] justify-between shadow-apple">
          <View className="flex-row justify-between items-start">
            <View className="bg-secondary/10 p-2 rounded-xl">
              <ArrowUpRight size={20} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Receipt size={20} color="#1D1D1F" />
          </View>
          <View>
            <Text className="text-muted text-sm mb-1">Active Projects</Text>
            <Text className="text-text text-3xl font-bold">0</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-4 mb-8">
        <TouchableOpacity 
          className="flex-1 bg-paper p-4 rounded-apple border border-border items-center justify-center flex-row gap-2 active:bg-gray-50 shadow-sm"
          onPress={() => navigation.navigate('AddExpense')}
          accessibilityLabel="View previous expenses"
          accessibilityHint="Navigates to the Add Expense screen"
        >
          <Plus size={18} color="#0F766E" strokeWidth={2.5} />
          <Text className="font-semibold text-primary">Add New</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 bg-paper p-4 rounded-apple border border-border items-center justify-center flex-row gap-2 active:bg-gray-50 shadow-sm"
          onPress={() => navigation.navigate('History')}
          accessibilityLabel="View past transactions"
          accessibilityHint="Navigates to the History screen"
        >
          <Clock size={18} color="#1D1D1F" strokeWidth={2.5} />
          <Text className="font-semibold text-text">History</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Section Label */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-xl font-bold text-text">Recent Expenses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text className="text-primary font-semibold">See All</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-6">
        <FlashList
          data={recentTransactions}
          ListHeaderComponent={renderHeader}
          estimatedItemSize={90}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="bg-paper p-6 rounded-apple border border-border items-center justify-center shadow-sm">
              <Text className="text-muted text-center italic">No recent transactions recorded yet.</Text>
            </View>
          }
          renderItem={({ item: tx }) => (
            <View className="bg-paper p-5 rounded-apple border border-border flex-row items-center mb-4 shadow-sm">
              <View className="w-12 h-12 bg-background rounded-2xl items-center justify-center mr-4">
                <Wallet size={24} color="#1D1D1F" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-text text-lg">{tx.title}</Text>
                <Text className="text-muted text-sm">{tx.category}</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-text text-lg mb-1">₹{tx.amount.toLocaleString()}</Text>
                <Text className="text-muted text-xs">{tx.date}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
