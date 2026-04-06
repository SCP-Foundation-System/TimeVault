export type CompensationMode = 'hourly' | 'monthly';

export type CurrencyCode = 'EUR' | 'USD' | 'CHF' | 'GBP';

export interface OnboardingData {
  name: string;
  hourlyRate: string;
  monthlySalary: string;
  currency: CurrencyCode;
  defaultHoursPerDay: string;
  breakMinutes: string;
  autoSubtractBreaks: boolean;
  compensationMode: CompensationMode;
}
