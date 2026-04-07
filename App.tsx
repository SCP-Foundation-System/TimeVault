import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MainScreen } from './src/screens/MainScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { onboardingStorage } from './src/storage/onboardingStorage';
import { colors } from './src/theme/colors';
import { OnboardingData } from './src/types/onboarding';

type AppFlow = 'loading' | 'intro' | 'welcome' | 'onboarding' | 'main';

const defaultOnboardingData: OnboardingData = {
  name: '',
  hourlyRate: '',
  monthlySalary: '',
  currency: 'EUR',
  defaultHoursPerDay: '8',
  breakMinutes: '30',
  autoSubtractBreaks: true,
  workSettingsSkipped: false,
  compensationMode: 'hourly'
};

export default function App() {
  const [flow, setFlow] = useState<AppFlow>('loading');
  const [profile, setProfile] = useState<OnboardingData | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      // Prüft beim Start, ob Onboarding schon abgeschlossen wurde.
      const completed = await onboardingStorage.getCompleted();

      if (!completed) {
        setFlow('intro');
        return;
      }

      const existingProfile = await onboardingStorage.getProfile();
      setProfile(existingProfile);
      setFlow('main');
    };

    void bootstrap();
  }, []);

  const onboardingInitialData = useMemo(() => {
    return profile ?? defaultOnboardingData;
  }, [profile]);

  const handleFinishOnboarding = async (data: OnboardingData) => {
    await onboardingStorage.saveProfile(data);
    await onboardingStorage.setCompleted(true);
    setProfile(data);
    setFlow('main');
  };

  const handleResetApp = async () => {
    await onboardingStorage.clearAll();
    setProfile(null);
    setShowResetModal(false);
    setFlow('welcome');
  };

  if (flow === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <>
      {flow === 'intro' ? <IntroScreen onDone={() => setFlow('welcome')} /> : null}
      {flow === 'welcome' ? <WelcomeScreen onStart={() => setFlow('onboarding')} /> : null}
      {flow === 'onboarding' ? (
        <OnboardingScreen initialData={onboardingInitialData} onFinish={handleFinishOnboarding} />
      ) : null}
      {flow === 'main' ? <MainScreen profile={profile} /> : null}
      {flow !== 'loading' ? (
        <Pressable
          onPress={() => setShowResetModal(true)}
          style={styles.resetButton}
          accessibilityRole="button"
          accessibilityLabel="App zurücksetzen"
        >
          <Text style={styles.resetLabel}>⟳</Text>
        </Pressable>
      ) : null}

      <Modal visible={showResetModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>App zurücksetzen?</Text>
            <Text style={styles.modalBody}>
              Alle Daten werden gelöscht und die App wird neu gestartet.
            </Text>

            <View style={styles.modalButtonRow}>
              <Pressable style={styles.secondaryButton} onPress={() => setShowResetModal(false)}>
                <Text style={styles.secondaryButtonText}>Abbrechen</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleResetApp}>
                <Text style={styles.primaryButtonText}>Zurücksetzen</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background
  },
  resetButton: {
    position: 'absolute',
    top: 48,
    right: 18,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(240,244,255,0.92)',
    borderWidth: 1,
    borderColor: colors.border
  },
  resetLabel: {
    color: colors.subText,
    fontSize: 18,
    fontWeight: '700'
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(9,14,30,0.5)'
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8
  },
  modalBody: {
    color: colors.subText,
    fontSize: 14,
    lineHeight: 21
  },
  modalButtonRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  secondaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FA'
  },
  secondaryButtonText: {
    color: colors.subText,
    fontWeight: '700'
  },
  primaryButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700'
  }
});
