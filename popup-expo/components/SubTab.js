import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function SubTab({ name, caption, isActive, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.container, isActive && styles.active]} 
      onPress={onPress}
    >
      <Text style={[styles.text, isActive && styles.activeText]}>
        {caption || name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  active: {
    borderBottomColor: '#3b82f6',
  },
  text: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeText: {
    color: '#3b82f6',
    fontWeight: '500',
  },
});