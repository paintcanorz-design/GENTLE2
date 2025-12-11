
export interface Phrase {
  jp: string;
  cn: string;
}

export interface SubCategory {
  label: string;
  phrases: Phrase[];
}

export interface MainCategory {
  label: string;
  subs: Record<string, SubCategory>;
}

export interface Database {
  [key: string]: MainCategory;
}

export interface AppSettings {
  fontSize: number;
  resultCount: number;
  showCN: boolean;
  showSpeak: boolean;
  customMin: number;
  customMax: number;
  voiceRate: number;
  voicePitch: number;
  copyAction: string;
  userXP: number;
  userLevel: number;
  userTheme: string;
  hideAd: boolean;
  darkMode: boolean; 
  totalCopies: number;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

export interface UserAchievement {
  unlocked: boolean;
  date: number;
}

export interface DisplayItem {
  base: Phrase;
  emoji: string;
  specificPos: number;
  isUpgraded?: boolean;
}

export interface SavedSubCategory {
  main: string;
  sub: string;
  label: string;
}

export interface SessionData {
  copyCount: number;
  lastCopyTime: number;
  comboCount: number;
  regenStreak: number;
  eroticStreak: number;
  cuteStreak: number;
  themeCount: Set<string>;
  voiceClickCount: number;
}
