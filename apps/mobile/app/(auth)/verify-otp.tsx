import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/lib/api';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { pendingEmail, login, setPendingEmail } = useAuthStore();

  const handleVerify = async () => {
    if (!otp || !password || !fullName || !username) {
      setError('Please fill in all required fields');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/register/complete', {
        email: pendingEmail,
        otp,
        password,
        fullName,
        username,
        branch,
        year,
      });
      
      const { user, accessToken } = response.data.data;
      await login(user, accessToken);
      setPendingEmail(null);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!pendingEmail) {
    router.replace('/(auth)/register');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Complete profile</Text>
            <Text style={styles.subtitle}>Code sent to: {pendingEmail}</Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.otpInput}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput value={fullName} onChangeText={setFullName} placeholder="John Doe" style={styles.input} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username *</Text>
              <TextInput value={username} onChangeText={setUsername} placeholder="johndoe" autoCapitalize="none" style={styles.input} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password *</Text>
              <TextInput value={password} onChangeText={setPassword} placeholder="Create a strong password" secureTextEntry style={styles.input} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Branch</Text>
              <TextInput value={branch} onChangeText={setBranch} placeholder="e.g., Computer Science" style={styles.input} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Year</Text>
              <TextInput value={year} onChangeText={setYear} placeholder="e.g., 2nd Year" style={styles.input} placeholderTextColor="#9ca3af" />
            </View>

            <TouchableOpacity onPress={handleVerify} disabled={isLoading} style={[styles.button, isLoading && styles.buttonDisabled]}>
              <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 32 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  header: { marginTop: 32, marginBottom: 24 },
  title: { fontSize: 30, fontWeight: 'bold', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 8 },
  form: { gap: 16 },
  errorBox: { backgroundColor: '#fef2f2', padding: 16, borderRadius: 12 },
  errorText: { color: '#dc2626' },
  inputGroup: { marginBottom: 4 },
  label: { color: '#374151', fontWeight: '500', marginBottom: 8 },
  input: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12, color: '#111827', fontSize: 16 },
  otpInput: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12, color: '#111827', fontSize: 24, textAlign: 'center', letterSpacing: 8 },
  button: { backgroundColor: '#667eea', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 18 },
});
