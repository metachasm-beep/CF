import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, Alert, Platform, Modal, 
  KeyboardAvoidingView, Image, Dimensions, StyleSheet
} from 'react-native';
import { 
  X, ChevronRight, Check, Edit3, CreditCard, Tag, 
  Camera as CameraIcon, Image as ImageIcon, Briefcase, 
  HardHat, UserCheck, Info
} from 'lucide-react-native';
import { EXPENSE_CATEGORIES, SUB_CATEGORIES, PAYMENT_MODES } from '../utils/categories';
import { saveExpense } from '../services/api';
import useAuthStore from '../store/authStore';
import AnimatedCheckmark from '../components/AnimatedCheckmark';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import Carousel from 'react-native-reanimated-carousel';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

const { width: PAGE_WIDTH, height: PAGE_HEIGHT } = Dimensions.get('window');

const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    amount: '',
    mainCategory: '',
    subCategory: '',
    expenseHead: '',
    remarks: '',
    mode: 'Direct',
  });

  const [images, setImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSelector, setActiveSelector] = useState(null); 
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ['70%', '90%'], []);
  
  // Selection Logic
  const availableSubCategories = useMemo(() => {
    return formData.mainCategory ? EXPENSE_CATEGORIES[formData.mainCategory] || [] : [];
  }, [formData.mainCategory]);

  const availableHeads = useMemo(() => {
    return formData.subCategory ? SUB_CATEGORIES[formData.subCategory] || [] : [];
  }, [formData.subCategory]);

  const hasHeads = availableHeads.length > 0;

  const handlePresentModalPress = useCallback((selector) => {
    setActiveSelector(selector);
    setSearchQuery('');
    bottomSheetModalRef.current?.present();
  }, []);
  
  const handleCloseModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);
  
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
    // Basic validation
    if (!formData.amount) { Alert.alert("Required", "Please enter an amount."); return; }
    if (!formData.mainCategory) { Alert.alert("Required", "Please select a main category."); return; }
    if (!formData.subCategory) { Alert.alert("Required", "Please select a sub-category."); return; }
    if (hasHeads && !formData.expenseHead) { Alert.alert("Required", "Please select an expense head."); return; }
    if (!formData.remarks || formData.remarks.trim().length < 3) { 
      Alert.alert("Required", "Please provide detailed remarks (min 3 characters)."); 
      return; 
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date: new Date().toLocaleDateString('en-IN'),
        amount: formData.amount,
        category: formData.mainCategory,
        subCategory: formData.subCategory,
        expenseHead: hasHeads ? formData.expenseHead : formData.subCategory, // Falls back to subCategory if no specific head
        mode: formData.mode,
        remarks: formData.remarks,
        user: user?.email,
      };
      
      await saveExpense(payload);
      setShowSuccess(true);
    } catch (error) {
      Alert.alert("Error", "Failed to save expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSelectorModal = () => {
    let options = [];
    let title = "";
    if (activeSelector === 'mainCategory') { 
      options = Object.keys(EXPENSE_CATEGORIES); 
      title = "Main Category"; 
    }
    else if (activeSelector === 'subCategory') { 
      options = availableSubCategories; 
      title = "Sub-Category"; 
    }
    else if (activeSelector === 'expenseHead') { 
      options = availableHeads; 
      title = "Expense Head"; 
    }
    else if (activeSelector === 'mode') { 
      options = PAYMENT_MODES; 
      title = "Payment Mode"; 
    }

    const filteredOptions = options.filter(opt => 
      opt.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
      ), []
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#F2F2F7', borderRadius: 32 }}
        handleIndicatorStyle={{ backgroundColor: '#D1D1D6', width: 40 }}
      >
        <BottomSheetView style={{ flex: 1, padding: 20 }}>
          <Text className="text-xl font-bold text-text mb-4 text-center">{title}</Text>
          
          <View style={styles.shadowSm} className="mb-4 flex-row items-center bg-white rounded-2xl px-4 py-2 border border-systemGray6">
            <Edit3 size={18} color="#8E8E93" className="mr-2" />
            <TextInput
              className="flex-1 text-lg text-text py-1"
              placeholder={`Search ${title.toLowerCase()}...`}
              placeholderTextColor="#AEAEB2"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Check size={18} color="#C7C7CC" />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  className="py-4 border-b border-systemGray6 flex-row justify-between items-center"
                  onPress={() => {
                  if (activeSelector === 'mainCategory') {
                    setFormData(prev => ({ ...prev, mainCategory: option, subCategory: '', expenseHead: '' }));
                  } else if (activeSelector === 'subCategory') {
                    setFormData(prev => ({ ...prev, subCategory: option, expenseHead: '' }));
                  } else {
                    setFormData(prev => ({ ...prev, [activeSelector]: option }));
                  }
                  handleCloseModal();
                }}
              >
                <Text className="text-lg text-text font-medium">{option}</Text>
                {formData[activeSelector] === option && (
                  <Check size={20} color="#0F766E" strokeWidth={3} />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View className="py-10 items-center">
              <Text className="text-muted text-lg italic">No matches found.</Text>
            </View>
          )}
          </ScrollView>
        </BottomSheetView>
      </BottomSheetModal>
    );
  };

  const render3DImageModal = () => {
    return (
      <Modal visible={imageModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/95 justify-center items-center">
            <TouchableOpacity 
              className="absolute top-16 right-6 z-50 bg-white/10 p-4 rounded-full" 
              onPress={() => setImageModalVisible(false)}
            >
              <X size={24} color="#FFF" />
            </TouchableOpacity>
            
            {images.length > 0 ? (
              <Carousel
                loop
                width={PAGE_WIDTH * 0.9}
                height={PAGE_HEIGHT * 0.7}
                data={images}
                mode="parallax"
                modeConfig={{
                  parallaxScrollingScale: 0.9,
                  parallaxScrollingOffset: 40,
                }}
                renderItem={({ item }) => (
                  <View style={styles.shadow2xl} className="flex-1 rounded-[40px] overflow-hidden items-center justify-center bg-[#1C1C1E]">
                    <Image source={{ uri: item }} className="w-full h-full" resizeMode="contain" />
                  </View>
                )}
              />
            ) : (
              <Text className="text-white/40 font-medium">No receipts attached.</Text>
            )}
        </View>
      </Modal>
    );
  };

  const getCategoryIcon = (category) => {
    if (category === "Business Expenses") return <Briefcase size={20} color="#007AFF" />;
    if (category === "Site Expenses") return <HardHat size={20} color="#FF9500" />;
    if (category === "Vendor Payments") return <UserCheck size={20} color="#34C759" />;
    return <Tag size={20} color="#8E8E93" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-4">
          {/* Apple Style Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 items-center justify-center bg-systemGray5 rounded-full"
            >
              <X size={20} color="#1D1D1F" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-text">New Transaction</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={isSubmitting}
              className={`px-4 py-2 ${isSubmitting ? 'opacity-50' : 'active:opacity-70'}`}
            >
              <Text className="text-primary font-bold text-lg">{isSubmitting ? '...' : 'Done'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Amount Input Secion */}
            <View className="items-center mb-8 py-4">
              <Text className="text-muted text-xs font-bold tracking-[2px] uppercase mb-1">Total Amount</Text>
              <View className="flex-row items-baseline">
                <Text className="text-text text-3xl font-light mr-1">{"\u20B9"}</Text>
                <TextInput 
                  className="text-text text-6xl font-semibold min-w-[120px] text-center"
                  placeholder="0"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="numeric"
                  value={formData.amount}
                  onChangeText={(val) => setFormData({ ...formData, amount: val })}
                  autoFocus={true}
                />
              </View>
            </View>

            {/* Receipt Actions */}
            <View className="flex-row justify-center gap-3 mb-8">
                <TouchableOpacity 
                style={styles.shadowSm}
                className="bg-paper px-6 py-3 rounded-full border border-systemGray5 flex-row items-center active:bg-systemGray6"
                onPress={handleTakeReceipt}
              >
                <CameraIcon size={18} color="#0F766E" className="mr-2" />
                <Text className="font-semibold text-primary">Scan</Text>
              </TouchableOpacity>
              
              {images.length > 0 && (
                <TouchableOpacity 
                  className="bg-primary/10 px-6 py-3 rounded-full border border-primary/20 flex-row items-center active:bg-primary/20"
                  onPress={() => setImageModalVisible(true)}
                >
                  <ImageIcon size={18} color="#0F766E" className="mr-2" />
                  <Text className="font-semibold text-primary">View ({images.length})</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Selection Group */}
            <View style={styles.shadowSm} className="bg-paper rounded-[24px] overflow-hidden border border-systemGray5 mb-6">
              {/* Main Category */}
              <TouchableOpacity 
                className="flex-row items-center justify-between p-5 border-b border-systemGray6 active:bg-systemGray6"
                onPress={() => handlePresentModalPress('mainCategory')}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 items-center mr-3">
                    {getCategoryIcon(formData.mainCategory)}
                  </View>
                  <View>
                    <Text className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Category</Text>
                    <Text className={`text-lg font-medium ${formData.mainCategory ? 'text-text' : 'text-muted'}`}>
                      {formData.mainCategory || "Select Category"}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#C7C7CC" />
              </TouchableOpacity>

              {/* Sub Category */}
              <TouchableOpacity 
                className={`flex-row items-center justify-between p-5 border-b border-systemGray6 active:bg-systemGray6 ${!formData.mainCategory && 'opacity-30'}`}
                onPress={() => formData.mainCategory && handlePresentModalPress('subCategory')}
                disabled={!formData.mainCategory}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 items-center mr-3">
                    <Tag size={18} color="#8E8E93" />
                  </View>
                  <View>
                    <Text className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Sub-Category</Text>
                    <Text className={`text-lg font-medium ${formData.subCategory ? 'text-text' : 'text-muted'}`}>
                      {formData.subCategory || "Select Sub-Category"}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#C7C7CC" />
              </TouchableOpacity>

              {/* Expense Head (Conditional) */}
              {hasHeads && (
                <TouchableOpacity 
                  className={`flex-row items-center justify-between p-5 border-b border-systemGray6 active:bg-systemGray6 ${!formData.subCategory && 'opacity-30'}`}
                  onPress={() => formData.subCategory && handlePresentModalPress('expenseHead')}
                  disabled={!formData.subCategory}
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-8 items-center mr-3">
                      <Check size={18} color="#8E8E93" />
                    </View>
                    <View>
                      <Text className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Expense Head</Text>
                      <Text className={`text-lg font-medium ${formData.expenseHead ? 'text-text' : 'text-muted'}`}>
                        {formData.expenseHead || "Select Expense Head"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color="#C7C7CC" />
                </TouchableOpacity>
              )}

              {/* Mode of Payment */}
              <TouchableOpacity 
                className="flex-row items-center justify-between p-5 active:bg-systemGray6"
                onPress={() => handlePresentModalPress('mode')}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-8 items-center mr-3">
                    <CreditCard size={18} color="#007AFF" />
                  </View>
                  <View>
                    <Text className="text-muted text-[10px] font-bold uppercase tracking-wider mb-0.5">Payment Mode</Text>
                    <Text className="text-lg font-medium text-text">{formData.mode}</Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#C7C7CC" />
              </TouchableOpacity>
            </View>

            {/* Remarks Section */}
            <View style={styles.shadowSm} className={`bg-paper rounded-[24px] border ${!formData.remarks && isSubmitting ? 'border-red-500 bg-red-50/50' : 'border-systemGray5'} p-6 mb-8`}>
              <View className="flex-row items-center mb-4">
                <View className="bg-systemGray6 p-2 rounded-xl mr-3">
                  <Edit3 size={18} color="#8E8E93" />
                </View>
                <View>
                  <Text className="text-text font-semibold text-base">Remarks</Text>
                  <Text className="text-muted text-[11px] font-medium uppercase tracking-wider">Mandatory Field</Text>
                </View>
                {!formData.remarks && (
                  <View className="bg-red-500/10 px-2 py-1 rounded-lg ml-auto border border-red-500/20">
                    <Text className="text-red-600 text-[10px] font-bold">REQUIRED</Text>
                  </View>
                )}
              </View>
              <TextInput 
                className="text-lg text-text leading-6 min-h-[100px]"
                placeholder="Who was paid? What was bought? Any specific site details?"
                placeholderTextColor="#C7C7CC"
                multiline={true}
                value={formData.remarks}
                onChangeText={(val) => setFormData({ ...formData, remarks: val })}
                numberOfLines={4}
                textAlignVertical="top"
                selectionColor="#0F766E"
              />
            </View>

            <TouchableOpacity 
              style={styles.shadowXl}
              className={`bg-primary h-[64px] rounded-[22px] items-center justify-center mb-12 active:scale-[0.97] ${isSubmitting && 'opacity-70'}`}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text className="text-white text-xl font-bold tracking-tight">
                {isSubmitting ? 'Processing...' : 'Submit Transaction'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
      
      {renderSelectorModal()}
      {render3DImageModal()}
      {showSuccess && (
        <AnimatedCheckmark onAnimationComplete={() => {
          setShowSuccess(false);
          navigation.goBack();
        }} />
      )}
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
  },
  shadow2xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
  }
});

export default AddExpenseScreen;
