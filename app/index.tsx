import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function ChatScreen() {
  // Initialize chatHistory with an initial model message.
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'model',
      parts: ['Hello, I am your AI assistant. How can I help you today?'],
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sendChat = async () => {
    const trimmedMessage = inputText.trim();
    if (!trimmedMessage) return;

    // Append the user's message to history.
    const userMessage = { role: 'user', parts: [trimmedMessage] };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInputText('');

    // Add a temporary loading indicator.
    setChatHistory(prev => [...prev, { role: 'model', parts: ['Loading response...'] }]);

    try {
      const res = await fetch('https://refugeebot-hhfvdkcmedb3gwh0.uksouth-01.azurewebsites.net/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the message and history (excluding the temporary loading message)
        body: JSON.stringify({ message: trimmedMessage, history: newHistory }),
      });
      const data = await res.json();
      // Replace the current chat history with the updated history from the API.
      console.log(res)
      setChatHistory(data.history);
    } catch (err) {
      console.error("Error:", err);
      // On error, remove the loading indicator and append an error message.
      setChatHistory(prev => [...prev, { role: 'model', parts: [`Error: ${err.message}`] }]);
    }
  };

  console.log("chatHistory", chatHistory);

  const renderItem = ({ item }) => {
    // Join multiple parts into a single string.
    const messageText = item.parts.join(' ');
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.modelBubble]}>
        <Text style={[styles.messageText, { color: '#fff' }]}>{messageText}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={chatHistory}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your message..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendChat}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100, // extra space for the input area
  },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '70%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  modelBubble: {
    backgroundColor: '#2C2C2E',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1F1F1F',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});
