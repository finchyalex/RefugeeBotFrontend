import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function Root() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function checkRegistration() {
      try {
        const value = await AsyncStorage.getItem('@user_registered');
        setIsRegistered(value === 'true');
      } catch (error) {
        console.error('Error checking registration:', error);
      } finally {
        setIsLoading(false);
      }
    }

    checkRegistration();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return isRegistered ? <Redirect href="/(tabs)/chat" /> : <Redirect href="/(auth)/register" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});