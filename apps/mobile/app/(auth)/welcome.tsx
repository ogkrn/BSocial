import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Ionicons name="school" size={48} color="white" />
          </View>
          <Text style={styles.appName}>BSocial</Text>
          <Text style={styles.subtitle}>Social Platform</Text>
        </View>

        {/* Hero text */}
        <View style={styles.heroContainer}>
          <Text style={styles.heroTitle}>
            Connect with your{'\n'}community
          </Text>
          <Text style={styles.heroSubtitle}>
            The social platform to share and connect
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </Link>

          <Text style={styles.footerText}>
            Join our community today!
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
  heroContainer: {
    alignItems: 'center',
  },
  heroTitle: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: 14,
    marginTop: 16,
  },
});
