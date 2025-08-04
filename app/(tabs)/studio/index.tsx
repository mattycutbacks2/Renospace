import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const TOOLS = [
  {
    id: 'colortouch',
    title: 'Color Touch',
    description: 'Transform your space by changing colors in your photos',
    icon: 'color-palette',
    route: '/studio/colortouch',
    image: require('../../../assets/images/art tool tn.jpg')
  },
  {
    id: 'objectswap',
    title: 'Object Swap',
    description: 'Replace furniture and decor items seamlessly',
    icon: 'swap-horizontal',
    route: '/studio/objectswap',
    image: require('../../../assets/images/object swapper.jpg')
  },
  {
    id: 'floorplan360',
    title: 'Floorplan 360',
    description: 'Create virtual tours from floor plans with 3D dollhouse views',
    icon: 'cube',
    route: '/studio/floorplan360',
    image: require('../../../assets/images/designlivingroomorange.jpg')
  },
  {
    id: 'stylesync',
    title: 'Style Sync',
    description: 'Match your space to your personal style',
    icon: 'brush',
    route: '/studio/stylesync',
    image: require('../../../assets/images/designofficepink.jpg')
  },
  {
    id: 'gardenrender',
    title: 'Garden Render',
    description: 'Design beautiful outdoor spaces',
    icon: 'leaf',
    route: '/studio/gardenrender',
    image: require('../../../assets/images/yard and patio thumbnail.jpg')
  },
  {
    id: 'hottub',
    title: 'Can I Get a Hot Tub?',
    description: 'Add luxury features to your space',
    icon: 'water',
    route: '/studio/canigetahottub',
    image: require('../../../assets/images/designhottub.jpg')
  },
  {
    id: 'virtualstager',
    title: 'Virtual Stager',
    description: 'Stage your home for sale or rental',
    icon: 'home',
    route: '/studio/virtualstager',
    image: require('../../../assets/images/stagethumbnail.jpg')
  },
  {
    id: 'artpreview',
    title: 'Art Preview',
    description: 'Visualize artwork in your space',
    icon: 'image',
    route: '/studio/artpreview',
    image: require('../../../assets/images/art tool tn.jpg')
  }
];

export default function StudioScreen() {
  const handleToolPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Design Studio</Text>
          <Text style={styles.subtitle}>
            Choose your design tool and transform your space
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsContainer}>
          {TOOLS.map((tool, index) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => handleToolPress(tool.route)}
              activeOpacity={0.8}
            >
              <View style={styles.toolContent}>
                {/* Image */}
                <Image
                  source={tool.image}
                  style={styles.toolImage}
                  resizeMode="cover"
                />
                
                {/* Content */}
                <View style={styles.toolInfo}>
                  <View style={styles.toolHeader}>
                    <Ionicons name={tool.icon as any} size={20} color="#6B46C1" style={styles.toolIcon} />
                    <Text style={styles.toolTitle}>
                      {tool.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  </View>
                  <Text style={styles.toolDescription}>
                    {tool.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  toolsContainer: {
    padding: 20,
  },
  toolCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  toolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  toolInfo: {
    flex: 1,
    padding: 16,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  toolIcon: {
    marginRight: 8,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
}); 