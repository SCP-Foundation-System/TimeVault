import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingData } from '../types/onboarding';
import { colors } from '../theme/colors';

interface MainScreenProps {
  profile: OnboardingData | null;
}

export function MainScreen({ profile }: MainScreenProps) {
  const greeting = profile?.name?.trim() ? `Hallo ${profile.name.trim()}!` : 'Hallo!';
  const modeHint = profile?.workSettingsSkipped
    ? 'Flexibler Modus ist aktiv – Tracking funktioniert ohne feste Arbeitszeiten.'
    : 'Deine Standard-Arbeitszeit ist gespeichert und kann jederzeit angepasst werden.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{greeting}</Text>
      <Text style={styles.subtitle}>Dein TimeVault ist bereit.</Text>
      <Text style={styles.body}>
        Als nächstes kannst du Zeiterfassung, Live-Verdienstanzeige und Berichte ergänzen.
      </Text>
      <Text style={styles.meta}>{modeHint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center'
  },
  title: {
    fontSize: 30,
    color: colors.text,
    fontWeight: '800',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 10
  },
  body: {
    color: colors.subText,
    fontSize: 15,
    lineHeight: 24
  },
  meta: {
    marginTop: 12,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600'
  }
});
