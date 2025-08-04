import React from 'react';
import { StyleSheet } from 'react-native';
import ComposeWizard from '../compose/index';

export default function ComposeTabScreen() {
  return <ComposeWizard />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
}); 