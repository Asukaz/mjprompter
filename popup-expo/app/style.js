import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import usePromptData from '../hooks/usePromptData';
import SubTab from '../components/SubTab';
import PromptExample from '../components/PromptExample';

export default function StyleScreen() {
  const router = useRouter();
  const { data, loading, error } = usePromptData();
  const [activeSubTab, setActiveSubTab] = useState('');
  const [activeFeatureImage, setActiveFeatureImage] = useState('');

  // Set initial subtab when data loads
  useEffect(() => {
    if (data?.style?.featureTypes?.length > 0) {
      const initialTab = data.style.featureTypes[0].name;
      setActiveSubTab(initialTab);
      
      // Set the initial feature image
      const initialFeatureType = data.style.featureTypes.find(type => type.name === initialTab);
      if (initialFeatureType?.image) {
        setActiveFeatureImage(initialFeatureType.image);
      }
    }
  }, [data]);

  // Handle tab change
  const handleTabChange = (tabName) => {
    setActiveSubTab(tabName);
    
    // Update the feature image when tab changes
    const selectedFeatureType = data?.style?.featureTypes.find(type => type.name === tabName);
    if (selectedFeatureType?.image) {
      setActiveFeatureImage(selectedFeatureType.image);
    }
  };

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
      <View style={styles.fixedHeaderArea}>
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
              onPress={() => handleTabChange(item.name)}
            />
          )}
          style={styles.subTabList}
          showsHorizontalScrollIndicator={false}
        />
        
        {/* Feature image for the selected tab - moved directly below tabs */}
        {activeFeatureImage ? (
          <View style={styles.featureImageContainer}>
            <Image
              source={{ uri: activeFeatureImage }}
              style={styles.featureImage}
              defaultSource={require('../assets/images/icon.png')}
              resizeMode="cover"
            />
          </View>
        ) : null}
      </View>
      
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
  fixedHeaderArea: {
    backgroundColor: '#ffffff',
  },
  subTabList: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  featureImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  exampleList: {
    padding: 8,
  },
});