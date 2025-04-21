// src/screens/GenerateScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TextInput, Button, Alert } from 'react-native';
import { extractVariablesFromPrompt } from '../utils/promptUtils';
import { copyToClipboard } from '../utils/clipboardUtils';

const GenerateScreen = ({ route }) => {
  const [variables, setVariables] = useState({});
  const [formattedPrompt, setFormattedPrompt] = useState('');
  
  // Get the selected feature from navigation params
  const { feature, dimension, subType } = route.params || {};
  
  useEffect(() => {
    if (feature?.prompt) {
      // Extract variables from the prompt
      const extractedVars = extractVariablesFromPrompt(feature.prompt);
      const initialVars = {};
      extractedVars.forEach(v => initialVars[v] = '');
      setVariables(initialVars);
      
      // Set initial prompt
      setFormattedPrompt(feature.prompt);
    }
  }, [feature]);
  
  // Update prompt when variables change
  const updatePrompt = () => {
    if (!feature?.prompt) return;
    
    let newPrompt = feature.prompt;
    Object.keys(variables).forEach(varName => {
      if (variables[varName]) {
        newPrompt = newPrompt.replace(`[${varName}]`, variables[varName]);
      }
    });
    
    setFormattedPrompt(newPrompt);
  };
  
  // Handle variable input change
  const handleVariableChange = (name, value) => {
    setVariables(prev => ({ ...prev, [name]: value }));
    // Update prompt after a short delay
    setTimeout(updatePrompt, 100);
  };
  
  const handleCopy = () => {
    copyToClipboard(formattedPrompt);
    Alert.alert('Success', 'Prompt copied to clipboard');
  };
  
  const handleGenerate = () => {
    // In a real app, this would call your AI image generation API
    Alert.alert('Generating', 'Would connect to GPT-4o API here');
  };

  if (!feature) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Select a prompt from Style or Subject tabs</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{feature.caption || feature.name}</Text>
        
        <View style={{ flexDirection: 'row', marginVertical: 8 }}>
          <Text style={{ backgroundColor: '#dbeafe', color: '#3b82f6', padding: 4, borderRadius: 12 }}>
            {subType?.replace(/_/g, ' ')}
          </Text>
        </View>
        
        <Image
          source={{ uri: feature.image }}
          style={{ width: '100%', height: 240, marginVertical: 16 }}
          resizeMode="contain"
        />
        
        <View style={{ marginVertical: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold' }}>PROMPT</Text>
            <Button title="Copy" onPress={handleCopy} />
          </View>
          
          <View style={{ padding: 16, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 6, marginTop: 8 }}>
            <Text>{formattedPrompt}</Text>
          </View>
        </View>
        
        <View style={{ marginVertical: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>CUSTOMIZE VARIABLES</Text>
          
          {Object.keys(variables).length > 0 ? (
            Object.keys(variables).map(varName => (
              <View key={varName} style={{ marginBottom: 8 }}>
                <Text>{varName}</Text>
                <TextInput
                  style={{ borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 8 }}
                  value={variables[varName]}
                  onChangeText={(text) => handleVariableChange(varName, text)}
                  placeholder={`Enter ${varName}`}
                />
              </View>
            ))
          ) : (
            <Text>No variables to customize for this prompt.</Text>
          )}
        </View>
        
        <Button
          title="Generate with GPT-4o"
          onPress={handleGenerate}
          color="#3b82f6"
        />
      </View>
    </ScrollView>
  );
};

export default GenerateScreen;