import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { X, FolderGit2, Briefcase } from 'lucide-react-native';
import { FlashList } from '@shopify/flash-list';
import { fetchExpenses } from '../services/api';

const ProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchExpenses();
      
      // Determine unique projects (Sub-Categories under Site Expenses)
      const projectMap = new Map();
      data.forEach(item => {
        if (item.category === 'Site Expenses' && item.subCategory) {
          if (!projectMap.has(item.subCategory)) {
            projectMap.set(item.subCategory, { name: item.subCategory, spent: 0, txCount: 0 });
          }
          const p = projectMap.get(item.subCategory);
          p.spent += item.amount;
          p.txCount += 1;
        }
      });
      
      setProjects(Array.from(projectMap.values()));
      setLoading(false);
    };
    
    loadProjects();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2" accessibilityLabel="Go back">
            <X size={28} color="#1D1D1F" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text">Active Projects</Text>
          <View className="w-10" />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0F766E" />
          </View>
        ) : (
          <FlashList
            data={projects}
            estimatedItemSize={100}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="bg-paper p-8 rounded-apple border border-border items-center justify-center shadow-sm">
                <FolderGit2 size={48} color="#86868B" className="mb-4" />
                <Text className="text-muted text-center text-lg">No active site projects found.</Text>
                <Text className="text-muted text-center text-sm mt-2">Log 'Site Expenses' to see them here.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity className="bg-paper p-5 rounded-apple border border-border flex-row items-center mb-4 shadow-sm active:bg-gray-50">
                <View className="w-14 h-14 bg-secondary/10 rounded-2xl items-center justify-center mr-4">
                  <Briefcase size={28} color="#14B8A6" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-text text-xl mb-1">{item.name}</Text>
                  <Text className="text-muted text-sm">{item.txCount} transaction{item.txCount !== 1 ? 's' : ''}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-muted text-xs font-bold tracking-widest mb-1 uppercase">Allocated</Text>
                  <Text className="font-black text-primary text-xl">₹{item.spent.toLocaleString()}</Text>
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

export default ProjectsScreen;
