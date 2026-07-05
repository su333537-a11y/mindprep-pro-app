import { useState, useEffect } from 'react';
import { UserData, BankData } from './types';
import { defaultCerts } from './data';
import { db, initAuth } from './lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const STORE_KEY = 'eisei1_v1';

let globalData: UserData | null = null;
const listeners = new Set<(data: UserData) => void>();
let currentUid: string | null = null;
let isInitialized = false;

const getInitialState = (): UserData => {
  if (globalData) return globalData;
  try {
    const item = localStorage.getItem(STORE_KEY);
    if (item) {
      const parsed = JSON.parse(item);
      globalData = {
        certs: parsed.certs || defaultCerts(),
        bankData: parsed.bankData || {},
        ui: parsed.ui || { openCats: {}, sorted: false, catOrder: [], theme: 'pink' },
      };
      return globalData;
    }
  } catch (e) {
    console.warn('Failed to parse localStorage data:', e);
  }
  globalData = {
    certs: defaultCerts(),
    bankData: {},
    ui: {
      openCats: { labor: true },
      sorted: false,
      catOrder: [],
      theme: 'pink',
    },
  };
  return globalData;
};

// Initialize Firebase Auth and Data Sync
const initializeFirebaseSync = () => {
  if (isInitialized) return;
  isInitialized = true;

  initAuth((user) => {
    if (user) {
      currentUid = user.uid;
      const userRef = doc(db, 'users', user.uid);
      
      onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data() as UserData;
          globalData = {
            certs: remoteData.certs || defaultCerts(),
            bankData: remoteData.bankData || {},
            ui: remoteData.ui || { openCats: {}, sorted: false, catOrder: [], theme: 'pink' },
          };
          localStorage.setItem(STORE_KEY, JSON.stringify(globalData));
          listeners.forEach(l => l(globalData!));
        } else {
          // If no remote data, upload the local data we have
          if (globalData) {
            setDoc(userRef, globalData).catch(console.error);
          }
        }
      });
    }
  });
};

export const useStore = () => {
  const [data, setData] = useState<UserData>(getInitialState);

  useEffect(() => {
    initializeFirebaseSync();
    listeners.add(setData);
    return () => { listeners.delete(setData); };
  }, []);

  const updateData = (updater: (prev: UserData) => UserData) => {
    globalData = updater(globalData || getInitialState());
    localStorage.setItem(STORE_KEY, JSON.stringify(globalData));
    listeners.forEach(l => l(globalData!));
    
    // Sync to Firestore
    if (currentUid && globalData) {
      setDoc(doc(db, 'users', currentUid), globalData).catch(console.error);
    }
  };

  const getBankData = (bankId: string): BankData => {
    return data.bankData[bankId] || { stats: {}, saved: [], wrong: [], history: [] };
  };

  return {
    data,
    updateData,
    getBankData,
  };
};
