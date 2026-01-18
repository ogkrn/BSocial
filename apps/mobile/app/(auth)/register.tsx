import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/lib/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { setPendingEmail } = useAuthStore();

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/register/initiate', { email });
      setPendingEmail(email);
      router.push('/(auth)/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Enter your email to get started</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="yourname@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📧 We'll send a 6-digit verification code to your email
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSendOtp}
              disabled={isLoading}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Sending...' : 'Send Verification Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 32 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: 32, marginBottom: 32 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280', fontSize: 18, marginTop: 8 },
  form: { gap: 16 },
  errorBox: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12 },
  errorText: { color: '#dc2626' },
  inputGroup: { marginBottom: 8 },
  label: { color: '#374151', fontWeight: '500', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12, color: '#111827', fontSize: 16 },
  infoBox: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 12 },
  infoText: { color: '#1d4ed8', fontSize: 14 },
  button: { backgroundColor: '#667eea', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
  footer: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: '#6b7280' },
  linkText: { color: '#667eea', fontWeight: '600' },
});
