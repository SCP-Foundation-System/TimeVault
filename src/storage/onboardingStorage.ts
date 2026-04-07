import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from '../types/onboarding';

const STORAGE_KEYS = {
  completed: 'timevault:onboarding-completed',
  profile: 'timevault:user-profile'
} as const;

export const onboardingStorage = {
  async clearAll(): Promise<void> {
    await AsyncStorage.clear();
  },

  async getCompleted(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.completed);
    return value === 'true';
  },

  async setCompleted(value: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.completed, String(value));
  },

  async saveProfile(profile: OnboardingData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  },

  async getProfile(): Promise<OnboardingData | null> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.profile);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as OnboardingData;
    } catch {
      return null;
    }
  }
};
