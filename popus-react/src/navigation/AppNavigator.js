// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import StyleScreen from '../screens/StyleScreen';
import SubjectScreen from '../screens/SubjectScreen';
import GenerateScreen from '../screens/GenerateScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Style" component={StyleScreen} />
        <Tab.Screen name="Subject" component={SubjectScreen} />
        <Tab.Screen name="Generate" component={GenerateScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;