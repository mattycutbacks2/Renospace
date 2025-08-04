import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../utils/supabaseClient';

export default function ResultDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Auth error', userError?.message || 'Not logged in');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) {
        Alert.alert('Load error', error.message);
      } else {
        setRecord(data);
      }
      setLoading(false);
    }
    if (id) fetchRecord();
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }
  if (!record) {
    return <View style={styles.center}><Text>Not found.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Design Detail</Text>
      <Text style={styles.label}>Prompt:</Text>
      <Text style={styles.prompt}>{record.prompt}</Text>
      <Text style={styles.label}>Original Image:</Text>
      <Image source={{ uri: record.original_url }} style={styles.image} resizeMode="cover" />
      <Text style={styles.label}>Result:</Text>
      <Image source={{ uri: record.result_url }} style={styles.image} resizeMode="cover" />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => Share.share({ url: record.result_url })}>
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push({ pathname: '/compose', params: { prompt: record.prompt, originalUrl: record.original_url } })}
        >
          <Text style={styles.buttonText}>Remix</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    padding: 20,
    paddingTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7FB',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#22223B',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A4E69',
    marginTop: 16,
    marginBottom: 4,
  },
  prompt: {
    fontSize: 16,
    color: '#22223B',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: '#E9ECEF',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  button: {
    backgroundColor: '#5F6DFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}); 