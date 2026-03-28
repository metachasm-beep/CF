import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, StyleSheet, Alert } from 'react-native';
import { ChevronLeft, Share2, Trash2, Calendar, Wallet, Tag, FileText, Briefcase, HardHat, UserCheck } from 'lucide-react-native';
import { MotiView } from 'moti';

const ExpenseDetailsScreen = ({ route, navigation }) => {
  const { expense } = route.params;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Business Expenses': return <Briefcase size={28} color="#007AFF" />;
      case 'Site Expenses': return <HardHat size={28} color="#FF9500" />;
      default: return <UserCheck size={28} color="#34C759" />;
    }
  };

  const handleShare = () => {
    Alert.alert("Share", "Expense details exported successfully!");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-paper p-2 rounded-full border border-border"
          style={styles.shadowSm}
        >
          <ChevronLeft size={24} color="#1D1D1F" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text">Transaction Details</Text>
        <TouchableOpacity 
          onPress={handleShare}
          className="bg-paper p-2 rounded-full border border-border"
          style={styles.shadowSm}
        >
          <Share2 size={20} color="#1D1D1F" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Amount Hero Section */}
        <MotiView 
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="items-center justify-center py-10"
        >
          <View className="w-20 h-20 bg-paper rounded-[30px] items-center justify-center mb-4 border border-border" style={styles.shadowMd}>
            {getCategoryIcon(expense.category)}
          </View>
          <Text className="text-muted text-sm font-bold uppercase tracking-widest mb-1">{expense.category}</Text>
          <Text className="text-5xl font-black text-text tracking-tighter">{"\u20B9"}{Number(expense.amount).toLocaleString()}</Text>
        </MotiView>

        {/* Details Card */}
        <MotiView 
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200, type: 'timing', duration: 800 }}
          className="mx-6 bg-paper rounded-[32px] border border-border p-6"
          style={styles.shadowLg}
        >
          <DetailItem 
            icon={<Tag size={20} color="#8E8E93" />} 
            label="Head" 
            value={expense.expenseHead || "No Head Information"} 
          />
          <DetailItem 
            icon={<FileText size={20} color="#8E8E93" />} 
            label="Sub-Category" 
            value={expense.subCategory || "General"} 
          />
          <DetailItem 
            icon={<Wallet size={20} color="#8E8E93" />} 
            label="Payment Mode" 
            value={expense.mode} 
          />
          <DetailItem 
            icon={<Calendar size={20} color="#8E8E93" />} 
            label="Date" 
            value={expense.date} 
            isLast
          />
        </MotiView>

        {/* Remarks Section */}
        {expense.remarks && (
          <MotiView 
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400, type: 'timing', duration: 800 }}
            className="mx-6 mt-6 bg-paper rounded-[32px] border border-border p-6"
            style={styles.shadowLg}
          >
            <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">Remarks</Text>
            <Text className="text-text text-base leading-relaxed font-medium">
              {expense.remarks}
            </Text>
          </MotiView>
        )}

        {/* Action Button */}
        <MotiView 
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600, type: 'timing', duration: 800 }}
          className="mx-6 mt-10"
        >
          <TouchableOpacity 
            onPress={handleDelete}
            className="bg-red-50 py-5 rounded-[24px] flex-row items-center justify-center border border-red-100"
          >
            <Trash2 size={20} color="#FF3B30" className="mr-2" />
            <Text className="text-red-500 font-bold text-lg">Remove Transaction</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailItem = ({ icon, label, value, isLast }) => (
  <View className={`flex-row items-center py-4 ${!isLast ? 'border-b border-border/50' : ''}`}>
    <View className="w-10 h-10 bg-background rounded-xl items-center justify-center mr-4">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-muted text-[11px] font-bold uppercase tracking-wider mb-0.5">{label}</Text>
      <Text className="text-text text-base font-bold" numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  shadowSm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  shadowMd: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 6,
  }
});

export default ExpenseDetailsScreen; // Refreshed
