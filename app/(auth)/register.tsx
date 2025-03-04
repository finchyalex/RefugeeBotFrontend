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
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Available app features
const appFeatures = [
  {
    id: '1',
    name: 'Chat Assistant',
    icon: 'chatbubble-ellipses',
    iconType: 'ion',
    description: 'Get personalized support from our AI assistant',
    requiresVerification: false,
  },
  {
    id: '2',
    name: 'News Feed',
    icon: 'newspaper',
    iconType: 'ion',
    description: 'Access reliable news and updates',
    requiresVerification: false,
  },
  {
    id: '3',
    name: 'Journal',
    icon: 'book',
    iconType: 'ion',
    description: 'Document your journey with text, photos, and audio',
    requiresVerification: false,
  },
  {
    id: '4',
    name: 'Document Storage',
    icon: 'file-document',
    iconType: 'material',
    description: 'Store and organize important documents securely',
    requiresVerification: true,
  },
  {
    id: '5',
    name: 'Legal Support',
    icon: 'scale-balance',
    iconType: 'material',
    description: 'Connect with legal assistance resources',
    requiresVerification: true,
  },
  {
    id: '6',
    name: 'Healthcare',
    icon: 'medical-bag',
    iconType: 'material',
    description: 'Find healthcare services and information',
    requiresVerification: false,
  },
  {
    id: '7',
    name: 'Community',
    icon: 'people',
    iconType: 'ion',
    description: 'Connect with others in similar situations',
    requiresVerification: true,
  },
  {
    id: '8',
    name: 'Reporting',
    icon: 'report',
    iconType: 'material',
    description: 'Create and submit reports about conditions',
    requiresVerification: true,
  },
];

// Journalist verification fields
const journalistVerificationFields = [
  { id: 'firstName', label: 'First Name', placeholder: 'Enter your first name', required: true },
  { id: 'lastName', label: 'Last Name', placeholder: 'Enter your last name', required: true },
  { id: 'email', label: 'Work Email', placeholder: 'Enter your work email', required: true },
  { id: 'organization', label: 'Organization', placeholder: 'Enter your media organization', required: true },
  { id: 'pressId', label: 'Press ID (optional)', placeholder: 'Enter your press ID number', required: false },
];

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
  // User type and flow state
  const [userType, setUserType] = useState<'refugee' | 'journalist' | null>(null);
  const [step, setStep] = useState(1);
  
  // Common data for both user types
  const [displayName, setDisplayName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [selectedLanguageName, setSelectedLanguageName] = useState('English');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // Journalist specific data
  const [journalistData, setJournalistData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    pressId: '',
  });
  
  // UI state
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // This function is no longer used - selection is now handled directly
  // with the Next button on the first screen
  const handleUserTypeSelection = (type: 'refugee' | 'journalist') => {
    setUserType(type);
  };

  // Handle navigation between steps
  const handleNext = () => {
    if (step === 2) {
      // Validate display name
      if (!displayName.trim()) {
        Alert.alert('Please enter what you would like to be called');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      // Proceed to feature selection
      setStep(4);
    } else if (step === 4) {
      // For journalists, proceed to verification
      if (userType === 'journalist') {
        setStep(5);
      } else {
        // For refugees, complete registration
        handleComplete();
      }
    } else if (step === 5 && userType === 'journalist') {
      // Validate journalist verification fields
      const requiredFields = journalistVerificationFields.filter(field => field.required);
      const missingFields = requiredFields.filter(field => 
        !journalistData[field.id as keyof typeof journalistData]
      );
      
      if (missingFields.length > 0) {
        Alert.alert('Missing Information', 
          `Please provide ${missingFields.map(f => f.label.toLowerCase()).join(', ')}`
        );
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(journalistData.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address');
        return;
      }
      
      // Complete registration
      handleComplete();
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (step === 2) {
      setUserType(null);
      setStep(1);
    } else if (step > 2) {
      setStep(step - 1);
    }
  };

  // Handle feature selection
  const toggleFeatureSelection = (featureId: string) => {
    if (selectedFeatures.includes(featureId)) {
      setSelectedFeatures(selectedFeatures.filter(id => id !== featureId));
    } else {
      setSelectedFeatures([...selectedFeatures, featureId]);
    }
  };

  // Handle journalist data input
  const updateJournalistData = (field: string, value: string) => {
    setJournalistData({
      ...journalistData,
      [field]: value,
    });
  };

  // Complete registration
  const handleComplete = async () => {
    try {
      console.log('Starting registration completion...');
      
      // Show loading alert
      Alert.alert(
        'Registration',
        'Completing registration...',
        [],
        { cancelable: false }
      );
      
      // Determine which features to enable based on user type and verification
      const enabledFeatures = selectedFeatures.map(id => {
        const feature = appFeatures.find(f => f.id === id);
        return {
          id,
          name: feature?.name,
          requiresVerification: feature?.requiresVerification,
          enabled: userType === 'journalist' || !feature?.requiresVerification,
        };
      });
      
      // Store user data
      const userData = {
        userType,
        displayName,
        preferredLanguage,
        features: enabledFeatures,
        // Additional journalist data if applicable
        ...(userType === 'journalist' && { journalistData }),
        // Registration timestamp
        registeredAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      console.log('User data saved', userData);
      
      // Mark user as registered
      await AsyncStorage.setItem('@user_registered', 'true');
      console.log('User marked as registered');
      
      // Small delay to ensure data is written
      setTimeout(() => {
        console.log('Navigating to tab interface...');
        // Navigate to main app
        router.replace('/(tabs)/chat');
      }, 1000);
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'There was a problem completing registration.');
    }
  };

  // Render feature icon based on type
  const renderFeatureIcon = (icon: string, type: string, selected: boolean, requiresVerification: boolean) => {
    const iconColor = selected ? '#FFFFFF' : '#AAAAAA';
    const iconSize = 32;
    
    if (type === 'ion') {
      return <Ionicons name={icon as any} size={iconSize} color={iconColor} />;
    } else if (type === 'material') {
      return <MaterialCommunityIcons name={icon as any} size={iconSize} color={iconColor} />;
    }
    
    return <Ionicons name="help-circle" size={iconSize} color={iconColor} />;
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
            <Text style={styles.title}>Welcome to Refuge.io</Text>
            <Text style={styles.subtitle}>
              Your personal assistant for resources, support, and information
            </Text>
          </View>

          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>I am interested in:</Text>
              
              <TouchableOpacity 
                style={[
                  styles.userTypeCheckbox,
                  userType === 'refugee' && styles.selectedUserTypeCheckbox
                ]}
                onPress={() => setUserType('refugee')}
              >
                <View style={styles.checkboxContent}>
                  <Ionicons name="people" size={24} color={userType === 'refugee' ? '#fff' : '#aaa'} />
                  <Text style={[
                    styles.userTypeCheckboxText,
                    userType === 'refugee' && styles.selectedUserTypeCheckboxText
                  ]}>
                    Getting support as a refugee or displaced person
                  </Text>
                </View>
                {userType === 'refugee' && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.userTypeCheckbox,
                  userType === 'journalist' && styles.selectedUserTypeCheckbox
                ]}
                onPress={() => setUserType('journalist')}
              >
                <View style={styles.checkboxContent}>
                  <Ionicons name="newspaper" size={24} color={userType === 'journalist' ? '#fff' : '#aaa'} />
                  <Text style={[
                    styles.userTypeCheckboxText,
                    userType === 'journalist' && styles.selectedUserTypeCheckboxText
                  ]}>
                    Reporting on refugee situations as a journalist
                  </Text>
                </View>
                {userType === 'journalist' && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" style={styles.checkIcon} />
                )}
              </TouchableOpacity>
              
              <Text style={styles.featureNote}>
                Note: All features are available to both user types, but some may require additional verification for security and privacy reasons.
              </Text>
              
              <TouchableOpacity 
                style={[styles.button, !userType && styles.disabledButton]}
                onPress={() => userType && setStep(2)}
                disabled={!userType}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Display Name */}
          {step === 2 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>
                {userType === 'refugee' 
                  ? 'What would you like to be called?' 
                  : 'Choose a display name'}
              </Text>
              <Text style={styles.stepDescription}>
                {userType === 'refugee' 
                  ? 'You can use any name you feel comfortable with. This doesn\'t have to be your legal name.' 
                  : 'This is the name that will be displayed in the app.'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter name"
                placeholderTextColor="#888"
                value={displayName}
                onChangeText={setDisplayName}
              />
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Language Selection */}
          {step === 3 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Select your preferred language</Text>
              
              <TouchableOpacity 
                style={styles.languageSelector}
                onPress={() => setLanguageModalVisible(true)}
              >
                <Text style={styles.languageSelectorText}>{selectedLanguageName}</Text>
                <Ionicons name="chevron-down" size={20} color="#fff" />
              </TouchableOpacity>
              
              <Modal
                visible={languageModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setLanguageModalVisible(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Select Language</Text>
                      <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                        <Ionicons name="close" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <FlatList
                      data={languages}
                      keyExtractor={(item) => item.code}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.languageOption,
                            preferredLanguage === item.code && styles.selectedLanguageOption,
                          ]}
                          onPress={() => {
                            setPreferredLanguage(item.code);
                            setSelectedLanguageName(item.name);
                            setLanguageModalVisible(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.languageOptionText,
                              preferredLanguage === item.code && styles.selectedLanguageOptionText,
                            ]}
                          >
                            {item.name}
                          </Text>
                          {preferredLanguage === item.code && (
                            <Ionicons name="checkmark" size={20} color="#007AFF" />
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </Modal>
              
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 4: Feature Selection */}
          {step === 4 && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Select the features you want to use</Text>
              <Text style={styles.stepDescription}>
                {userType === 'refugee' 
                  ? 'Features with an orange border require additional verification.' 
                  : 'As a journalist, you\'ll need to verify your identity to access all features.'}
              </Text>
              
              <View style={styles.featuresGrid}>
                {appFeatures.map(feature => {
                  const isSelected = selectedFeatures.includes(feature.id);
                  const needsVerification = feature.requiresVerification && userType === 'refugee';
                  
                  return (
                    <TouchableOpacity
                      key={feature.id}
                      style={[
                        styles.featureItem,
                        isSelected && styles.selectedFeatureItem,
                        needsVerification && styles.verificationFeatureItem,
                      ]}
                      onPress={() => toggleFeatureSelection(feature.id)}
                    >
                      <View style={styles.featureIconContainer}>
                        {renderFeatureIcon(
                          feature.icon, 
                          feature.iconType, 
                          isSelected,
                          needsVerification
                        )}
                        {needsVerification && (
                          <View style={styles.verificationBadge}>
                            <Ionicons name="alert" size={12} color="#FFF" />
                          </View>
                        )}
                      </View>
                      <Text style={[
                        styles.featureName,
                        isSelected && styles.selectedFeatureName
                      ]}>
                        {feature.name}
                      </Text>
                      {isSelected && (
                        <Text style={styles.featureDescription}>
                          {feature.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <TouchableOpacity 
                style={[styles.button, selectedFeatures.length === 0 && styles.disabledButton]}
                onPress={handleNext}
                disabled={selectedFeatures.length === 0}
              >
                <Text style={styles.buttonText}>
                  {userType === 'journalist' ? 'Next' : 'Complete Registration'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 5: Journalist Verification (Journalists Only) */}
          {step === 5 && userType === 'journalist' && (
            <View style={styles.formContainer}>
              <Text style={styles.stepTitle}>Verify Your Credentials</Text>
              <Text style={styles.stepDescription}>
                Please provide your professional information for verification. 
                This helps us maintain the integrity of our reporting features.
              </Text>
              
              {journalistVerificationFields.map(field => (
                <View key={field.id} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    {field.label} {field.required && <Text style={styles.requiredStar}>*</Text>}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#888"
                    value={journalistData[field.id as keyof typeof journalistData]}
                    onChangeText={(text) => updateJournalistData(field.id, text)}
                    keyboardType={field.id === 'email' ? 'email-address' : 'default'}
                  />
                </View>
              ))}
              
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Complete Registration</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
    lineHeight: 22,
  },
  userTypeCheckbox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    height: 80,
  },
  selectedUserTypeCheckbox: {
    borderColor: '#007AFF',
    backgroundColor: '#0E3B64',
  },
  checkboxContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userTypeCheckboxText: {
    color: '#ccc',
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  selectedUserTypeCheckboxText: {
    color: '#fff',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 10,
  },
  featureNote: {
    color: '#aaa',
    fontSize: 14,
    marginVertical: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF9500',
  },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
  },
  languageSelector: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedLanguageOptionText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedFeatureItem: {
    borderColor: '#007AFF',
    backgroundColor: '#0E3B64',
  },
  verificationFeatureItem: {
    borderColor: '#FF9500',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 6,
  },
  selectedFeatureName: {
    color: '#fff',
  },
  featureDescription: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF9500',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
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