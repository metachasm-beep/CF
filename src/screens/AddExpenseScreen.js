import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, Alert, Platform, Modal, 
  KeyboardAvoidingView, Keyboard
} from 'react-native';
import { X, ChevronDown, Check, DollarSign, Edit3, CreditCard, Tag } from 'lucide-react-native';
import { EXPENSE_CATEGORIES, SUB_CATEGORIES, PAYMENT_MODES } from '../utils/categories';
import { saveExpense } from '../services/api';
import useAuthStore from '../store/authStore';

const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subCategory: '',
    remarks: '',
    mode: 'Direct',
  });

  const [activeSelector, setActiveSelector] = useState(null); // 'category' | 'subCategory' | 'mode'

  const availableSubCategories = formData.category ? EXPENSE_CATEGORIES[formData.category] || [] : [];
  
  // Custom Detail/Specific Sub-Categories mapping
  const detailSubCategories = formData.subCategory ? SUB_CATEGORIES[formData.subCategory] || [] : [];

  const handleSave = async () => {
    if (!formData.amount || !formData.category || !formData.subCategory || !formData.remarks) {
      Alert.alert("Missing Fields", "Please fill in all mandatory fields including Remarks.");
      return;
    }

    try {
      const payload = {
        ...formData,
        date: new Date().toLocaleDateString(),
        user: user?.email,
      };
      
      await saveExpense(payload);
      Alert.alert("Success", "Expense added successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save expense. Please try again.");
    }
  };

  const renderSelectorModal = () => {
    if (!activeSelector) return null;

    let options = [];
    let title = "";
    let selectedValue = "";
    let onSelect = (val) => {};

    if (activeSelector === 'category') {
      options = Object.keys(EXPENSE_CATEGORIES);
      title = "Select Category";
      selectedValue = formData.category;
      onSelect = (val) => setFormData({ ...formData, category: val, subCategory: '' });
    } else if (activeSelector === 'subCategory') {
      options = availableSubCategories;
      title = "Select Head";
      selectedValue = formData.subCategory;
      onSelect = (val) => setFormData({ ...formData, subCategory: val });
    } else if (activeSelector === 'mode') {
      options = PAYMENT_MODES;
      title = "Payment Mode";
      selectedValue = formData.mode;
      onSelect = (val) => setFormData({ ...formData, mode: val });
    }

    return (
      <Modal visible={true} transparent={true} animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-paper rounded-t-[32px] p-8 min-h-[400px]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-text">{title}</Text>
              <TouchableOpacity onPress={() => setActiveSelector(null)} className="p-2">
                <X size={24} color="#1D1D1F" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity 
                  key={option} 
                  className={`flex-row items-center justify-between p-5 rounded-apple mb-3 ${selectedValue === option ? 'bg-primary/10 border border-primary' : 'bg-background'}`}
                  onPress={() => {
                    onSelect(option);
                    setActiveSelector(null);
                  }}
                >
                  <Text className={`text-lg ${selectedValue === option ? 'text-primary font-bold' : 'text-text'}`}>
                    {option}
                  </Text>
                  {selectedValue === option && <Check size={20} color="#0F766E" />}
                </TouchableOpacity>
              ))}
              <View className="h-12" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-8">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <X size={28} color="#1D1D1F" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-text">New Expense</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text className="text-primary font-bold text-lg">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Amount Input */}
            <View className="items-center mb-10">
              <Text className="text-muted text-sm mb-2">AMOUNT</Text>
              <View className="flex-row items-baseline">
                <Text className="text-text text-4xl mr-2">₹</Text>
                <TextInput 
                  className="text-text text-6xl font-black min-w-[200px] text-center"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(val) => setFormData({ ...formData, amount: val })}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Form Fields */}
            <View className="gap-6">
              {/* Category Dropdown */}
              <View>
                <Text className="text-muted text-xs font-bold mb-3 uppercase tracking-widest ml-1">Main Category</Text>
                <TouchableOpacity 
                  className="bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50"
                  onPress={() => setActiveSelector('category')}
                >
                  <View className="flex-row items-center">
                    <Tag size={20} color="#0F766E" className="mr-3" />
                    <Text className={`text-lg ${formData.category ? 'text-text' : 'text-muted'}`}>
                      {formData.category || "Select Main Category"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#86868B" />
                </TouchableOpacity>
              </View>

              {/* Sub-Category Dropdown */}
              <View>
                <Text className="text-muted text-xs font-bold mb-3 uppercase tracking-widest ml-1">Sub-Category / Head</Text>
                <TouchableOpacity 
                  className={`bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50 ${!formData.category && 'opacity-50'}`}
                  onPress={() => formData.category && setActiveSelector('subCategory')}
                  disabled={!formData.category}
                >
                  <View className="flex-row items-center">
                    <Tag size={20} color="#14B8A6" className="mr-3" />
                    <Text className={`text-lg ${formData.subCategory ? 'text-text' : 'text-muted'}`}>
                      {formData.subCategory || "Select Expense Head"}
                    </Text>
                  </View>
                  <ChevronDown size={20} color="#86868B" />
                </TouchableOpacity>
              </View>

              {/* Payment Mode */}
              <View>
                <Text className="text-muted text-xs font-bold mb-3 uppercase tracking-widest ml-1">Mode of Payment</Text>
                <TouchableOpacity 
                  className="bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50"
                  onPress={() => setActiveSelector('mode')}
                >
                  <View className="flex-row items-center">
                    <CreditCard size={20} color="#0369A1" className="mr-3" />
                    <Text className="text-lg text-text">{formData.mode}</Text>
                  </View>
                  <ChevronDown size={20} color="#86868B" />
                </TouchableOpacity>
              </View>

              {/* Remarks Section */}
              <View>
                <View className="flex-row justify-between mb-3 ml-1">
                  <Text className="text-muted text-xs font-bold uppercase tracking-widest">Remarks</Text>
                  <Text className="text-red-500 text-[10px] font-bold">COMPULSORY</Text>
                </View>
                <View className="bg-paper rounded-apple border border-border p-4 h-32">
                  <View className="flex-row items-start">
                    <Edit3 size={18} color="#86868B" className="mt-1 mr-3" />
                    <TextInput 
                      className="flex-1 text-lg text-text text-start h-full"
                      placeholder="Enter specific details (Vendor, material description, project name...)"
                      multiline={true}
                      value={formData.remarks}
                      onChangeText={(val) => setFormData({ ...formData, remarks: val })}
                      textAlignVertical="top"
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <View className="h-10" />
            
            <TouchableOpacity 
              className="bg-primary p-5 rounded-apple items-center mb-10 shadow-lg active:bg-teal-900"
              onPress={handleSave}
            >
              <Text className="text-white text-xl font-bold">Complete Submission</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      
      {renderSelectorModal()}
    </SafeAreaView>
  );
};

export default AddExpenseScreen;
