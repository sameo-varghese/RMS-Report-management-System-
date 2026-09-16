import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';

const demoActivities = [
  {
    id: 'act-1',
    title: 'National Workshop on Generative AI & LLM Architecture',
    category: 'Workshop',
    activity_date: '2026-08-15',
    venue: 'UCC Computer Applications Seminar Hall',
    participants_count: 115,
    faculty_name: 'Prof. Anitha Mary',
    description: 'The School of Computer Applications conducted a 2-day hands-on workshop covering PyTorch, Hugging Face transformers, and Retrieval Augmented Generation (RAG). Students built autonomous web agents and PDF Q&A bots.',
  },
];

const CATEGORIES = ['All', 'Workshop', 'Seminar', 'Guest Lecture', 'FDP', 'Industrial Visit', 'Cultural', 'Technical Competition'];

export default function MobileArchive() {
  const [activities] = useState(demoActivities);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = activities.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.pageTitle}>Activity Archive</Text>
        <Text style={styles.pageSubtitle}>School of Computer Applications, UCC Aluva</Text>

        {/* Keyword Search */}
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search keyword (e.g. AI, Python, IoT)..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Category Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.pill, category === cat && styles.activePill]}
            >
              <Text style={[styles.pillText, category === cat && styles.activePillText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No activities match your search.</Text>
          </View>
        ) : (
          filtered.map(act => (
            <View key={act.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.catBadge}>
                  <Text style={styles.catText}>{act.category}</Text>
                </View>
                <Text style={styles.dateText}>{act.activity_date}</Text>
              </View>
              <Text style={styles.cardTitle}>{act.title}</Text>
              <Text style={styles.cardMeta} numberOfLines={2}>{act.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.metaItem}>📍 {act.venue}</Text>
                <Text style={styles.metaItem}>👥 {act.participants_count}</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#1F3864' },
  pageSubtitle: { fontSize: 11, color: '#64748B', marginBottom: 14 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
  },
  pillRow: { marginBottom: 14 },
  pill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  activePill: { backgroundColor: '#1A7A6A' },
  pillText: { fontSize: 11, fontWeight: '600', color: '#475569' },
  activePillText: { color: '#FFFFFF' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 13, color: '#94A3B8' },
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
  dateText: { fontSize: 11, color: '#94A3B8' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cardMeta: { fontSize: 11, color: '#64748B' },
  cardFooter: { flexDirection: 'row', gap: 12, marginTop: 4 },
  metaItem: { fontSize: 11, color: '#475569', fontWeight: '600' },
});
