import React, { useMemo, useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { AppButton } from '../components/AppButton';
import { FormField } from '../components/FormField';
import { colors } from '../theme/colors';
import { CompensationMode, CurrencyCode, OnboardingData } from '../types/onboarding';

interface OnboardingScreenProps {
  initialData: OnboardingData;
  onFinish: (data: OnboardingData) => void;
}

const STEPS = 4;

export function OnboardingScreen({ initialData, onFinish }: OnboardingScreenProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [error, setError] = useState<string>('');

  const derivedHourlyRate = useMemo(() => {
    const monthly = Number(data.monthlySalary.replace(',', '.'));
    const hoursPerDay = Number(data.defaultHoursPerDay.replace(',', '.'));

    if (!monthly || !hoursPerDay) return null;

    // 21.67 ist die durchschnittliche Anzahl Arbeitstage pro Monat.
    const monthlyWorkHours = hoursPerDay * 21.67;
    if (monthlyWorkHours <= 0) return null;

    return (monthly / monthlyWorkHours).toFixed(2);
  }, [data.monthlySalary, data.defaultHoursPerDay]);

  const canContinue = () => {
    if (step === 1) {
      return Number(data.hourlyRate.replace(',', '.')) > 0;
    }

    if (step === 2) {
      return (
        Number(data.defaultHoursPerDay.replace(',', '.')) > 0 &&
        Number(data.breakMinutes.replace(',', '.')) >= 0
      );
    }

    if (step === 3) {
      if (data.compensationMode === 'hourly') {
        return Number(data.hourlyRate.replace(',', '.')) > 0;
      }

      return Boolean(derivedHourlyRate);
    }

    return true;
  };

  const handleNext = () => {
    setError('');
    if (!canContinue()) {
      setError('Bitte fülle alle benötigten Felder korrekt aus.');
      return;
    }

    if (step < STEPS) {
      setStep((prev) => prev + 1);
      return;
    }

    // Bei Monatsgehalt speichern wir den automatisch berechneten Stundenlohn persistiert ab.
    const finalData =
      data.compensationMode === 'monthly' && derivedHourlyRate
        ? { ...data, hourlyRate: derivedHourlyRate }
        : data;

    onFinish(finalData);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.progress}>Schritt {step} von {STEPS}</Text>
        <Text style={styles.title}>Ersteinrichtung</Text>

        <View style={styles.card}>{renderStep(step, data, setData, derivedHourlyRate)}</View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          {step > 1 ? (
            <View style={styles.flexButton}>
              <AppButton title="Zurück" onPress={handleBack} />
            </View>
          ) : null}
          <View style={styles.flexButton}>
            <AppButton
              title={step === STEPS ? 'Bestätigen & Starten' : 'Weiter'}
              onPress={handleNext}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function renderStep(
  step: number,
  data: OnboardingData,
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>,
  derivedHourlyRate: string | null
) {
  switch (step) {
    case 1:
      return (
        <>
          <FormField
            label="Name (optional)"
            placeholder="z. B. Alex"
            value={data.name}
            onChangeText={(value) => setData((prev) => ({ ...prev, name: value }))}
          />
          <FormField
            label="Stundenlohn"
            placeholder="z. B. 18.50"
            keyboardType="decimal-pad"
            value={data.hourlyRate}
            onChangeText={(value) => setData((prev) => ({ ...prev, hourlyRate: value }))}
            hint="Betrag pro Stunde"
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
      );

    case 2:
      return (
        <>
          <FormField
            label="Standard-Arbeitsstunden pro Tag"
            placeholder="z. B. 8"
            keyboardType="decimal-pad"
            value={data.defaultHoursPerDay}
            onChangeText={(value) => setData((prev) => ({ ...prev, defaultHoursPerDay: value }))}
          />
          <FormField
            label="Pausenzeit in Minuten"
            placeholder="z. B. 30"
            keyboardType="number-pad"
            value={data.breakMinutes}
            onChangeText={(value) => setData((prev) => ({ ...prev, breakMinutes: value }))}
          />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Pausen automatisch abziehen</Text>
              <Text style={styles.switchHint}>Zieht Pausen beim Tracking automatisch ab.</Text>
            </View>
            <Switch
              value={data.autoSubtractBreaks}
              onValueChange={(value) => setData((prev) => ({ ...prev, autoSubtractBreaks: value }))}
              trackColor={{ false: '#B0B8CC', true: '#9CAEFF' }}
              thumbColor={data.autoSubtractBreaks ? colors.primary : '#EEF2FA'}
            />
          </View>
        </>
      );

    case 3:
      return (
        <>
          <Text style={styles.fieldLabel}>Vergütungsmodell</Text>
          <View style={styles.modeRow}>
            <OptionCard
              label="Stundenlohn"
              selected={data.compensationMode === 'hourly'}
              onPress={() => setData((prev) => ({ ...prev, compensationMode: 'hourly' }))}
            />
            <OptionCard
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
              <Text style={styles.derivedLabel}>
                Automatischer Stundenlohn: {derivedHourlyRate ? `${derivedHourlyRate} ${data.currency}` : '—'}
              </Text>
            </>
          )}
        </>
      );

    case 4:
      return (
        <View style={{ gap: 8 }}>
          <SummaryItem label="Name" value={data.name.trim() || 'Nicht angegeben'} />
          <SummaryItem label="Währung" value={data.currency} />
          <SummaryItem
            label="Modell"
            value={data.compensationMode === 'hourly' ? 'Stundenlohn' : 'Monatsgehalt'}
          />
          <SummaryItem label="Stundenlohn" value={`${data.hourlyRate || '—'} ${data.currency}`} />
          {data.compensationMode === 'monthly' ? (
            <SummaryItem label="Monatsgehalt" value={`${data.monthlySalary || '—'} ${data.currency}`} />
          ) : null}
          <SummaryItem label="Arbeitsstunden/Tag" value={data.defaultHoursPerDay || '—'} />
          <SummaryItem label="Pause" value={`${data.breakMinutes || '—'} Minuten`} />
          <SummaryItem
            label="Pausenabzug"
            value={data.autoSubtractBreaks ? 'Automatisch aktiv' : 'Manuell'}
          />
        </View>
      );

    default:
      return null;
  }
}

function OptionCard({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      style={[styles.optionCard, selected ? styles.optionCardActive : styles.optionCardInactive]}
    >
      {label}
    </Text>
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
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 26,
    gap: 14
  },
  progress: {
    color: colors.subText,
    fontSize: 13,
    fontWeight: '600'
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8
  },
  switchHint: {
    color: colors.subText,
    fontSize: 12,
    marginTop: 4
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  optionCard: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    fontWeight: '700'
  },
  optionCardActive: {
    backgroundColor: colors.primarySoft,
    color: colors.primary
  },
  optionCardInactive: {
    backgroundColor: '#F1F4FA',
    color: colors.subText
  },
  derivedLabel: {
    marginTop: 2,
    fontSize: 13,
    color: colors.subText,
    fontWeight: '600'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1FA',
    paddingVertical: 10
  },
  summaryLabel: {
    color: colors.subText,
    fontWeight: '600'
  },
  summaryValue: {
    color: colors.text,
    fontWeight: '700'
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10
  },
  flexButton: {
    flex: 1
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600'
  }
});
