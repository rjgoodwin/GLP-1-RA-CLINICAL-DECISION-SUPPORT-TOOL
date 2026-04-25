export type Gender = 'male' | 'female' | null;
export type PopulationType = 'general' | 'asian_indigenous' | null;

export interface PatientData {
  age: number;
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  bmi: number;
  waistCircumference: number;
  population: PopulationType;
  currentMedications: string[];
}

export interface Interaction {
  medication: string;
  severity: 'absolute' | 'relative' | 'monitoring';
  warning: string;
  management: string;
  recommendationLabel?: string;
}

export interface Complications {
  type2Diabetes: boolean;
  hypertension: boolean;
  dyslipidaemia: boolean;
  mafld: boolean; // Metabolic associated fatty liver disease
  osa: boolean; // Obstructive sleep apnoea
  pcos: boolean;
  osteoarthritis: boolean;
  cvd: boolean; // Cardiovascular disease
}

export interface Contraindications {
  pregnancy: boolean;
  lactation: boolean;
  medullaryThyroidCancer: boolean;
  men2: boolean;
  pancreatitisHistory: boolean;
  hypersensitivity: boolean;
}

export interface AssessmentResult {
  isEligible: boolean;
  reason: string[];
  recommendation: string;
  medicationOptions: MedicationOption[];
  monitoringPlan: string[];
}

export interface MedicationOption {
  name: string;
  startingDose: string;
  escalation: string;
  maxDose: string;
  contraindications: string[];
  sideEffects: string[];
}
