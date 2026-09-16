import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, TextInput, Alert
} from 'react-native';
import { VoiceInputButton } from '../../components/VoiceInputButton';

const demoProposals = [
  {
    id: 'prop-1',
    title: 'National Workshop on Generative AI & LLM Architecture',
    category: 'Workshop',
    proposed_date: '2026-08-15',
    status: 'Approved',
    admin_remarks: 'Approved by HOD. Excellent initiative.',
    faculty_name: 'Prof. Anitha Mary',
    venue: 'UCC Computer Applications Seminar Hall',
  },
  {
    id: 'prop-2',
    title: 'Seminar on Cybersecurity & Cloud Threat Mitigation',
    category: 'Seminar',
    proposed_date: '2026-08-28',
    status: 'Pending',
    admin_remarks: null,
    faculty_name: 'Prof. Anitha Mary',
    venue: 'Main Auditorium',
  },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Approved: { bg: '#D1FAE5', text: '#065F46' },
  Pending:  { bg: '#FEF3C7', text: '#92400E' },
  Rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function MobileProposals() {
  const [proposals, setProposals] = useState(demoProposals);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Workshop', venue: '', proposed_date: '2026-09-01', description: ''
  });

  const handleVoiceDescription = (text: string) => {
    setFormData(prev => ({ ...prev, description: prev.description ? `${prev.description} ${text}` : text }));
  };

  const handleSubmit = () => {
    const newProp = {
      id: 'prop-' + Date.now(),
      ...formData,
      status: 'Pending',
      admin_remarks: null,
      faculty_name: 'Prof. Anitha Mary',
    };
    setProposals(prev => [newProp, ...prev]);
    setFormData({ title: '', category: 'Workshop', venue: '', proposed_date: '2026-09-01', description: '' });
    setShowForm(false);
    Alert.alert('Submitted!', 'Proposal submitted successfully for HOD approval.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity Proposals</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => setShowForm(!showForm)}>
            <Text style={styles.newBtnText}>{showForm ? 'Cancel' : '+ New Proposal'}</Text>
          </TouchableOpacity>
        </View>

        {/* New Proposal Inline Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Submit New Proposal</Text>

            <Text style={styles.label}>Activity Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Guest Lecture on DevOps"
              value={formData.title}
              onChangeText={t => setFormData(prev => ({ ...prev, title: t }))}
            />

            <Text style={styles.label}>Venue *</Text>
            <TextInput
              style={styles.input}
              placeholder="UCC Seminar Hall"
              value={formData.venue}
              onChangeText={t => setFormData(prev => ({ ...prev, venue: t }))}
            />

            <Text style={styles.label}>Description (Use Voice Dictate below) *</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Describe the activity objectives and format..."
              value={formData.description}
              onChangeText={t => setFormData(prev => ({ ...prev, description: t }))}
            />
            <VoiceInputButton onSpeechResult={handleVoiceDescription} label="🎤 Voice Dictate Description" />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Submit Proposal for Approval</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Proposals List */}
        {proposals.map((p: any) => {
          const statusStyle = STATUS_COLORS[p.status] || STATUS_COLORS.Pending;
          return (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catText}>{p.category}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{p.status}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{p.title}</Text>
              <Text style={styles.cardMeta}>📅 {p.proposed_date} • 📍 {p.venue}</Text>
              {p.admin_remarks && (
                <View style={styles.remarksBox}>
                  <Text style={styles.remarksText}>Admin: {p.admin_remarks}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F3864' },
  newBtn: {
    backgroundColor: '#1A7A6A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  formTitle: { fontSize: 14, fontWeight: '800', color: '#1F3864', marginBottom: 4 },
  label: { fontSize: 11, fontWeight: '700', color: '#334155' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: '#1A7A6A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catBadge: {
    backgroundColor: '#E8F5F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catText: { fontSize: 9, fontWeight: 'bold', color: '#0F5548' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B' },
  remarksBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  remarksText: { fontSize: 11, color: '#475569' },
});
