import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const theme = useTheme();
  
  return (
    <View style={styles(theme).container}>
      {label && <Text style={styles(theme).label}>{label}</Text>}
      <View style={styles(theme).inputContainer}>
        {leftIcon && <View style={styles(theme).leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles(theme).input,
            leftIcon && styles(theme).inputWithLeftIcon,
            rightIcon && styles(theme).inputWithRightIcon,
            error && styles(theme).inputError,
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
        {rightIcon && <View style={styles(theme).rightIcon}>{rightIcon}</View>}
      </View>
      {(error || helperText) && (
        <Text style={[styles(theme).helperText, error && styles(theme).errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing[3],
  },
  label: {
    fontSize: theme.typography.bodyBold.fontSize,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing[1],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing[2],
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing[2],
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  leftIcon: {
    paddingLeft: theme.spacing[3],
    paddingRight: theme.spacing[2],
  },
  rightIcon: {
    paddingLeft: theme.spacing[2],
    paddingRight: theme.spacing[3],
  },
  helperText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing[1],
    marginLeft: theme.spacing[1],
  },
  errorText: {
    color: theme.colors.error,
  },
}); 