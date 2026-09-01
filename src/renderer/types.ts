export type TabType = 'main' | 'history' | 'settings' | 'account' | 'input-recognition';

export interface HistoryItem {
  id: string;
  text: string;
  wordCount: number;
  charCount: number;
  timestamp: number;
  source: 'manual' | 'ai';
  preview: string;
}

export interface AppSettings {
  defaultWpm: number;
  jitterVariance: number; // e.g. 35 for ±35%
  countdownBufferSeconds: number; // e.g. 2s
  enablePunctuationPauses: boolean;
}

export interface AccountState {
  tier: 'free' | 'cloud_pro';
  licenseKey: string;
  apiKey: string;
  isLicenseValid: boolean;
}
