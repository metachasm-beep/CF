import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, Alert, Platform, Modal, 
  KeyboardAvoidingView, Image, Dimensions
} from 'react-native';
import { X, ChevronDown, Check, Edit3, CreditCard, Tag, Camera as CameraIcon, Image as ImageIcon } from 'lucide-react-native';
import { EXPENSE_CATEGORIES, SUB_CATEGORIES, PAYMENT_MODES } from '../utils/categories';
import { saveExpense } from '../services/api';
import useAuthStore from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import Carousel from 'react-native-reanimated-carousel';

const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = Dimensions.get('window');

const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subCategory: '',
    remarks: '',
    mode: 'Direct',
  });

  const [images, setImages] = useState([]);
  const [activeSelector, setActiveSelector] = useState(null); // 'category' | 'subCategory' | 'mode'
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const availableSubCategories = formData.category ? EXPENSE_CATEGORIES[formData.category] || [] : [];
  
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted' || mediaStatus.status !== 'granted') {
        Alert.alert('Permissions required', 'Camera and gallery permissions are required to save receipts.');
      }
    })();
  }, []);

  const handleTakeReceipt = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        // Save securely to phone gallery
        const asset = await MediaLibrary.createAssetAsync(uri);
        setImages([...images, asset.uri]);
        Alert.alert('Success', 'Receipt captured and saved to phone gallery!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to take or save the photo.');
    }
  };

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
          <View className="bg-paper rounded-t-[32px] p-8 min-h-[400px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-text">{title}</Text>
              <TouchableOpacity onPress={() => setActiveSelector(null)} className="p-2" accessibilityLabel="Close selector" accessibilityHint="Closes the selection modal">
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
                  accessibilityLabel={`Select ${option}`}
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

  const render3DImageModal = () => {
    return (
      <Modal visible={imageModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/90 justify-center items-center">
            <TouchableOpacity 
              className="absolute top-16 right-6 z-50 bg-white/20 p-3 rounded-full" 
              onPress={() => setImageModalVisible(false)}
              accessibilityLabel="Close 3D slider"
            >
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            
            {images.length > 0 ? (
              <Carousel
                loop
                width={PAGE_WIDTH * 0.85}
                height={PAGE_HEIGHT * 0.6}
                data={images}
                mode="parallax" // 3D aesthetic modal slider!
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 50,
                }}
                renderItem={({ item }) => (
                  <View className="flex-1 rounded-[32px] overflow-hidden shadow-2xl items-center justify-center bg-[#1D1D1F]">
                    <Image source={{ uri: item }} className="w-full h-full" resizeMode="cover" />
                  </View>
                )}
              />
            ) : (
              <Text className="text-white/60 font-medium">No receipts attached yet.</Text>
            )}
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
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2" accessibilityLabel="Go back">
              <X size={28} color="#1D1D1F" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-text">New Expense</Text>
            <TouchableOpacity onPress={handleSave} accessibilityLabel="Save expense">
              <Text className="text-primary font-bold text-lg">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Amount Input */}
            <View className="items-center mb-10">
              <Text className="text-muted text-sm mb-2 font-bold tracking-widest">AMOUNT</Text>
              <View className="flex-row items-baseline">
                <Text className="text-text text-4xl mr-2 font-light">₹</Text>
                <TextInput 
                  className="text-text text-6xl font-black min-w-[150px] text-center"
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(val) => setFormData({ ...formData, amount: val })}
                  autoFocus={true}
                  accessibilityLabel="Expense Amount"
                />
              </View>
            </View>

            {/* Smart Actions */}
            <View className="flex-row justify-center gap-4 mb-8">
              <TouchableOpacity 
                className="bg-paper px-5 py-3 rounded-full border border-border flex-row items-center shadow-sm active:bg-gray-50"
                onPress={handleTakeReceipt}
                accessibilityLabel="Take a photo of receipt"
                accessibilityHint="Opens camera and safely saves receipt image to your phone gallery"
              >
                <CameraIcon size={18} color="#0F766E" className="mr-2" />
                <Text className="font-semibold text-primary">Scan Receipt</Text>
              </TouchableOpacity>
              
              {images.length > 0 && (
                <TouchableOpacity 
                  className="bg-primary/10 px-5 py-3 rounded-full border border-primary/20 flex-row items-center active:bg-primary/20"
                  onPress={() => setImageModalVisible(true)}
                  accessibilityLabel="View attached receipts"
                  accessibilityHint="Opens a 3D slider of saved images"
                >
                  <ImageIcon size={18} color="#0F766E" className="mr-2" />
                  <Text className="font-semibold text-primary">View ({images.length})</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Form Fields */}
            <View className="gap-6">
              {/* Category Dropdown */}
              <View>
                <Text className="text-muted text-xs font-bold mb-3 uppercase tracking-widest ml-1">Main Category</Text>
                <TouchableOpacity 
                  className="bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50 shadow-sm"
                  onPress={() => setActiveSelector('category')}
                  accessibilityLabel="Select Main Category"
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
                  className={`bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50 shadow-sm ${!formData.category && 'opacity-50'}`}
                  onPress={() => formData.category && setActiveSelector('subCategory')}
                  disabled={!formData.category}
                  accessibilityLabel="Select Expense Sub-Category"
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
                  className="bg-paper p-5 rounded-apple border border-border flex-row items-center justify-between active:bg-gray-50 shadow-sm"
                  onPress={() => setActiveSelector('mode')}
                  accessibilityLabel="Select Payment Mode"
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
                  <Text className="text-red-500 text-[10px] font-bold tracking-widest">COMPULSORY</Text>
                </View>
                <View className="bg-paper rounded-apple border border-border p-4 h-32 shadow-sm">
                  <View className="flex-row items-start">
                    <Edit3 size={18} color="#86868B" className="mt-1 mr-3" />
                    <TextInput 
                      className="flex-1 text-lg text-text text-start h-full"
                      placeholder="Enter specific details (Vendor, materials...)"
                      multiline={true}
                      value={formData.remarks}
                      onChangeText={(val) => setFormData({ ...formData, remarks: val })}
                      textAlignVertical="top"
                      accessibilityLabel="Transaction Remarks"
                      accessibilityHint="Mandatory field to describe the exact justification."
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <View className="h-8" />
            
            <TouchableOpacity 
              className="bg-primary p-5 rounded-apple items-center mb-10 shadow-[0_8px_30px_rgba(15,118,110,0.3)] active:bg-teal-900"
              onPress={handleSave}
              accessibilityLabel="Complete Expense Submission"
            >
              <Text className="text-white text-xl font-bold tracking-wide">Complete Submission</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      
      {renderSelectorModal()}
      {render3DImageModal()}
    </SafeAreaView>
  );
};

export default AddExpenseScreen;
