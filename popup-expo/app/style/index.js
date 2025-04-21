import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import usePromptData from '../../hooks/usePromptData';
import SubTab from '../../components/SubTab';
import PromptExample from '../../components/PromptExample';

export default function StyleScreen() {
  const router = useRouter();
  const { data, loading, error } = usePromptData();
  const [activeSubTab, setActiveSubTab] = useState('');

  // Set initial subtab when data loads
  useEffect(() => {
    if (data?.style?.featureTypes?.length > 0) {
      setActiveSubTab(data.style.featureTypes[0].name);
    }
  }, [data]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Failed to load data. Please check your connection.</Text>
      </View>
    );
  }

  // Get feature types for the "style" dimension
  const featureTypes = data?.style?.featureTypes || [];
  
  // Get examples for the active sub tab
  const examples = data?.style?.[activeSubTab] || [];

  return (
    <View style={styles.container}>
      {/* Horizontal scrollable sub tabs */}
      <FlatList
        horizontal
        data={featureTypes}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <SubTab
            name={item.name}
            caption={item.caption}
            isActive={activeSubTab === item.name}
            onPress={() => setActiveSubTab(item.name)}
          />
        )}
        style={styles.subTabList}
        showsHorizontalScrollIndicator={false}
      />
      
      {/* List of examples */}
      <FlatList
        data={examples}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PromptExample
            feature={item}
            onPress={() => {
              router.push({
                pathname: '/generate',
                params: {
                  feature: JSON.stringify(item),
                  dimension: 'style',
                  subType: activeSubTab
                }
              });
            }}
          />
        )}
        style={styles.exampleList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subTabList: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exampleList: {
    padding: 8,
  },
});