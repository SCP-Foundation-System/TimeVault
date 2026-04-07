import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../theme/colors';

interface FormFieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function FormField({ label, hint, ...inputProps }: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#95A0B7"
        style={styles.input}
        {...inputProps}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFF',
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15
  },
  hint: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 6
  }
});
