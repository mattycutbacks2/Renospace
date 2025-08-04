// app/style-picker.tsx
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native'

const STYLES = [
  { id: 'artdeco',            label: 'Art Deco',         asset: require('../assets/styles/artdeco.png') },
  { id: 'biophilic',          label: 'Biophilic',       asset: require('../assets/styles/biophilic.png') },
  { id: 'bohemian',           label: 'Bohemian',        asset: require('../assets/styles/bohemian.png') },
  { id: 'coastal',            label: 'Coastal',         asset: require('../assets/styles/coastal.png') },
  { id: 'coastalmodern',      label: 'Coastal Modern',  asset: require('../assets/styles/coastalmodern.png') },
  { id: 'contemporary',       label: 'Contemporary',    asset: require('../assets/styles/contemporary.png') },
  { id: 'cottagecore',        label: 'Cottagecore',     asset: require('../assets/styles/cottagecore.png') },
  { id: 'eclectic',           label: 'Eclectic',        asset: require('../assets/styles/eclectic.png') },
  { id: 'farmhouse',          label: 'Farmhouse',       asset: require('../assets/styles/farmhouse.png') },
  { id: 'frenchcountry',      label: 'French Country',  asset: require('../assets/styles/frenchcountry.png') },
  { id: 'gothicrevival',      label: 'Gothic Revival',  asset: require('../assets/styles/gothicrevival.png') },
  { id: 'hightech',           label: 'High Tech',       asset: require('../assets/styles/hightech.png') },
  { id: 'hollywoodregency',   label: 'Hollywood Regency', asset: require('../assets/styles/hollywoodregency.png') },
  { id: 'industrial',         label: 'Industrial',      asset: require('../assets/styles/industrial.png') },
  { id: 'japandi',            label: 'Japandi',         asset: require('../assets/styles/japandi.png') },
  { id: 'japanesezen',        label: 'Japanese Zen',    asset: require('../assets/styles/japanesezen.png') },
  { id: 'mediterranean',      label: 'Mediterranean',   asset: require('../assets/styles/mediterranean.png') },
  { id: 'midcentury',         label: 'Mid-Century',     asset: require('../assets/styles/midcentury.png') },
  { id: 'minimalist',         label: 'Minimalist',      asset: require('../assets/styles/minimalist.png') },
  { id: 'moderntraditional',  label: 'Modern Traditional', asset: require('../assets/styles/moderntraditional.png') },
  { id: 'moroccan',           label: 'Moroccan',        asset: require('../assets/styles/moroccan.png') },
  { id: 'retro70s',           label: 'Retro 70s',       asset: require('../assets/styles/retro70s.png') },
  { id: 'rustic',             label: 'Rustic',          asset: require('../assets/styles/rustic.png') },
  { id: 'scandinavian',       label: 'Scandinavian',    asset: require('../assets/styles/scandinavian.png') },
  { id: 'shabbychic',         label: 'Shabby Chic',     asset: require('../assets/styles/shabbychic.png') },
  { id: 'tropical',           label: 'Tropical',        asset: require('../assets/styles/tropical.png') },
  { id: 'tuscan',             label: 'Tuscan',          asset: require('../assets/styles/tuscan.png') },
  { id: 'urbanloft',          label: 'Urban Loft',      asset: require('../assets/styles/urbanloft.png') },
  { id: 'wabisabi',           label: 'Wabi-Sabi',       asset: require('../assets/styles/wabisabi.png') },
]

export default function StylePickerScreen() {
  const router = useRouter()
  const { roomType, imageUrl } = useLocalSearchParams<{ roomType: string; imageUrl: string }>()
  const { width } = Dimensions.get('window')
  const cardSize = (width - 48) / 2

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pick a Style for {roomType}</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {STYLES.map(({ id, label, asset }) => (
          <TouchableOpacity
            key={id}
            activeOpacity={0.85}
            style={[styles.card, { width: cardSize, height: cardSize }]}
            onPress={() => {
              router.push({
                pathname: '/ai-loading',
                params: { roomType, style: label, image: imageUrl }
              })
            }}
          >
            <Image source={asset} style={styles.thumb} />
            <Text style={styles.cardText}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 16 },
  title:     { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: '#222' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 18, paddingBottom: 24 },
  card:      {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  thumb:     { width: '100%', height: '75%', borderTopLeftRadius: 18, borderTopRightRadius: 18, resizeMode: 'cover' },
  cardText:  { padding: 10, fontSize: 16, color: '#222', textAlign: 'center', fontWeight: '700', letterSpacing: 0.2 },
})


