import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { supabase } from '../../utils/supabaseClient';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48) / 2;

interface Design {
  id: string;
  result_url: string;
  prompt: string;
  original_url: string;
  created_at: string;
}

export default function MeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDesigns();
  }, []);

  const loadUserDesigns = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        Alert.alert('Error', 'Failed to get user data');
        return;
      }

      if (!user) {
        setDesigns([]);
        return;
      }

      const { data, error } = await supabase
        .from('generated_images')
        .select('id, result_url, prompt, original_url, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', 'Failed to load designs');
        return;
      }

      setDesigns(data || []);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (design: Design) => {
    // Navigate to edit screen or show edit modal
    Alert.alert('Edit', `Edit design: ${design.prompt}`);
  };

  const handleShare = (design: Design) => {
    // Implement sharing functionality
    Alert.alert('Share', `Share design: ${design.prompt}`);
  };

  const handleDelete = async (design: Design) => {
    Alert.alert(
      'Delete Design',
      'Are you sure you want to delete this design?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('generated_images')
                .delete()
                .eq('id', design.id);

              if (error) {
                Alert.alert('Error', 'Failed to delete design');
                return;
              }

              // Remove from local state
              setDesigns(prev => prev.filter(d => d.id !== design.id));
            } catch (error) {
              Alert.alert('Error', 'Something went wrong');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Design }) => (
    <View style={styles(theme).itemWrap}>
      <Image source={{ uri: item.result_url }} style={styles(theme).image} />
      <Text style={styles(theme).itemTitle} numberOfLines={2}>
        {item.prompt.length > 30 ? item.prompt.substring(0, 30) + '...' : item.prompt}
      </Text>
      <View style={styles(theme).actions}>
        <Pressable style={styles(theme).actionBtn} onPress={() => handleEdit(item)}>
          <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
        </Pressable>
        <Pressable style={styles(theme).actionBtn} onPress={() => handleShare(item)}>
          <Ionicons name="share-social-outline" size={20} color={theme.colors.primary} />
        </Pressable>
        <Pressable style={styles(theme).actionBtn} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </Pressable>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles(theme).container}>
        <View style={styles(theme).header}>
          <Text style={styles(theme).title}>My Designs</Text>
          <Pressable style={styles(theme).settingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={28} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles(theme).loadingText}>Loading your designs...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).header}>
        <Text style={styles(theme).title}>My Designs</Text>
        <Pressable style={styles(theme).settingsBtn} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={28} color={theme.colors.text} />
        </Pressable>
      </View>
      {designs.length === 0 ? (
        <View style={styles(theme).emptyContainer}>
          <Ionicons name="images-outline" size={64} color={theme.colors.textMuted} />
          <Text style={styles(theme).emptyTitle}>No designs yet</Text>
          <Text style={styles(theme).emptySubtitle}>
            Create your first design in the Studio or Compose tab
          </Text>
          <Pressable 
            style={styles(theme).createButton} 
            onPress={() => router.push('/(tabs)/studio')}
          >
            <Text style={styles(theme).createButtonText}>Start Creating</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={designs}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles(theme).row}
          contentContainerStyle={styles(theme).list}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadUserDesigns}
        />
      )}
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
  },
  settingsBtn: {
    padding: theme.spacing[2],
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
  },
  loadingText: {
    marginTop: theme.spacing[3],
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[5],
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.roundness.lg,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[4],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  itemWrap: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: ITEM_SIZE,
    marginHorizontal: theme.spacing[2],
    marginBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: theme.spacing[2],
    backgroundColor: '#eee',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
    gap: theme.spacing[2],
  },
  actionBtn: {
    padding: theme.spacing[2],
    borderRadius: 16,
  },
}); 