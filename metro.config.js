const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@/components': './components',
  '@/constants': './constants',
  '@/services': './services',
  '@/utils': './utils',
  '@/types': './types',
  '@/hooks': './hooks',
};

module.exports = config; 