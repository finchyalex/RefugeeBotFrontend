import { Text, View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Go back to home!</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
  },
});
