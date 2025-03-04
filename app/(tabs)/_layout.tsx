import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#808080',
        tabBarStyle: { 
          backgroundColor: '#121212',
          borderTopColor: '#2C2C2E',
        },
        headerShown: false,
        tabBarLabelStyle: { fontSize: 12 }
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          href: null, // Hide this tab from tab bar
          title: "Home"
        }}
      />
      <Tabs.Screen 
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />
            <Tabs.Screen 
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="news"
        options={{
          title: 'News',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen 
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}