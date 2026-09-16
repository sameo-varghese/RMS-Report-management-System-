import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, SafeAreaView
} from 'react-native';

const API_BASE = 'http://10.0.2.2:8000'; // Android emulator → localhost

async function apiFetch(path: string) {
  const token = ''; // In production: read from SecureStore/AsyncStorage
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}

// Seed demo data for offline/emulator mode when backend isn't accessible
const demoActivities = [
  {
    id: 'act-1',
    title: 'National Workshop on Generative AI & LLM Architecture',
    category: 'Workshop',
    activity_date: '2026-08-15',
    venue: 'UCC Computer Applications Seminar Hall',
    participants_count: 115,
    faculty_name: 'Prof. Anitha Mary',
    has_report: true,
  },
];

const demoProposals = [
  {
    id: 'prop-1',
    title: 'National Workshop on Generative AI & LLM Architecture',
    category: 'Workshop',
    proposed_date: '2026-08-15',
    status: 'Approved',
    faculty_name: 'Prof. Anitha Mary',
  },
  {
    id: 'prop-2',
    title: 'Seminar on Cybersecurity & Cloud Threat Mitigation',
    category: 'Seminar',
    proposed_date: '2026-08-28',
    status: 'Pending',
    faculty_name: 'Dr. Binu Thomas',
  },
];

export default function MobileDashboard() {
  const [activities, setActivities] = useState(demoActivities);
  const [proposals, setProposals] = useState(demoProposals);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([apiFetch('/activities?limit=5'), apiFetch('/proposals')])
      .then(([acts, props]) => {
        setActivities(acts);
        setProposals(props);
      })
      .catch(() => {
        // Use seeded demo data on network failure
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = proposals.filter((p: any) => p.status === 'Pending').length;
  const approved = proposals.filter((p: any) => p.status === 'Approved').length;
  const totalParticipants = activities.reduce((s: number, a: any) => s + (a.participants_count || 0), 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>Academic Session 2026</Text>
          </View>
          <Text style={styles.bannerTitle}>Welcome, Prof. Anitha!</Text>
          <Text style={styles.bannerSub}>
            School of Computer Applications — UCC Aluva (Autonomous)
          </Text>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{proposals.length}</Text>
            <Text style={styles.statLabel}>Proposals</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#D97706' }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#059669' }]}>{activities.length}</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNum, { color: '#6366F1' }]}>{totalParticipants}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
        </View>

        {/* Recent Activities Feed */}
        <Text style={styles.sectionTitle}>Recent Departmental Activities</Text>
        {loading ? (
          <ActivityIndicator color="#1A7A6A" style={{ marginTop: 20 }} />
        ) : (
          activities.map((act: any) => (
            <View key={act.id} style={styles.actCard}>
              <View style={styles.actCardHeader}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{act.category}</Text>
                </View>
                <Text style={styles.actDate}>{act.activity_date}</Text>
              </View>
              <Text style={styles.actTitle} numberOfLines={2}>{act.title}</Text>
              <Text style={styles.actMeta}>📍 {act.venue} • {act.faculty_name}</Text>
              {act.has_report && (
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>📄 AI Report Available</Text>
                </View>
              )}
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  banner: {
    backgroundColor: '#1F3864',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerBadgeText: { color: '#A5F3FC', fontSize: 9, fontWeight: 'bold' },
  bannerTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  bannerSub: { color: '#BAE6FD', fontSize: 10, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statNum: { fontSize: 20, fontWeight: '800', color: '#1F3864' },
  statLabel: { fontSize: 9, fontWeight: '600', color: '#64748B', marginTop: 2 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F3864',
    marginBottom: 10,
  },
  actCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#E8F5F2',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: { color: '#0F5548', fontSize: 9, fontWeight: 'bold' },
  actDate: { color: '#94A3B8', fontSize: 10 },
  actTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  actMeta: { fontSize: 11, color: '#64748B' },
  reportBadge: {
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  reportBadgeText: { fontSize: 10, color: '#1E40AF', fontWeight: 'bold' },
});
