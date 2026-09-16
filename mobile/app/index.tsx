import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function MobileLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('faculty@ucc.edu.in');
  const [password, setPassword] = useState('faculty123');

  const handleLogin = () => {
    router.replace('/(tabs)/dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>School of Computer Applications</Text>
        </View>

        <Text style={styles.title}>Union Christian College</Text>
        <Text style={styles.subtitle}>Activity Report Management System (RMS)</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Institutional Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In to Mobile Portal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F5548',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  badge: {
    backgroundColor: '#E8F5F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#0F5548',
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F3864',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1A7A6A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
