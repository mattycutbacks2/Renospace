import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

function ErrorFallback({ error }: { error: Error }) {
  const theme = useTheme();
  
  return (
    <View style={styles(theme).container}>
      <View style={styles(theme).content}>
        <Text style={styles(theme).title}>Something went wrong</Text>
        <Text style={styles(theme).message}>
          {error?.message || 'An unexpected error occurred'}
        </Text>
        {__DEV__ && error && (
          <Text style={styles(theme).errorDetails}>
            {error.message}
          </Text>
        )}
        <TouchableOpacity style={styles(theme).retryButton} onPress={() => {}}>
          <Text style={styles(theme).retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  message: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.body.lineHeight,
    marginBottom: theme.spacing[4],
  },
  errorDetails: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing[4],
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.roundness.md,
  },
  retryText: {
    color: '#fff',
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: theme.typography.bodyBold.fontWeight as any,
  },
}); 