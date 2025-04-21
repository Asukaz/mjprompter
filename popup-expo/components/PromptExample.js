import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

export default function PromptExample({ feature, onPress }) {
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: feature.image }} 
        style={styles.image}
        defaultSource={require('../assets/fallback.png')} // Make sure to add this image to assets
      />
      <View style={styles.content}>
        <Text style={styles.title}>{feature.caption || feature.name}</Text>
        <Text style={styles.description}>{truncateText(feature.prompt || feature.name, 60)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 8,
    borderRadius: 6,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#1f2937',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
});