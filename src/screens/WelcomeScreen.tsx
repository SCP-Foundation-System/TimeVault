import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { colors } from '../theme/colors';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.kicker}>Willkommen 👋</Text>
        <Text style={styles.title}>TimeVault</Text>
        <Text style={styles.slogan}>Tracke deine Zeit. Kenne deinen Wert.</Text>
        <Text style={styles.body}>
          Richte die App in wenigen Schritten ein und starte ohne Abo, Werbung oder versteckte Kosten.
        </Text>
      </View>

      <AppButton title="Los geht&apos;s" onPress={onStart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 36,
    justifyContent: 'space-between'
  },
  kicker: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.subText,
    marginBottom: 10
  },
  title: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.4,
    marginBottom: 10
  },
  slogan: {
    fontSize: 22,
    lineHeight: 30,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 14
  },
  body: {
    color: colors.subText,
    fontSize: 15,
    lineHeight: 24
  }
});
