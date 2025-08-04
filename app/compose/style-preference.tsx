import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { useCompose } from './_layout';

const STYLES = [
  { id: 'artdeco', name: 'Art Deco', image: require('../../assets/styles/artdeco.png') },
  { id: 'biophilic', name: 'Biophilic', image: require('../../assets/styles/biophilic.png') },
  { id: 'bohemian', name: 'Bohemian', image: require('../../assets/styles/bohemian.png') },
  { id: 'coastal', name: 'Coastal', image: require('../../assets/styles/coastal.png') },
  { id: 'coastalmodern', name: 'Coastal Modern', image: require('../../assets/styles/coastalmodern.png') },
  { id: 'contemporary', name: 'Contemporary', image: require('../../assets/styles/contemporary.png') },
  { id: 'cottagecore', name: 'Cottagecore', image: require('../../assets/styles/cottagecore.png') },
  { id: 'eclectic', name: 'Eclectic', image: require('../../assets/styles/eclectic.png') },
  { id: 'farmhouse', name: 'Farmhouse', image: require('../../assets/styles/farmhouse.png') },
  { id: 'frenchcountry', name: 'French Country', image: require('../../assets/styles/frenchcountry.png') },
  { id: 'gothicrevival', name: 'Gothic Revival', image: require('../../assets/styles/gothicrevival.png') },
  { id: 'hightech', name: 'High Tech', image: require('../../assets/styles/hightech.png') },
  { id: 'hollywoodregency', name: 'Hollywood Regency', image: require('../../assets/styles/hollywoodregency.png') },
  { id: 'industrial', name: 'Industrial', image: require('../../assets/styles/industrial.png') },
  { id: 'japandi', name: 'Japandi', image: require('../../assets/styles/japandi.png') },
  { id: 'japanesezen', name: 'Japanese Zen', image: require('../../assets/styles/japanesezen.png') },
  { id: 'mediterranean', name: 'Mediterranean', image: require('../../assets/styles/mediterranean.png') },
  { id: 'midcentury', name: 'Midcentury', image: require('../../assets/styles/midcentury.png') },
  { id: 'minimalist', name: 'Minimalist', image: require('../../assets/styles/minimalist.png') },
  { id: 'moderntraditional', name: 'Modern Traditional', image: require('../../assets/styles/moderntraditional.png') },
  { id: 'moroccan', name: 'Moroccan', image: require('../../assets/styles/moroccan.png') },
  { id: 'retro70s', name: 'Retro 70s', image: require('../../assets/styles/retro70s.png') },
  { id: 'rustic', name: 'Rustic', image: require('../../assets/styles/rustic.png') },
  { id: 'scandinavian', name: 'Scandinavian', image: require('../../assets/styles/scandinavian.png') },
  { id: 'shabbychic', name: 'Shabby Chic', image: require('../../assets/styles/shabbychic.png') },
  { id: 'tropical', name: 'Tropical', image: require('../../assets/styles/tropical.png') },
  { id: 'tuscan', name: 'Tuscan', image: require('../../assets/styles/tuscan.png') },
  { id: 'urbanloft', name: 'Urban Loft', image: require('../../assets/styles/urbanloft.png') },
  { id: 'wabisabi', name: 'Wabi Sabi', image: require('../../assets/styles/wabisabi.png') },
];

export default function StylePreferenceStep() {
  const theme = useTheme();
  const { style, setStyle } = useCompose();
  const router = useRouter();

  const handleStyleSelect = (selectedStyle: string) => {
    setStyle(selectedStyle);
  };

  return (
    <View style={styles(theme).container}>
      <Text style={styles(theme).title}>Choose your style preference</Text>
      <Text style={styles(theme).subtitle}>What design style speaks to you?</Text>
      <FlatList
        data={STYLES}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles(theme).row}
        contentContainerStyle={styles(theme).list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleStyleSelect(item.id)}
            style={({ pressed }) => [
              styles(theme).card,
              style === item.id && styles(theme).cardSelected,
              pressed && styles(theme).cardPressed
            ]}
          >
            <Image source={item.image} style={styles(theme).thumbnail} />
            <Text style={styles(theme).cardName}>{item.name}</Text>
          </Pressable>
        )}
      />
      <Pressable
        style={({ pressed }) => [
          styles(theme).nextButton,
          (!style || pressed) && styles(theme).nextButtonDisabled
        ]}
        onPress={() => router.push('/compose/color-scheme')}
        disabled={!style}
      >
        <Text style={styles(theme).nextButtonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing[5],
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
    lineHeight: 22,
  },
  list: {
    paddingBottom: theme.spacing[4],
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[6],
    paddingHorizontal: theme.spacing[4],
    marginBottom: 0,
    flex: 1,
    marginHorizontal: theme.spacing[2],
    borderWidth: 2,
    borderColor: 'transparent',
    ...theme.shadows.sm,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  cardPressed: {
    opacity: 0.85,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: theme.roundness.md,
    marginBottom: theme.spacing[2],
    resizeMode: 'cover',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.roundness.lg,
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing[4],
    width: '100%',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 