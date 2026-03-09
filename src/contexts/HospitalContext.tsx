/**
 * HospitalContext
 *
 * Holds hospital-wide settings (name, address, etc.) in React state
 * and persists them to localStorage so they survive page refreshes.
 *
 * Usage:
 *   const { hospitalInfo, setHospitalInfo } = useHospital();
 *
 * Any component that reads hospitalInfo will re-render automatically
 * when settings are saved in the Settings page.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface HospitalInfo {
  name:        string;
  address:     string;
  phone:       string;
  email:       string;
  license:     string;
  timezone:    string;
  currency:    string;
  bedCapacity: string;
}

interface HospitalContextType {
  hospitalInfo:    HospitalInfo;
  setHospitalInfo: (info: HospitalInfo) => void;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------
const DEFAULT_HOSPITAL: HospitalInfo = {
  name:        'MediFlow Hospital',
  address:     '14, Healthcare Avenue, Mumbai, Maharashtra 400001',
  phone:       '+91 22 1234 5678',
  email:       'admin@mediflow.hospital',
  license:     'MH-HOSP-2021-00142',
  timezone:    'Asia/Kolkata',
  currency:    'INR',
  bedCapacity: '178',
};

const STORAGE_KEY = 'mediflow_hospital_info';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
const HospitalContext = createContext<HospitalContextType | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function HospitalProvider({ children }: { children: ReactNode }) {
  const [hospitalInfo, setInfoState] = useState<HospitalInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as HospitalInfo) : DEFAULT_HOSPITAL;
    } catch {
      return DEFAULT_HOSPITAL;
    }
  });

  const setHospitalInfo = (info: HospitalInfo) => {
    setInfoState(info);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  };

  return (
    <HospitalContext.Provider value={{ hospitalInfo, setHospitalInfo }}>
      {children}
    </HospitalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useHospital() {
  const ctx = useContext(HospitalContext);
  if (!ctx) throw new Error('useHospital must be used inside <HospitalProvider>');
  return ctx;
}
