import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ArtPreviewWizard } from '../../../components/ArtPreviewWizard';
import { ArtPreviewWizardProvider } from '../../../contexts/ArtPreviewWizardContext';

export default function ArtPreviewScreen() {
  return (
    <View style={styles.container}>
      <ArtPreviewWizardProvider>
        <ArtPreviewWizard />
      </ArtPreviewWizardProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
}); 