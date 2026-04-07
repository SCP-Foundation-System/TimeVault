import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/colors';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AppButton({ title, onPress, disabled = false }: AppButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: '#2D4DE0' }}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDisabled: {
    opacity: 0.45
  },
  buttonPressed: {
    opacity: 0.9
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  }
});
