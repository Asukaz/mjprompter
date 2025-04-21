// src/screens/StyleScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { fetchFeatureData } from '../api/promptService';
import SubTab from '../components/SubTab';
import PromptExample from '../components/PromptExample';

const StyleScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [featureData, setFeatureData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchFeatureData();
      setFeatureData(data);
      
      // Set initial active subtab
      if (data.style && data.style.featureTypes && data.style.featureTypes.length > 0) {
        setActiveSubTab(data.style.featureTypes[0].name);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  // Get feature types for the "style" dimension
  const featureTypes = featureData?.style?.featureTypes || [];
  
  // Get examples for the active sub tab
  const examples = featureData?.style?.[activeSubTab] || [];

  return (
    <View style={{ flex: 1 }}>
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
      />
      
      {/* List of examples */}
      <FlatList
        data={examples}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PromptExample
            feature={item}
            onPress={() => {
              navigation.navigate('Generate', {
                feature: item,
                dimension: 'style',
                subType: activeSubTab
              });
            }}
          />
        )}
      />
    </View>
  );
};

export default StyleScreen;