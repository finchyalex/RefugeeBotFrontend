import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Modal,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';

// Types for journal entries
type MediaType = 'image' | 'video' | 'audio' | null;

interface MediaItem {
  type: MediaType;
  uri: string;
}

interface JournalEntry {
  id: string;
  title: string;
  text: string;
  date: string;
  media: MediaItem[];
}

export default function JournalScreen() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryMedia, setNewEntryMedia] = useState<MediaItem[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<Audio.Recording | null>(null);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [viewEntryModalVisible, setViewEntryModalVisible] = useState(false);
  const router = useRouter();

  // Load journal entries from storage
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const entriesJSON = await AsyncStorage.getItem('@journal_entries');
        if (entriesJSON) {
          setJournalEntries(JSON.parse(entriesJSON));
        }
      } catch (error) {
        console.error('Error loading journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, []);

  // Save entries to storage whenever they change
  useEffect(() => {
    const saveEntries = async () => {
      try {
        await AsyncStorage.setItem('@journal_entries', JSON.stringify(journalEntries));
      } catch (error) {
        console.error('Error saving journal entries:', error);
      }
    };

    if (journalEntries.length > 0) {
      saveEntries();
    }
  }, [journalEntries]);

  // Request permissions for media access
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted' || audioStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera, media library, and microphone permissions to use all features of the journal.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

  // Handle image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setNewEntryMedia([
        ...newEntryMedia,
        {
          type: asset.type === 'video' ? 'video' : 'image',
          uri: asset.uri,
        },
      ]);
    }
  };

  // Handle camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setNewEntryMedia([
        ...newEntryMedia,
        {
          type: asset.type === 'video' ? 'video' : 'image',
          uri: asset.uri,
        },
      ]);
    }
  };

  // Handle audio recording
  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecordingInstance(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    if (!recordingInstance) return;

    setIsRecording(false);
    await recordingInstance.stopAndUnloadAsync();
    const uri = recordingInstance.getURI();
    console.log('Recording stopped and stored at', uri);
    
    if (uri) {
      setNewEntryMedia([
        ...newEntryMedia,
        {
          type: 'audio',
          uri: uri,
        },
      ]);
    }

    setRecordingInstance(null);
  };

  // Handle saving a new journal entry
  const saveEntry = () => {
    if (!newEntryTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your journal entry.');
      return;
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntryTitle,
      text: newEntryText,
      date: new Date().toISOString(),
      media: newEntryMedia,
    };

    setJournalEntries([newEntry, ...journalEntries]);
    setModalVisible(false);
    resetNewEntryForm();
  };

  // Reset the new entry form
  const resetNewEntryForm = () => {
    setNewEntryTitle('');
    setNewEntryText('');
    setNewEntryMedia([]);
    setIsRecording(false);
    if (recordingInstance) {
      recordingInstance.stopAndUnloadAsync();
      setRecordingInstance(null);
    }
  };

  // Handle viewing an entry
  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setViewEntryModalVisible(true);
  };

  // Render a journal entry item
  const renderJournalEntry = ({ item }: { item: JournalEntry }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const hasMedia = item.media && item.media.length > 0;

    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => handleViewEntry(item)}
      >
        <View style={styles.entryCardContent}>
          <Text style={styles.entryTitle}>{item.title}</Text>
          <Text style={styles.entryDate}>{formattedDate}</Text>
          
          {item.text ? (
            <Text style={styles.entryPreview} numberOfLines={2}>
              {item.text}
            </Text>
          ) : null}

          {hasMedia && (
            <View style={styles.mediaIndicator}>
              {item.media.some(m => m.type === 'image') && (
                <Ionicons name="image" size={14} color="#007AFF" style={styles.mediaIcon} />
              )}
              {item.media.some(m => m.type === 'video') && (
                <Ionicons name="videocam" size={14} color="#007AFF" style={styles.mediaIcon} />
              )}
              {item.media.some(m => m.type === 'audio') && (
                <Ionicons name="mic" size={14} color="#007AFF" style={styles.mediaIcon} />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render media preview in entry creation form
  const renderMediaPreview = ({ item, index }: { item: MediaItem; index: number }) => {
    if (item.type === 'image') {
      return (
        <View style={styles.mediaPreviewContainer}>
          <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => {
              const updatedMedia = [...newEntryMedia];
              updatedMedia.splice(index, 1);
              setNewEntryMedia(updatedMedia);
            }}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'video') {
      return (
        <View style={styles.mediaPreviewContainer}>
          <View style={styles.videoPreview}>
            <Ionicons name="videocam" size={40} color="#fff" />
          </View>
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => {
              const updatedMedia = [...newEntryMedia];
              updatedMedia.splice(index, 1);
              setNewEntryMedia(updatedMedia);
            }}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    } else if (item.type === 'audio') {
      return (
        <View style={styles.mediaPreviewContainer}>
          <View style={styles.audioPreview}>
            <Ionicons name="musical-note" size={40} color="#fff" />
          </View>
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => {
              const updatedMedia = [...newEntryMedia];
              updatedMedia.splice(index, 1);
              setNewEntryMedia(updatedMedia);
            }}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading journal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
      </View>
      
      {journalEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book-outline" size={80} color="#555" />
          <Text style={styles.emptyText}>No journal entries yet</Text>
          <Text style={styles.emptySubText}>
            Record your thoughts, experiences, and save media to document your journey.
          </Text>
        </View>
      ) : (
        <FlatList
          data={journalEntries}
          renderItem={renderJournalEntry}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.entriesList}
        />
      )}

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetNewEntryForm();
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* New entry modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          if (isRecording && recordingInstance) {
            stopRecording();
          }
          setModalVisible(false);
        }}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Journal Entry</Text>
            <TouchableOpacity
              onPress={() => {
                if (isRecording && recordingInstance) {
                  stopRecording();
                }
                setModalVisible(false);
              }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.titleInput}
              placeholder="Entry Title"
              placeholderTextColor="#888"
              value={newEntryTitle}
              onChangeText={setNewEntryTitle}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Write your thoughts here..."
              placeholderTextColor="#888"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={newEntryText}
              onChangeText={setNewEntryText}
            />

            {/* Media preview */}
            {newEntryMedia.length > 0 && (
              <View style={styles.mediaPreviewList}>
                <FlatList
                  data={newEntryMedia}
                  renderItem={renderMediaPreview}
                  keyExtractor={(_, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}
            
            {/* Media selection buttons */}
            <View style={styles.mediaButtonsContainer}>
              <TouchableOpacity style={styles.mediaButton} onPress={pickImage}>
                <Ionicons name="image" size={24} color="#fff" />
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.mediaButton} onPress={takePhoto}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.mediaButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
              >
                <Ionicons 
                  name={isRecording ? "stop-circle" : "mic"} 
                  size={24} 
                  color="#fff" 
                />
                <Text style={styles.mediaButtonText}>
                  {isRecording ? "Stop" : "Record"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={saveEntry}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* View entry modal */}
      <Modal
        visible={viewEntryModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setViewEntryModalVisible(false)}
      >
        {viewingEntry && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setViewEntryModalVisible(false)}>
                <Ionicons name="arrow-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{viewingEntry.title}</Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.viewEntryDate}>
                {new Date(viewingEntry.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>

              {viewingEntry.text ? (
                <Text style={styles.viewEntryText}>{viewingEntry.text}</Text>
              ) : null}

              {/* Media gallery */}
              {viewingEntry.media.length > 0 && (
                <View style={styles.viewEntryMedia}>
                  {viewingEntry.media.map((media, index) => (
                    <View key={index} style={styles.viewEntryMediaItem}>
                      {media.type === 'image' ? (
                        <Image
                          source={{ uri: media.uri }}
                          style={styles.viewEntryImage}
                          resizeMode="cover"
                        />
                      ) : media.type === 'video' ? (
                        <View style={styles.viewEntryVideo}>
                          <Ionicons name="play-circle" size={50} color="#fff" />
                          <Text style={styles.viewEntryMediaText}>Video</Text>
                        </View>
                      ) : media.type === 'audio' ? (
                        <View style={styles.viewEntryAudio}>
                          <Ionicons name="musical-note" size={36} color="#fff" />
                          <Text style={styles.viewEntryMediaText}>Audio Recording</Text>
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  entriesList: {
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  entryCardContent: {
    padding: 16,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  entryPreview: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 10,
  },
  mediaIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaIcon: {
    marginRight: 8,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#121212',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 150,
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  mediaButton: {
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    padding: 14,
    borderRadius: 8,
    width: '30%',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  mediaButtonText: {
    color: '#fff',
    marginTop: 6,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mediaPreviewList: {
    marginVertical: 10,
  },
  mediaPreviewContainer: {
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  videoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#121212',
    borderRadius: 12,
  },
  viewEntryDate: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 20,
  },
  viewEntryText: {
    fontSize: 17,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 20,
  },
  viewEntryMedia: {
    marginVertical: 10,
  },
  viewEntryMediaItem: {
    marginBottom: 16,
  },
  viewEntryImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  viewEntryVideo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewEntryAudio: {
    width: '100%',
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewEntryMediaText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 14,
  },
});