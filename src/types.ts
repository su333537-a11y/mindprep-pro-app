export type CertStatus = 'target' | 'learning' | 'done';

export type ThemeColor = 'pink' | 'blue' | 'green';

export interface Notice {
  date: string;
  title: string;
  body: string;
}

export interface Resource {
  label: string;
  url: string;
}

export interface Cert {
  id: string;
  kind: 'quiz' | 'generic';
  bank?: string;
  name: string;
  icon: string;
  status: CertStatus;
  note?: string;
  manualProg?: number;
  examDate?: string;
  notices: Notice[];
  resources: Resource[];
}

export interface Question {
  id: string | number;
  subject: string;
  topic: string;
  q: string;
  choices: string[];
  answer: number;
  exp: string;
  point: string;
}

export interface SubjectMeta {
  key: string;
  name: string;
  short: string;
  mock: number;
}

export interface BankMeta {
  name: string;
  pass: {
    overall: number;
    perSubj: number;
  };
  mockLabel: string;
  subjects: SubjectMeta[];
  questions: Question[];
}

export interface Stat {
  a: number; // attempted
  c: number; // correct
  last: boolean | null;
}

export interface HistoryRecord {
  date: number;
  mode: string;
  score: number;
  total: number;
}

export interface BankData {
  stats: Record<string, Stat>;
  saved: (string | number)[];
  wrong: (string | number)[];
  history: HistoryRecord[];
}

export interface UserData {
  certs: Cert[];
  bankData: Record<string, BankData>;
  ui: {
    openCats: Record<string, boolean>;
    sorted: boolean;
    catOrder: string[];
    theme?: ThemeColor;
  };
}
