import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Please enter your name');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!country.trim()) {
        Alert.alert('Please enter your country of origin');
        return;
      }
      setStep(3);
    }
  };

  const handleComplete = async () => {
    try {
      // Store user data
      await AsyncStorage.setItem('@user_data', JSON.stringify({
        name,
        country,
        preferredLanguage,
      }));
      
      // Mark user as registered
      await AsyncStorage.setItem('@user_registered', 'true');
      
      // Navigate to main app
      router.replace('/');
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'There was a problem completing registration.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to RefugeeBot</Text>
            <Text style={styles.subtitle}>
              Your personal assistant for resources, support, and information
            </Text>
          </View>

          {step === 1 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Step 1: Tell us your name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Step 2: Where are you from?</Text>
              <TextInput
                style={styles.input}
                placeholder="Country of origin"
                placeholderTextColor="#888"
                value={country}
                onChangeText={setCountry}
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Step 3: Select your preferred language</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={preferredLanguage}
                  onValueChange={(itemValue) => setPreferredLanguage(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  {languages.map((lang) => (
                    <Picker.Item key={lang.code} label={lang.name} value={lang.code} color="#fff" />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleComplete}>
                <Text style={styles.buttonText}>Complete Registration</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep(2)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#fff',
    backgroundColor: '#2C2C2E',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});