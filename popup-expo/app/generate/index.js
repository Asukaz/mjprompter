import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  StyleSheet 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { extractVariablesFromPrompt } from '../../hooks/usePromptUtils';

export default function GenerateScreen() {
  const params = useLocalSearchParams();
  const [variables, setVariables] = useState({});
  const [formattedPrompt, setFormattedPrompt] = useState('');
  const [feature, setFeature] = useState(null);
  
  // Get the params safely
  const dimension = params?.dimension || '';
  const subType = params?.subType || '';
  
  // Parse the feature from params (only once when params change)
  useEffect(() => {
    if (params?.feature) {
      try {
        const parsedFeature = JSON.parse(params.feature);
        setFeature(parsedFeature);
      } catch (error) {
        console.error('Error parsing feature:', error);
      }
    }
  }, [params.feature]); // Only depend on params.feature, not the entire params object
  
  // Extract variables when feature changes
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
  }, [feature]); // Only depend on feature
  
  // Function to update the prompt with variable values
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
  
  // Update prompt when variables change
  useEffect(() => {
    updatePrompt();
  }, [variables, feature]); // Depend on variables and feature
  
  // Handle variable input change
  const handleVariableChange = (name, value) => {
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
    // No setTimeout needed anymore since we have the effect above
  };
  
  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(formattedPrompt);
      Alert.alert('Success', 'Prompt copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };
  
  const handleGenerate = () => {
    // In a real app, this would call your AI image generation API
    Alert.alert('Generating', 'Would connect to GPT-4o API here');
  };

  // If no feature is selected yet, show a message
  if (!feature) {
    return (
      <View style={styles.centered}>
        <Text>Select a prompt from Style or Subject tabs</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{feature.caption || feature.name}</Text>
        
        <View style={styles.categoryRow}>
          <Text style={styles.categoryTag}>
            {subType?.replace(/_/g, ' ')}
          </Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.noteText}>No reference image required</Text>
        </View>
        
        <Image
          source={{ uri: feature.image }}
          style={styles.previewImage}
          defaultSource={require('../../assets/images/icon.png')}
          resizeMode="contain"
        />
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PROMPT</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{formattedPrompt}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUSTOMIZE VARIABLES</Text>
          
          {Object.keys(variables).length > 0 ? (
            <View style={styles.variablesGrid}>
              {Object.keys(variables).map(varName => (
                <View key={varName} style={styles.variableItem}>
                  <Text style={styles.variableLabel}>{varName}</Text>
                  <TextInput
                    style={styles.variableInput}
                    value={variables[varName]}
                    onChangeText={(text) => handleVariableChange(varName, text)}
                    placeholder={`Enter ${varName}`}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noVariablesText}>No variables to customize for this prompt.</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
          <Text style={styles.generateButtonText}>Generate with GPT-4o</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  categoryTag: {
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  separator: {
    marginHorizontal: 8,
    color: '#6b7280',
  },
  noteText: {
    fontSize: 12,
    color: '#6b7280',
  },
  previewImage: {
    width: '100%',
    height: 240,
    marginVertical: 16,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyButton: {
    backgroundColor: 'transparent',
  },
  copyButtonText: {
    color: '#3b82f6',
    fontSize: 14,
  },
  promptContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1f2937',
  },
  variablesGrid: {
    marginTop: 12,
  },
  variableItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
  },
  variableLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  variableInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
    fontSize: 14,
  },
  noVariablesText: {
    color: '#6b7280',
    fontStyle: 'italic',
    fontSize: 13,
    marginTop: 8,
  },
  generateButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});