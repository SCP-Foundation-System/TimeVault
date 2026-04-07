import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
  }
});
