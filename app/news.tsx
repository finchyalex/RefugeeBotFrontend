import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Mock news data - in a real app, this would come from an API
const mockNews = [
  {
    id: '1',
    title: 'New Housing Support Program Launched',
    summary: 'A new program providing housing assistance for refugees has been launched in major cities.',
    date: '2025-03-01',
    imageUrl: 'https://placehold.co/600x400/png',
    category: 'Housing',
  },
  {
    id: '2',
    title: 'Language Classes Available Online',
    summary: 'Free online language classes now available to help refugees learn local languages.',
    date: '2025-02-28',
    imageUrl: 'https://placehold.co/600x400/png',
    category: 'Education',
  },
  {
    id: '3',
    title: 'Healthcare Services Expanded',
    summary: 'Healthcare services for refugees have been expanded to include mental health support.',
    date: '2025-02-25',
    imageUrl: 'https://placehold.co/600x400/png',
    category: 'Healthcare',
  },
  {
    id: '4',
    title: 'Job Training Workshop Next Week',
    summary: 'Attend a free job training workshop to improve your employment prospects.',
    date: '2025-02-20',
    imageUrl: 'https://placehold.co/600x400/png',
    category: 'Employment',
  },
  {
    id: '5',
    title: 'Legal Aid Clinic Open Hours Extended',
    summary: 'The legal aid clinic has extended its hours to accommodate more people seeking assistance.',
    date: '2025-02-15',
    imageUrl: 'https://placehold.co/600x400/png',
    category: 'Legal',
  },
];

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch with a delay
    const timer = setTimeout(() => {
      setNews(mockNews);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, this would refetch the latest news
    setTimeout(() => {
      setNews(mockNews);
      setRefreshing(false);
    }, 1500);
  };

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={styles.newsCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{item.category}</Text>
        </View>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsSummary}>{item.summary}</Text>
        <Text style={styles.newsDate}>{new Date(item.date).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>News & Resources</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading news...</Text>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        />
      )}
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
  newsList: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 16,
  },
  categoryContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
  },
  category: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 20,
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
});