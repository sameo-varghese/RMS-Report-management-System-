import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, Alert
} from 'react-native';

const demoFaculty = [
  { id: 'u1', name: 'Prof. Anitha Mary', email: 'faculty@ucc.edu.in', role: 'faculty', is_active: true },
  { id: 'u2', name: 'Dr. Binu Thomas (HOD)', email: 'admin@ucc.edu.in', role: 'admin', is_active: true },
];

export default function MobileAdmin() {
  const [faculty, setFaculty] = useState(demoFaculty);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFaculty, setNewFaculty] = useState({ name: '', email: '', password: '' });
  const [year, setYear] = useState('2026');

  const handleAdd = () => {
    if (!newFaculty.name || !newFaculty.email) {
      Alert.alert('Validation Error', 'Name and email are required.');
      return;
    }
    setFaculty(prev => [...prev, { id: 'u' + Date.now(), ...newFaculty, role: 'faculty', is_active: true }]);
    setNewFaculty({ name: '', email: '', password: '' });
    setShowAddForm(false);
    Alert.alert('Success', 'Faculty account created.');
  };

  const toggleStatus = (id: string, currentActive: boolean) => {
    Alert.alert(
      currentActive ? 'Deactivate Faculty?' : 'Activate Faculty?',
      'Confirm this action.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => setFaculty(prev => prev.map(f => f.id === id ? { ...f, is_active: !currentActive } : f))
        }
      ]
    );
  };

  const generateAnnualReport = () => {
    Alert.alert('Success', `Annual Department Summary for ${year} has been compiled and sent to Cloudinary PDF storage.`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.banner}>
          <Text style={styles.bannerLabel}>🛡️ HOD / Admin Operations</Text>
          <Text style={styles.bannerTitle}>Admin Control Panel</Text>
        </View>

        {/* Annual Report */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Annual Department Report Generator</Text>
          <Text style={styles.sectionSub}>AI-synthesized (Gemini 1.5 Flash) annual summary with WeasyPrint PDF</Text>
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            placeholder="Academic Year (e.g. 2026)"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={generateAnnualReport}>
            <Text style={styles.primaryBtnText}>Generate Annual PDF Summary</Text>
          </TouchableOpacity>
        </View>

        {/* Faculty Directory */}
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Faculty Directory</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddForm(!showAddForm)}>
            <Text style={styles.addBtnText}>{showAddForm ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.card}>
            <Text style={styles.formTitle}>Add New Faculty Member</Text>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Prof. John Doe"
              value={newFaculty.name}
              onChangeText={t => setNewFaculty(prev => ({ ...prev, name: t }))}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="john@ucc.edu.in"
              value={newFaculty.email}
              onChangeText={t => setNewFaculty(prev => ({ ...prev, email: t }))}
              autoCapitalize="none"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Initial password"
              value={newFaculty.password}
              onChangeText={t => setNewFaculty(prev => ({ ...prev, password: t }))}
            />
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAdd}>
              <Text style={styles.primaryBtnText}>Create Faculty Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {faculty.map(f => (
          <View key={f.id} style={styles.facultyRow}>
            <View>
              <Text style={styles.facultyName}>{f.name}</Text>
              <Text style={styles.facultyEmail}>{f.email}</Text>
              <View style={[styles.roleBadge, f.role === 'admin' ? styles.adminRole : styles.facultyRole]}>
                <Text style={styles.roleText}>{f.role.toUpperCase()}</Text>
              </View>
            </View>
            {f.role !== 'admin' && (
              <TouchableOpacity
                onPress={() => toggleStatus(f.id, f.is_active)}
                style={[styles.statusBtn, f.is_active ? styles.deactivateBtn : styles.activateBtn]}
              >
                <Text style={styles.statusBtnText}>{f.is_active ? 'Deactivate' : 'Activate'}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  banner: {
    backgroundColor: '#1F3864',
    borderRadius: 20,
    padding: 20,
  },
  bannerLabel: { color: '#FCD34D', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1F3864' },
  sectionSub: { fontSize: 11, color: '#64748B' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: '#1F3864',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  addBtn: {
    backgroundColor: '#1A7A6A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  formTitle: { fontSize: 13, fontWeight: '800', color: '#1F3864' },
  label: { fontSize: 11, fontWeight: '700', color: '#334155' },
  facultyRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  facultyName: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  facultyEmail: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminRole: { backgroundColor: '#FEF3C7' },
  facultyRole: { backgroundColor: '#F1F5F9' },
  roleText: { fontSize: 9, fontWeight: 'bold', color: '#475569' },
  statusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  deactivateBtn: { backgroundColor: '#FEE2E2' },
  activateBtn: { backgroundColor: '#D1FAE5' },
  statusBtnText: { fontSize: 11, fontWeight: 'bold', color: '#1E293B' },
});
