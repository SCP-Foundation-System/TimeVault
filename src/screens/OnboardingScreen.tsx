import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { FormField } from '../components/FormField';
import { colors } from '../theme/colors';
import { CurrencyCode, OnboardingData } from '../types/onboarding';

interface OnboardingScreenProps {
  initialData: OnboardingData;
  onFinish: (data: OnboardingData) => void;
}

const TOTAL_STEPS = 4;

export function OnboardingScreen({ initialData, onFinish }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [error, setError] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);

  const transition = useRef(new Animated.Value(1)).current;

  const derivedHourlyRate = useMemo(() => {
    const monthly = Number(data.monthlySalary.replace(',', '.'));
    const hoursPerDay = Number(data.defaultHoursPerDay.replace(',', '.'));

    if (!monthly || !hoursPerDay) return null;

    const monthlyWorkHours = hoursPerDay * 21.67;
    if (monthlyWorkHours <= 0) return null;

    return (monthly / monthlyWorkHours).toFixed(2);
  }, [data.monthlySalary, data.defaultHoursPerDay]);

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic)
    }).start();
  }, [step, transition]);

  const validateStep = () => {
    if (step === 1) {
      return Boolean(data.currency);
    }

    if (step === 2) {
      if (data.compensationMode === 'hourly') {
        return Number(data.hourlyRate.replace(',', '.')) > 0;
      }
      return Boolean(derivedHourlyRate);
    }

    if (step === 3) {
      if (data.workSettingsSkipped) return true;

      return (
        Number(data.defaultHoursPerDay.replace(',', '.')) > 0 &&
        Number(data.breakMinutes.replace(',', '.')) >= 0
      );
    }

    return true;
  };

  const nextStep = () => {
    setError('');
    if (!validateStep()) {
      setError('Bitte prüfe deine Eingaben.');
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    const finalData =
      data.compensationMode === 'monthly' && derivedHourlyRate
        ? { ...data, hourlyRate: derivedHourlyRate }
        : data;

    onFinish(finalData);
  };

  const goBack = () => {
    setError('');
    if (step > 1) setStep((prev) => prev - 1);
  };

  const progressText = step <= 3 ? `Schritt ${step} von 3` : 'Zusammenfassung';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.progress}>{progressText}</Text>
        <Text style={styles.title}>Ersteinrichtung</Text>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: transition,
              transform: [
                {
                  translateY: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0]
                  })
                }
              ]
            }
          ]}
        >
          {step === 1 && (
            <>
              <Text style={styles.headline}>Lass uns dich kurz einrichten 👋</Text>
              <FormField
                label="Name (optional)"
                placeholder="z. B. Alex"
                value={data.name}
                onChangeText={(value) => setData((prev) => ({ ...prev, name: value }))}
              />

              <Text style={styles.fieldLabel}>Währung</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={data.currency}
                  onValueChange={(value) =>
                    setData((prev) => ({ ...prev, currency: value as CurrencyCode }))
                  }
                >
                  <Picker.Item label="EUR (€)" value="EUR" />
                  <Picker.Item label="USD ($)" value="USD" />
                  <Picker.Item label="CHF (CHF)" value="CHF" />
                  <Picker.Item label="GBP (£)" value="GBP" />
                </Picker>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={styles.headline}>Wie möchtest du dein Gehalt angeben? 💸</Text>

              <View style={styles.modeRow}>
                <ChoiceChip
                  label="Stundenlohn"
                  selected={data.compensationMode === 'hourly'}
                  onPress={() => setData((prev) => ({ ...prev, compensationMode: 'hourly' }))}
                />
                <ChoiceChip
                  label="Monatsgehalt"
                  selected={data.compensationMode === 'monthly'}
                  onPress={() => setData((prev) => ({ ...prev, compensationMode: 'monthly' }))}
                />
              </View>

              {data.compensationMode === 'hourly' ? (
                <FormField
                  label="Stundenlohn"
                  placeholder="z. B. 18.50"
                  keyboardType="decimal-pad"
                  value={data.hourlyRate}
                  onChangeText={(value) => setData((prev) => ({ ...prev, hourlyRate: value }))}
                />
              ) : (
                <>
                  <FormField
                    label="Monatsgehalt"
                    placeholder="z. B. 3200"
                    keyboardType="decimal-pad"
                    value={data.monthlySalary}
                    onChangeText={(value) => setData((prev) => ({ ...prev, monthlySalary: value }))}
                  />
                  <Text style={styles.helperText}>
                    Automatisch berechneter Stundenlohn:{' '}
                    {derivedHourlyRate ? `${derivedHourlyRate} ${data.currency}` : 'Bitte Gehalt + Stunden/Tag angeben'}
                  </Text>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <Text style={styles.headline}>Arbeitszeit (optional)</Text>
              <FormField
                label="Arbeitsstunden pro Tag"
                placeholder="z. B. 8"
                keyboardType="decimal-pad"
                value={data.defaultHoursPerDay}
                onChangeText={(value) =>
                  setData((prev) => ({ ...prev, defaultHoursPerDay: value, workSettingsSkipped: false }))
                }
              />
              <FormField
                label="Pausendauer in Minuten"
                placeholder="z. B. 30"
                keyboardType="number-pad"
                value={data.breakMinutes}
                onChangeText={(value) =>
                  setData((prev) => ({ ...prev, breakMinutes: value, workSettingsSkipped: false }))
                }
              />

              <Pressable style={styles.skipButton} onPress={() => setShowSkipModal(true)}>
                <Text style={styles.skipText}>Überspringen</Text>
              </Pressable>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={styles.headline}>Fast fertig ✅</Text>
              <SummaryItem label="Name" value={data.name.trim() || 'Nicht angegeben'} />
              <SummaryItem label="Währung" value={data.currency} />
              <SummaryItem
                label="Vergütung"
                value={data.compensationMode === 'hourly' ? 'Stundenlohn' : 'Monatsgehalt'}
              />
              <SummaryItem label="Stundenlohn" value={`${data.hourlyRate || derivedHourlyRate || '—'} ${data.currency}`} />
              {data.compensationMode === 'monthly' && (
                <SummaryItem label="Monatsgehalt" value={`${data.monthlySalary || '—'} ${data.currency}`} />
              )}
              <SummaryItem
                label="Arbeitszeiten"
                value={data.workSettingsSkipped ? 'Flexibel (übersprungen)' : `${data.defaultHoursPerDay} h / Tag`}
              />
              <SummaryItem
                label="Pause"
                value={data.workSettingsSkipped ? 'Keine feste Pause' : `${data.breakMinutes} Minuten`}
              />
            </>
          )}
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <View style={styles.flexButton}>
              <AppButton title="Zurück" onPress={goBack} />
            </View>
          )}
          <View style={styles.flexButton}>
            <AppButton title={step === 4 ? 'Starten' : 'Weiter'} onPress={nextStep} />
          </View>
        </View>
      </ScrollView>

      <Modal visible={showSkipModal} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Schritt überspringen?</Text>
            <Text style={styles.modalBody}>
              Wenn du diesen Schritt überspringst, gehen wir davon aus, dass du keine festen Arbeitszeiten oder Pausen hast. Das ist perfekt für flexible Jobs wie z.B. Schulassistenzen.
            </Text>

            <View style={styles.modalButtons}>
              <AppButton
                title="Trotzdem überspringen"
                onPress={() => {
                  setData((prev) => ({
                    ...prev,
                    workSettingsSkipped: true,
                    defaultHoursPerDay: '',
                    breakMinutes: ''
                  }));
                  setShowSkipModal(false);
                  setStep(4);
                }}
              />
              <AppButton title="Zurück" onPress={() => setShowSkipModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected ? styles.chipActive : styles.chipInactive]}>
      <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  container: { paddingHorizontal: 20, paddingVertical: 28, gap: 14 },
  progress: { color: colors.subText, fontSize: 13, fontWeight: '700' },
  title: { color: colors.text, fontSize: 30, fontWeight: '800' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border
  },
  headline: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    overflow: 'hidden'
  },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  chip: {
    flex: 1,
    borderRadius: 14,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipActive: { backgroundColor: colors.primarySoft },
  chipInactive: { backgroundColor: '#F0F3FA' },
  chipText: { color: colors.subText, fontWeight: '700' },
  chipTextActive: { color: colors.primary },
  helperText: { marginTop: 4, color: colors.subText, fontSize: 13, lineHeight: 20 },
  skipButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#EEF2FF'
  },
  skipText: { color: colors.primary, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FA',
    paddingVertical: 9
  },
  summaryLabel: { color: colors.subText, fontWeight: '600' },
  summaryValue: { color: colors.text, fontWeight: '700' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  flexButton: { flex: 1 },
  error: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 14, 30, 0.56)',
    justifyContent: 'center',
    padding: 20
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    gap: 12
  },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  modalBody: { color: colors.subText, lineHeight: 22, fontSize: 14 },
  modalButtons: { gap: 10 }
});
