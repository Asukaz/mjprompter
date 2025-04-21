import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="style"
        options={{
          title: 'Style',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="brush" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subject"
        options={{
          title: 'Subject',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="image" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}