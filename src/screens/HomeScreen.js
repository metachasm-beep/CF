import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Plus, LogOut, ArrowUpRight, ArrowDownLeft, Clock, BarChart3, Receipt, Wallet, Briefcase, HardHat, UserCheck } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from '@react-navigation/native';
import useAuthStore from '../store/authStore';
import { syncOfflineExpenses, fetchExpenses } from '../services/api';
import { MotiView, AnimatePresence } from 'moti';
import CardSwap from '../components/CardSwap';
import AnimatedList from '../components/AnimatedList';
import Papa from 'papaparse';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [activeProjectCount, setActiveProjectCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        setIsRefreshing(true);
        // Safely attempt to sync offline expenses when the home screen mounts
        await syncOfflineExpenses();
        
        // Fetch Live Sheets Data
        const expenses = await fetchExpenses();
        setRecentTransactions(expenses.slice(0, 10)); // Top 10 recent
        
        // Calculate Totals
        const total = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
        setTotalExpense(total);
        
        // Calculate Unique Projects (Sub-Categories under Site Expenses)
        const siteProjects = new Set(
          expenses.filter(i => i.category === 'Site Expenses' && i.subCategory).map(i => i.subCategory)
        );
        setActiveProjectCount(siteProjects.size);
        
        setIsRefreshing(false);
      };
      
      loadData();
    }, [])
  );

  const handleGenerateReport = async () => {
    try {
      // Fetch all expenses for report
      const expenses = await fetchExpenses();
      if (expenses.length === 0) {
        Alert.alert('No Data', 'There are no transactions to export.');
        return;
      }

      // Generate CSV using PapaParse
      const csvData = expenses.map(t => ({
        Date: t.date,
        Amount: t.amount,
        Category: t.category,
        'Sub-Category': t.subCategory,
        'Expense Head': t.expenseHead,
        'Payment Mode': t.paymentMode,
        Remarks: t.remarks || ''
      }));

      const csvString = Papa.unparse(csvData);
      const rowCount = expenses.length;
      const totalAmount = expenses.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0).toFixed(2);

      Alert.alert(
        'Report Generated',
        `Succesfully compiled ${rowCount} transactions.\nTotal Value: {"\u20B9"}${Number(totalAmount).toLocaleString()}\n\nCSV Preview (First 150 chars):\n${csvString.substring(0, 150)}...`,
        [
          { text: 'Share Report', onPress: () => Alert.alert('Simulated Save', 'In a production build, this would trigger the system share sheet for the generated .csv file.') },
          { text: 'Done' }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate report.');
    }
  };

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
        <TouchableOpacity style={styles.shadowSm} onPress={handleLogout} className="bg-paper p-3 rounded-full border border-border">
          <LogOut size={20} color="#1D1D1F" />
        </TouchableOpacity>
      </View>

      {/* Summary Bento Grid */}
      <MotiView 
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 1000 }}
        className="flex-row gap-4 mb-8"
      >
        <TouchableOpacity 
          onPress={() => navigation.navigate('History')}
          style={styles.shadowXl}
          className="flex-1 bg-primary p-6 rounded-[32px] min-h-[180px] justify-between active:scale-[0.98]"
        >
          <View className="flex-row justify-between items-start">
            <View className="bg-white/20 p-2.5 rounded-2xl">
              <ArrowDownLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <BarChart3 size={20} color="rgba(255, 255, 255, 0.6)" />
          </View>
          <View>
            <Text className="text-white/70 text-xs font-bold uppercase tracking-[1px] mb-1">Total Expenses</Text>
            <Text className="text-white text-3xl font-bold tracking-tighter">{"\u20B9"}{totalExpense.toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Projects')}
          style={styles.shadowSm}
          className="flex-1 bg-paper p-6 rounded-[32px] border border-systemGray6 min-h-[180px] justify-between active:scale-[0.98]"
        >
          <View className="flex-row justify-between items-start">
            <View className="bg-secondary/10 p-2.5 rounded-2xl">
              <ArrowUpRight size={22} color="#14B8A6" strokeWidth={2.5} />
            </View>
            <Receipt size={20} color="#8E8E93" />
          </View>
          <View>
            <Text className="text-muted text-xs font-bold uppercase tracking-[1px] mb-1">Active Projects</Text>
            <Text className="text-text text-4xl font-bold tracking-tighter">{activeProjectCount}</Text>
          </View>
        </TouchableOpacity>
      </MotiView>

      {/* Premium Card Swap Action */}
      <MotiView 
        from={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 400 }}
        className="mb-10"
      >
        <CardSwap 
          onCardClick={(index) => {
            if (index === 0) navigation.navigate('AddExpense');
            else if (index === 1) navigation.navigate('History');
            else if (index === 2) handleGenerateReport();
          }}
        >
          {/* Card 1: Add Expense */}
          <View className="flex-1 bg-teal-600 p-6 justify-between">
            <View className="flex-row justify-between items-center">
              <Plus size={32} color="white" strokeWidth={3} />
              <View className="bg-white/20 p-2 rounded-xl">
                <Text className="text-white font-bold text-xs">QUICK ACTION</Text>
              </View>
            </View>
            <View>
              <Text className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">Spreadsheet Sync</Text>
              <Text className="text-white text-3xl font-black italic">ADD EXPENSE</Text>
            </View>
          </View>

          {/* Card 2: View History */}
          <View className="flex-1 bg-slate-900 p-6 justify-between border border-slate-700">
            <View className="flex-row justify-between items-center">
              <BarChart3 size={32} color="#14B8A6" strokeWidth={2.5} />
              <View style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.2)' }} className="p-2 rounded-xl border">
                <Text className="text-teal-500 font-bold text-xs">ANALYTICS</Text>
              </View>
            </View>
            <View>
              <Text className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">Live Insights</Text>
              <Text className="text-white text-3xl font-black italic">VIEW TRENDS</Text>
            </View>
          </View>

          {/* Card 3: Download PDF */}
          <View className="flex-1 bg-indigo-600 p-6 justify-between">
            <View className="flex-row justify-between items-center">
              <Receipt size={32} color="white" strokeWidth={2.5} />
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} className="p-2 rounded-xl">
                <Text className="text-white font-bold text-xs">REPORTS</Text>
              </View>
            </View>
            <View>
              <Text className="text-white/60 text-sm font-medium uppercase tracking-widest mb-1">Monthly Audit</Text>
              <Text className="text-white text-3xl font-black italic">EXPORT REPORT</Text>
            </View>
          </View>
        </CardSwap>
      </MotiView>

      {/* Recent Transactions Section Label */}
      <View 
        className="mb-4 flex-row items-center justify-between"
      >
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
      <View className="flex-1">
        <AnimatedList
          data={recentTransactions}
          ListHeaderComponent={renderHeader}
          estimatedItemSize={90}
          onRefresh={() => {}} // Hooked into loadData internally
          refreshing={isRefreshing}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.shadowSm} className="bg-paper p-6 rounded-apple border border-border items-center justify-center">
              {isRefreshing ? (
                 <ActivityIndicator size="small" color="#0F766E" />
              ) : (
                 <Text className="text-muted text-center italic">No recent transactions recorded yet.</Text>
              )}
            </View>
          }
          renderItem={({ item: tx }) => (
            <TouchableOpacity 
              style={styles.shadowSm}
              className="bg-paper p-5 rounded-[28px] border border-systemGray6 flex-row items-center mb-4 active:bg-systemGray6 active:scale-[0.99]"
              onPress={() => navigation.navigate('ExpenseDetails', { expense: tx })}
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
              </View>
              <View className="items-end">
                <Text className="font-bold text-text text-lg tracking-tight">{"\u20B9"}{(Number(tx.amount) || 0).toLocaleString()}</Text>
                <Text className="text-[#8E8E93] text-[10px] font-medium mt-1">{tx.date}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shadowXl: {
    shadowColor: '#0F766E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  }
});

export default HomeScreen;
