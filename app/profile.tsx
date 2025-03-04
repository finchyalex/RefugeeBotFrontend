import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(true);

  // Mock appointment data - in a real app, this would come from an API
  const appointments = [
    {
      id: '1',
      title: 'Immigration Office Interview',
      date: '2025-03-15',
      time: '10:30 AM',
      location: 'City Immigration Center',
    },
    {
      id: '2',
      title: 'Housing Assistance Meeting',
      date: '2025-03-18',
      time: '2:00 PM',
      location: 'Community Support Center',
    },
  ];

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('@user_data');
        if (data) {
          setUserData(JSON.parse(data));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear registration status
              await AsyncStorage.setItem('@user_registered', 'false');
              // Navigate to registration screen
              router.replace('/register');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'There was a problem logging out.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.userInfoSection}>
          <View style={styles.userIcon}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <Text style={styles.userName}>{userData?.name}</Text>
          <Text style={styles.userDetail}>From: {userData?.country}</Text>
          <Text style={styles.userDetail}>Language: {
            languages.find(l => l.code === userData?.preferredLanguage)?.name || userData?.preferredLanguage
          }</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                <View style={styles.appointmentDetail}>
                  <Ionicons name="calendar" size={16} color="#007AFF" />
                  <Text style={styles.appointmentText}>
                    {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                  </Text>
                </View>
                <View style={styles.appointmentDetail}>
                  <Ionicons name="location" size={16} color="#007AFF" />
                  <Text style={styles.appointmentText}>{appointment.location}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming appointments</Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notifications ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Languages for display
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'fa', name: 'Farsi' },
  { code: 'ps', name: 'Pashto' },
  { code: 'so', name: 'Somali' },
  { code: 'tr', name: 'Turkish' },
  { code: 'ti', name: 'Tigrinya' },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#aaa',
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfoSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  userIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userDetail: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 3,
  },
  sectionContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  appointmentCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  appointmentText: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#aaa',
    fontStyle: 'italic',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});