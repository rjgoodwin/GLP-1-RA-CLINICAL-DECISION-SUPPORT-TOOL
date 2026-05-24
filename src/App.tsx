/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ClipboardCheck, 
  Search,
  Info, 
  Scale, 
  Stethoscope, 
  User,
  AlertTriangle,
  BookOpen,
  History,
  Pill,
  X,
  Plus,
  RotateCcw,
  Lock,
  ShieldCheck,
  Check,
  Clock,
  Loader2,
  ShieldAlert,
  Zap,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PatientData, 
  Complications, 
  Contraindications, 
  Gender, 
  PopulationType,
  MedicationOption,
  Interaction
} from './types';

const INITIAL_PATIENT: PatientData = {
  age: 0,
  gender: null,
  weight: 0,
  height: 0,
  bmi: 0,
  waistCircumference: 0,
  population: null,
  currentMedications: [],
};

const INTERACTION_MEDICATIONS = [
  {
    id: 'insulin',
    label: 'Insulin Therapy',
    severity: 'monitoring' as const,
    warning: 'High risk of severe hypoglycemia.',
    management: 'Prescribe with monitoring. Reduce insulin dose by 20-50% upon GLP-1RA initiation. Perform frequent self-monitored blood glucose.',
    recommendationLabel: 'Prescribe with monitoring & dose adjustment'
  },
  {
    id: 'sulfonylureas',
    label: 'Sulfonylureas (SUs)',
    severity: 'monitoring' as const,
    warning: 'Significantly increased risk of hypoglycemia.',
    management: 'Prescribe with monitoring. Reduce SU dose by 50% or cease upon initiation of GLP-1RA. Strict self-monitored blood glucose required.',
    recommendationLabel: 'Prescribe with monitoring & dose reduction'
  },
  {
    id: 'dpp4i',
    label: 'DPP-4 Inhibitors (Gliptins)',
    severity: 'relative' as const,
    warning: 'Pharmacological redundancy with GLP-1RA therapy.',
    management: 'Relatively contraindicated. Discontinue DPP-4 inhibitor as it works on the same pathway as GLP-1RA and provides no additive benefit.',
    recommendationLabel: 'Relatively contraindicated / Cease medication'
  },
  {
    id: 'sglt2i',
    label: 'SGLT2 Inhibitors (Gliflozins)',
    severity: 'monitoring' as const,
    warning: 'Risk of euglycemic ketoacidosis, especially if used with very low energy diets (VLED).',
    management: 'Prescribe with monitoring. Monitor ketones if patient is on restricted calories or VLED. Ensure adequate hydration.',
    recommendationLabel: 'Prescribe with monitoring & ketone assessment'
  },
  {
    id: 'warfarin',
    label: 'Warfarin / Anticoagulants',
    severity: 'monitoring' as const,
    warning: 'Potential for altered oral anticoagulant absorption due to delayed gastric emptying.',
    management: 'Prescribe with monitoring. Monitor Prothrombin Time (PT) and INR within 1 week of initiation and following any dose titration.',
    recommendationLabel: 'Prescribe with monitoring (INR)'
  },
  {
    id: 'digoxin',
    label: 'Digoxin',
    severity: 'monitoring' as const,
    warning: 'Delayed gastric emptying may impact peak plasma concentrations (Cmax).',
    management: 'Prescribe with monitoring. Monitor clinical response and serum digoxin levels during GLP-1RA initiation and dose escalation.',
    recommendationLabel: 'Prescribe with monitoring (Serum levels)'
  },
  {
    id: 'lithium',
    label: 'Lithium',
    severity: 'monitoring' as const,
    warning: 'Impact on gastric motility may alter lithium absorption dynamics.',
    management: 'Prescribe with monitoring. Monitor serum lithium levels and clinical status for signs of toxicity or reduced efficacy.',
    recommendationLabel: 'Prescribe with monitoring (Serum levels)'
  },
  {
    id: 'phenytoin',
    label: 'Phenytoin',
    severity: 'monitoring' as const,
    warning: 'Narrow therapeutic window drug; absorption may be affected by GLP-1RA therapy.',
    management: 'Prescribe with monitoring. Monitor serum phenytoin levels especially when titrating GLP-1RA dosage.',
    recommendationLabel: 'Prescribe with monitoring (Serum levels)'
  },
  {
    id: 'theophylline',
    label: 'Theophylline',
    severity: 'monitoring' as const,
    warning: 'Potential for altered absorption profile due to changes in gastric emptying.',
    management: 'Prescribe with monitoring. Monitor serum theophylline concentrations during treatment adjustments.',
    recommendationLabel: 'Prescribe with monitoring (Serum levels)'
  },
  {
    id: 'cyclosporin',
    label: 'Cyclosporin',
    severity: 'monitoring' as const,
    warning: 'Immunosuppressant with narrow therapeutic index; absorption timing may change.',
    management: 'Prescribe with monitoring. Monitor cyclosporin blood levels closely to avoid under-immunosuppression or toxicity.',
    recommendationLabel: 'Prescribe with monitoring (Blood levels)'
  },
  {
    id: 'oral_contraceptive',
    label: 'Oral Contraceptives',
    severity: 'monitoring' as const,
    warning: 'Delayed gastric emptying may theoretically alter the absorption of oral contraceptives.',
    management: 'Prescribe with monitoring. Advise taking oral contraceptives at least 1 hour before or 11 hours after GLP-1RA if concerned about contraceptive failure.',
    recommendationLabel: 'Prescribe with precaution / timing advice'
  },
  {
    id: 'penicillins',
    label: 'Penicillins',
    severity: 'monitoring' as const,
    warning: 'Delayed gastric emptying may delay and reduce peak concentration (Cmax) and efficacy.',
    management: 'Prescribe with monitoring. Monitor clinical effectiveness closely; absorption timing may be critical for infection control.',
    recommendationLabel: 'Prescribe with monitoring (Efficacy)'
  },
  {
    id: 'nitrofurantoin',
    label: 'Nitrofurantoin',
    severity: 'monitoring' as const,
    warning: 'Potential for delayed and reduced peak plasma concentrations due to gastric motility changes.',
    management: 'Prescribe with monitoring. Monitor for clinical response and ensure infection resolution.',
    recommendationLabel: 'Prescribe with monitoring (Efficacy)'
  },
  {
    id: 'acei',
    label: 'ACE Inhibitors (ACEIs)',
    severity: 'monitoring' as const,
    warning: 'Risk of additive hypotension or orthostasis as weight loss reduces baseline blood pressure.',
    management: 'Prescribe with monitoring. Monitor blood pressure regularly. Consider dose reduction if blood pressure falls below target.',
    recommendationLabel: 'Prescribe with monitoring (blood pressure)'
  },
  {
    id: 'arbs',
    label: 'Angiotensin II Receptor Blockers (ARBs)',
    severity: 'monitoring' as const,
    warning: 'Risk of additive hypotension or orthostasis, especially with concurrent weight loss.',
    management: 'Prescribe with monitoring. Monitor blood pressure regularly. Review dose if blood pressure is consistently below target.',
    recommendationLabel: 'Prescribe with monitoring (blood pressure)'
  },
  {
    id: 'diuretics',
    label: 'Diuretics',
    severity: 'monitoring' as const,
    warning: 'Risk of hypotension, orthostasis, and potential dehydration/electrolyte imbalance.',
    management: 'Prescribe with monitoring. Monitor blood pressure and hydration status. Consider dose reduction or cessation if blood pressure falls below target.',
    recommendationLabel: 'Prescribe with monitoring (blood pressure & Hydration)'
  },
  {
    id: 'levothyroxine',
    label: 'Levothyroxine',
    severity: 'monitoring' as const,
    warning: 'Absorption may be delayed or altered due to delayed gastric motility.',
    management: 'Prescribe with monitoring. Monitor thyroid function (TSH level) shortly after beginning therapy or when changing dose.',
    recommendationLabel: 'Prescribe with monitoring (TSH)'
  }
];

const INITIAL_COMPLICATIONS: Complications = {
  type2Diabetes: false,
  hypertension: false,
  dyslipidaemia: false,
  mafld: false,
  osa: false,
  pcos: false,
  osteoarthritis: false,
  cvd: false,
};

const COMPLICATION_LABELS: Record<string, string> = {
  type2Diabetes: 'Type 2 Diabetes',
  hypertension: 'Hypertension',
  dyslipidaemia: 'Dyslipidaemia',
  mafld: 'Metabolic Associated Fatty Liver Disease (MAFLD)',
  osa: 'Obstructive Sleep Apnoea (OSA)',
  pcos: 'Polycystic Ovary Syndrome (PCOS)',
  osteoarthritis: 'Osteoarthritis',
  cvd: 'Cardiovascular Disease (CVD)'
};

const INITIAL_CONTRAINDICATIONS: Contraindications = {
  pregnancy: false,
  lactation: false,
  medullaryThyroidCancer: false,
  men2: false,
  pancreatitisHistory: false,
  hypersensitivity: false,
};

const CONTRAINDICATION_LABELS: Record<string, string> = {
  pregnancy: 'Pregnancy',
  lactation: 'Breastfeeding / Lactation',
  medullaryThyroidCancer: 'Medullary Thyroid Cancer',
  men2: 'Multiple Endocrine Neoplasia Syndrome Type 2 (MEN2)',
  pancreatitisHistory: 'History of Pancreatitis',
  hypersensitivity: 'Hypersensitivity to GLP-1 RA'
};

export default function App() {
  const [hasConsent, setHasConsent] = useState(false);
  const [patient, setPatient] = useState<PatientData>(INITIAL_PATIENT);
  const [comphistoryNone, setComphistoryNone] = useState(false);
  const [contraNone, setContraNone] = useState(false);
  const [medsNone, setMedsNone] = useState(false);
  const [complications, setComplications] = useState<Complications>(INITIAL_COMPLICATIONS);
  const [contraindications, setContraindications] = useState<Contraindications>(INITIAL_CONTRAINDICATIONS);
  const [showClinicalNote, setShowClinicalNote] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [ageError, setAgeError] = useState(false);
  const [selectedMedChoices, setSelectedMedChoices] = useState<string[]>([]);
  const [confirmedHeight, setConfirmedHeight] = useState<boolean>(false);
  const [confirmedWeight, setConfirmedWeight] = useState<boolean>(false);
  const [confirmedWaist, setConfirmedWaist] = useState<boolean>(false);
  const [confirmedBmi, setConfirmedBmi] = useState<boolean>(false);

  const handleReset = () => {
    setHasConsent(false);
    setPatient(INITIAL_PATIENT);
    setComplications(INITIAL_COMPLICATIONS);
    setContraindications(INITIAL_CONTRAINDICATIONS);
    setComphistoryNone(false);
    setContraNone(false);
    setMedsNone(false);
    setShowClinicalNote(false);
    setCopySuccess(false);
    setAgeError(false);
    setSelectedMedChoices([]);
    setConfirmedHeight(false);
    setConfirmedWeight(false);
    setConfirmedWaist(false);
    setConfirmedBmi(false);
    // Scroll to top for a fresh start
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simulate calculation delay for UX
  React.useEffect(() => {
    if (patient.weight > 0 || patient.height > 0) {
      setIsCalculating(true);
      const timer = setTimeout(() => setIsCalculating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [
    patient.weight, 
    patient.height, 
    patient.waistCircumference, 
    patient.age, 
    patient.gender, 
    patient.population,
    patient.currentMedications,
    complications,
    contraindications,
    comphistoryNone,
    contraNone,
    medsNone,
    confirmedHeight,
    confirmedWeight,
    confirmedWaist,
    confirmedBmi
  ]);

  const calculateBMI = (weight: number, height: number) => {
    if (weight > 0 && height > 0) {
      return parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
    }
    return 0;
  };

  const handlePatientChange = (field: keyof PatientData, value: any) => {
    const updated = { ...patient, [field]: value };
    if (field === 'weight' || field === 'height') {
      updated.bmi = calculateBMI(updated.weight, updated.height);
      setConfirmedBmi(false);
    }
    if (field === 'height') {
      setConfirmedHeight(false);
    }
    if (field === 'weight') {
      setConfirmedWeight(false);
    }
    if (field === 'waistCircumference') {
      setConfirmedWaist(false);
    }
    setPatient(updated);
  };

  const toggleComplication = (key: keyof Complications) => {
    setComplications(prev => ({ ...prev, [key]: !prev[key] }));
    setComphistoryNone(false);
  };

  const toggleComphistoryNone = () => {
    setComphistoryNone(prev => !prev);
    if (!comphistoryNone) {
      setComplications(INITIAL_COMPLICATIONS);
    }
  };

  const toggleContraindication = (key: keyof Contraindications) => {
    setContraindications(prev => ({ ...prev, [key]: !prev[key] }));
    setContraNone(false);
  };

  const toggleContraNone = () => {
    setContraNone(prev => !prev);
    if (!contraNone) {
      setContraindications(INITIAL_CONTRAINDICATIONS);
    }
  };

  const toggleMedication = (id: string) => {
    setPatient(prev => {
      const current = prev.currentMedications;
      const isSelected = current.includes(id);
      return {
        ...prev,
        currentMedications: isSelected 
          ? current.filter(m => m !== id) 
          : [...current, id]
      };
    });
    setMedsNone(false);
  };

  const toggleMedsNone = () => {
    setMedsNone(prev => !prev);
    if (!medsNone) {
      setPatient(prev => ({ ...prev, currentMedications: [] }));
    }
  };

  const resetAll = () => {
    setPatient(INITIAL_PATIENT);
    setComplications(INITIAL_COMPLICATIONS);
    setContraindications(INITIAL_CONTRAINDICATIONS);
    setComphistoryNone(false);
    setContraNone(false);
    setMedsNone(false);
    setConfirmedHeight(false);
    setConfirmedWeight(false);
    setConfirmedWaist(false);
    setConfirmedBmi(false);
  };

  const resetAnthropometry = () => {
    setPatient(prev => ({
      ...prev,
      weight: 0,
      height: 0,
      bmi: 0,
      waistCircumference: 0
    }));
    setConfirmedHeight(false);
    setConfirmedWeight(false);
    setConfirmedWaist(false);
    setConfirmedBmi(false);
  };

  const resetPatientContext = () => {
    setPatient(prev => ({
      ...prev,
      age: 0,
      gender: null,
      population: null
    }));
  };

  const resetClinicalAssessment = () => {
    setComplications(INITIAL_COMPLICATIONS);
    setContraindications(INITIAL_CONTRAINDICATIONS);
    setComphistoryNone(false);
    setContraNone(false);
  };

  const resetInteractions = () => {
    setPatient(prev => ({
      ...prev,
      currentMedications: []
    }));
    setMedsNone(false);
  };

  const interactions = useMemo(() => {
    return patient.currentMedications.map(id => {
      const info = INTERACTION_MEDICATIONS.find(m => m.id === id);
      return {
        medication: info?.label || id,
        severity: info?.severity || 'monitoring',
        warning: info?.warning || '',
        management: info?.management || '',
        recommendationLabel: info?.recommendationLabel
      };
    });
  }, [patient.currentMedications]);

  const assessment = useMemo(() => {
    const reasons: string[] = [];
    const hasComplications = Object.values(complications).some(v => v);
    const hasContraindications = Object.values(contraindications).some(v => v);
    
    const identifiedComorbidities = Object.entries(complications)
      .filter(([_, active]) => active)
      .map(([key]) => COMPLICATION_LABELS[key]);
    
    if (identifiedComorbidities.length > 0) {
      reasons.push(`Comorbidities Identified: ${identifiedComorbidities.join(', ')}`);
    }

    // Eligibility Logic based on Australian Weight Management Algorithm
    const isAsianOrIndigenous = patient.population === 'asian_indigenous';
    const bmiThreshold = isAsianOrIndigenous ? 27.5 : 30;
    const overweightThreshold = isAsianOrIndigenous ? 25 : 27;
    
    let eligibleByBMI = false;
    if (patient.bmi >= bmiThreshold) {
      eligibleByBMI = true;
      reasons.push(`BMI ≥ ${bmiThreshold} kg/m²`);
    } else if (patient.bmi >= overweightThreshold && hasComplications) {
      eligibleByBMI = true;
      reasons.push(`BMI ≥ ${overweightThreshold} kg/m² with weight-related comorbidities`);
    }

    const wcThreshold = patient.gender === 'male' ? 102 : 88;
    const eligibleByWC = patient.waistCircumference > wcThreshold;
    if (eligibleByWC) {
      reasons.push(`Abdominal obesity (Waist Circumference > ${wcThreshold} cm)`);
    }

    const missingFactors: string[] = [];
    if (patient.age > 0 && (patient.age < 18 || patient.age > 110)) {
      missingFactors.push('Patient age must be between 18 and 110 years');
    }
    if (hasContraindications) {
      missingFactors.push('Presence of clinical contraindications makes therapy inappropriate');
    }

    const interactionSummary = patient.currentMedications.length > 0 ? {
      hasAbsolute: interactions.some(i => i.severity === 'absolute'),
      hasRelative: interactions.some(i => i.severity === 'relative'),
      hasMonitoring: interactions.some(i => i.severity === 'monitoring'),
    } : null;

    // Safety assessment
    const hasAbsoluteDrugInteraction = interactionSummary?.hasAbsolute || false;
    const hasRelativeDrugInteraction = interactionSummary?.hasRelative || false;

    // Validation logic for completion
    const isWeightComplete = patient.weight > 0;
    const isHeightComplete = patient.height > 0;
    const isWaistComplete = patient.waistCircumference > 0;
    const isAgeComplete = patient.age >= 18 && patient.age <= 110;
    const isGenderComplete = patient.gender !== null;
    const isPopulationComplete = patient.population !== null;
    const isComplicationsComplete = Object.values(complications).some(v => v) || comphistoryNone;
    const isContraindicationsComplete = Object.values(contraindications).some(v => v) || contraNone;
    const isMedicationsComplete = patient.currentMedications.length > 0 || medsNone;
    
    const hasUnconfirmedHeight = patient.height > 220 && !confirmedHeight;
    const hasUnconfirmedWeight = patient.weight > 200 && !confirmedWeight;
    const hasUnconfirmedWaist = patient.waistCircumference > 150 && !confirmedWaist;
    const hasUnconfirmedBmi = patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi;
    const hasUnconfirmedExtreme = hasUnconfirmedHeight || hasUnconfirmedWeight || hasUnconfirmedWaist || hasUnconfirmedBmi;

    const isComplete = isWeightComplete && isHeightComplete && isWaistComplete && 
                        isAgeComplete && isGenderComplete && isPopulationComplete &&
                        isComplicationsComplete && isContraindicationsComplete && isMedicationsComplete &&
                        !hasUnconfirmedExtreme;

    const missingSections: string[] = [];
    if (!isWeightComplete) missingSections.push('Weight');
    if (!isHeightComplete) missingSections.push('Height');
    if (!isWaistComplete) missingSections.push('Waist Circumference');
    if (hasUnconfirmedHeight) missingSections.push('Height Accuracy Confirmation');
    if (hasUnconfirmedWeight) missingSections.push('Weight Accuracy Confirmation');
    if (hasUnconfirmedWaist) missingSections.push('Waist Circumference Accuracy Confirmation');
    if (hasUnconfirmedBmi) missingSections.push('BMI Accuracy Confirmation');
    if (!isAgeComplete) missingSections.push('Age (Adults 18-110)');
    if (!isGenderComplete) missingSections.push('Sex Assigned at Birth');
    if (!isPopulationComplete) missingSections.push('High Metabolic Risk Population status');
    if (!isComplicationsComplete) missingSections.push('Comorbidities Assessment');
    if (!isContraindicationsComplete) missingSections.push('Contraindications Assessment');
    if (!isMedicationsComplete) missingSections.push('Interactions Check');

    // A patient is clinical eligible based on metrics
    const meetsMedicalCriteria = (eligibleByBMI || eligibleByWC) && !hasContraindications && patient.age >= 18 && patient.age <= 110;
    
    // Final eligibility takes absolute drug interactions into account
    const isEligible = isComplete && meetsMedicalCriteria && !hasAbsoluteDrugInteraction;

    // Determine the "Safety State" for the eligibility box
    let safetyState: 'eligible' | 'caution' | 'ineligible' | 'incomplete' = 'incomplete';
    if (!isComplete) {
      safetyState = 'incomplete';
    } else if (isEligible) {
      safetyState = hasRelativeDrugInteraction ? 'caution' : 'eligible';
    } else {
      safetyState = 'ineligible';
    }

    if (isComplete && !eligibleByBMI && !eligibleByWC && !hasContraindications && patient.age >= 18 && patient.age <= 110) {
      missingFactors.push(`BMI must be ≥ ${bmiThreshold} kg/m²`);
      if (!hasComplications) {
        missingFactors.push(`BMI ≥ ${overweightThreshold} kg/m² with one or more clinical comorbidities (e.g. Type 2 Diabetes, OSA, Hypertension)`);
      }
      missingFactors.push(`Waist Circumference must be > ${wcThreshold} cm`);
    }

    if (hasAbsoluteDrugInteraction) {
      missingFactors.push('Absolute pharmacological contraindication detected');
    }

    // Recommendation confidence calculations
    let confidenceScore = 100;
    const confidenceReasons: string[] = [];

    if (patient.age >= 75) {
      confidenceScore -= 30;
      confidenceReasons.push('Patient is of advanced age (≥ 75 years), where clinical trial data is limited and adverse risks (falls, sarcopenia) are higher.');
    }
    if (patient.bmi >= 50) {
      confidenceScore -= 20;
      confidenceReasons.push('Super-obesity (BMI ≥ 50 kg/m²) may require multidisciplinary bariatric evaluation rather than standard pharmacotherapy.');
    }
    if (patient.bmi > 0 && patient.bmi < 16) {
      confidenceScore -= 40;
      confidenceReasons.push('Severe underweight/malnutrition threshold reached (BMI < 16 kg/m²), weight management therapy is inappropriate or highly risky.');
    }
    const activeComplicationsCount = Object.values(complications).filter(Boolean).length;
    if (activeComplicationsCount >= 3) {
      confidenceScore -= 20;
      confidenceReasons.push(`High level of metabolic complexity (${activeComplicationsCount} active obesity-related complications) deviates from standard trial profiles.`);
    }
    if (hasContraindications) {
      confidenceScore -= 30;
      confidenceReasons.push('Presence of clinical contraindications makes recommendation highly volatile / inappropriate.');
    }
    if (interactionSummary?.hasRelative) {
      confidenceScore -= 25;
      confidenceReasons.push('Potential relative drug interactions are detected which require immediate clinical adjustment.');
    }
    if (interactionSummary?.hasAbsolute) {
      confidenceScore -= 40;
      confidenceReasons.push('Absolute pharmaceutical contraindications are identified.');
    }
    if (complications.cvd) {
      confidenceScore -= 15;
      confidenceReasons.push('Established Cardiovascular Disease requires strict sub-specialty evaluation and collaborative management.');
    }

    confidenceScore = Math.max(0, confidenceScore);

    return {
      isEligible,
      safetyState,
      reasons,
      hasContraindications: hasContraindications || hasAbsoluteDrugInteraction,
      isUnderage: patient.age > 0 && (patient.age < 18 || patient.age > 110),
      isComplete,
      missingSections,
      missingFactors,
      interactionSummary,
      isHighMetabolicRisk: patient.population === 'asian_indigenous',
      confidenceScore,
      confidenceReasons
    };
  }, [patient, complications, contraindications, interactions, comphistoryNone, contraNone, medsNone, confirmedHeight, confirmedWeight, confirmedWaist, confirmedBmi]);

  const medications: MedicationOption[] = [
    {
      name: 'Semaglutide',
      startingDose: '0.25 mg once weekly',
      escalation: 'Consider increasing dose every 4 weeks (0.25 mg → 0.5 mg → 1.0 mg → 1.7 mg → 2.4 mg) subject to tolerance [2, 3]',
      maxDose: '2.4 mg once weekly',
      contraindications: ['Medullary Thyroid Cancer', 'Multiple Endocrine Neoplasia Syndrome Type 2 (MEN2)', 'Pregnancy'],
      sideEffects: ['Nausea', 'Diarrhoea', 'Vomiting', 'Constipation', 'Pancreatitis (rare)'],
    },
    {
      name: 'Tirzepatide',
      startingDose: '2.5 mg once weekly',
      escalation: 'Consider increasing dose to 5 mg weekly after 4 weeks. Further increases can be considered in 2.5 mg increments every 4 weeks [2, 3]',
      maxDose: '15 mg once weekly',
      contraindications: ['Pregnancy', 'Breastfeeding / Lactation', 'Medullary Thyroid Cancer', 'MEN2 Syndrome', 'History of Pancreatitis', 'Hypersensitivity to GLP-1 RA / GIP'],
      sideEffects: ['Nausea', 'Diarrhoea', 'Vomiting', 'Decreased appetite'],
    },
    {
      name: 'Liraglutide',
      startingDose: '0.6 mg daily',
      maxDose: '3.0 mg daily',
      contraindications: ['Pregnancy', 'Medullary Thyroid Cancer', 'MEN2 Syndrome', 'Hypersensitivity to GLP-1 RA'],
      sideEffects: ['Nausea', 'Vomiting', 'Diarrhoea', 'Constipation', 'Gallstones'],
      escalation: 'Consider increasing dose by 0.6 mg weekly until maximum dose is reached to minimize gastrointestinal side effects [1, 2]',
    }
  ];

  const calorieTarget = useMemo(() => {
    if (!patient.weight || !patient.height || !patient.age || !patient.gender) return null;
    
    // Mifflin-St Jeor Equation
    // Height in cm, Weight in kg, Age in years
    let bmr = (10 * patient.weight) + (6.25 * patient.height) - (5 * patient.age);
    if (patient.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    // Total Daily Energy Expenditure (Sedentary factor 1.2)
    const tdee = bmr * 1.2;
    
    // Target deficit of 2000-4000 kJ (approx 500-1000 kcal)
    // We'll provide a range for the user
    const targetMin = Math.round(tdee - 800);
    const targetMax = Math.round(tdee - 500);
    
    // Ensure nutritional adequacy (min 1200 kcal/day for women, 1500 kcal/day for men)
    const floor = patient.gender === 'male' ? 1500 : 1200;
    
    return {
      min: Math.max(targetMin, floor),
      max: Math.max(targetMax, floor)
    };
  }, [patient.weight, patient.height, patient.age, patient.gender]);

  const generateClinicalNote = () => {
    const date = new Date().toLocaleDateString('en-AU');
    const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    
    // Filter medications based on user selection
    const visibleMedications = selectedMedChoices.length > 0
      ? medications.filter(m => selectedMedChoices.includes(m.name))
      : medications;

    let note = `CLINICAL NOTE: Weight Management Assessment (GLP-1 RA Eligibility)\n`;
    note += `Date: ${date} ${time}\n`;
    note += `--------------------------------------------------\n\n`;
    
    note += `PATIENT ANTHROPOMETRY:\n`;
    note += `- Age: ${patient.age} yrs\n`;
    note += `- Sex: ${patient.gender || 'Not specified'}\n`;
    note += `- Height: ${patient.height} cm\n`;
    note += `- Weight: ${patient.weight} kg\n`;
    note += `- BMI: ${patient.bmi} kg/m²\n`;
    note += `- Waist Circumference: ${patient.waistCircumference} cm\n`;
    note += `- Population Group: ${patient.population === 'asian_indigenous' ? 'High Metabolic Risk (Asian/Indigenous)' : 'General Population'}\n\n`;
    
    const activeComorb = Object.entries(complications)
      .filter(([_, v]) => v)
      .map(([k]) => COMPLICATION_LABELS[k]);
    note += `COMORBIDITIES:\n`;
    note += activeComorb.length > 0 ? activeComorb.map(c => `- ${c}`).join('\n') : `- None identified`;
    note += `\n\n`;
    
    const activeContra = Object.entries(contraindications)
      .filter(([_, v]) => v)
      .map(([k]) => CONTRAINDICATION_LABELS[k]);
    note += `CONTRAINDICATIONS:\n`;
    note += activeContra.length > 0 ? activeContra.map(c => `- ${c}`).join('\n') : `- None identified`;
    note += `\n\n`;
    
    note += `MEDICATION INTERACTIONS:\n`;
    if (patient.currentMedications.length > 0) {
      interactions.forEach(i => {
        note += `- ${i.medication}: ${i.recommendationLabel} (${i.severity.toUpperCase()})\n`;
      });
    } else {
      note += `- None identified\n`;
    }
    note += `\n`;
    
    note += `DETERMINATION:\n`;
    note += `Status: ${assessment.safetyState.toUpperCase()}\n`;
    if (assessment.reasons.length > 0) {
      note += `Criteria Met:\n${assessment.reasons.map(r => `  * ${r}`).join('\n')}\n`;
    }
    if (assessment.missingFactors.length > 0) {
      note += `Clinical Constraints:\n${assessment.missingFactors.map(f => `  * ${f}`).join('\n')}\n`;
    }
    
    note += `\nRECOMMENDATIONS:\n`;
    if (assessment.isEligible) {
      note += `- Eligible for GLP-1 RA pharmacotherapy as an adjunct to lifestyle intervention.\n`;
      note += `- Suggested medications per algorithm: ${visibleMedications.map(m => m.name).join(', ')}.\n`;
      note += `- Follow standard escalation schedule and monthly clinical review.\n`;
      note += `- Emphasise lifestyle modification including calorie deficit and 150-300 mins exercise/week.\n`;
    } else {
      note += `- Not meeting criteria for GLP-1 RA at this time based on algorithm thresholds.\n`;
      note += `- Recommend ongoing lifestyle support and review metrics in 3-6 months.\n`;
    }

    if (assessment.isComplete && assessment.confidenceScore < 50) {
      note += `\n⚠️ CLINICAL WARNING (Confidence Score: ${assessment.confidenceScore}%):\n`;
      note += `Confidence in this recommendation is low due to the following complex factors:\n`;
      assessment.confidenceReasons.forEach(r => {
        note += `  * ${r}\n`;
      });
      note += `Action: Clinicians are strongly advised to seek specialist advice (e.g. endocrinology, cardiology, or bariatric coordination) prior to treatment initiation.\n`;
    }
    
    note += `\nNote generated via Clinical Decision Support Tool. [References: Markovic et al 2022, AJGP 2025]`;
    
    return note;
  };

  const handleToggleNote = () => {
    if (!showClinicalNote) {
      setIsGeneratingNote(true);
      setTimeout(() => {
        setIsGeneratingNote(false);
        setShowClinicalNote(true);
      }, 800);
    } else {
      setShowClinicalNote(false);
    }
  };

  const handleCopyNote = () => {
    const text = generateClinicalNote();
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform hover:scale-105 duration-300">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-[10px] md:text-xl font-extrabold tracking-tight text-slate-900 leading-none py-1">
                <span className="block uppercase">GLUCAGON-LIKE RECEPTOR-1 AGONISTS (GLP-1RAs)</span>
                <span className="block text-indigo-600 mt-1 uppercase text-[8px] md:text-sm font-black">Safe Prescribing Tool for GPs</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <Activity size={14} className="text-indigo-500" />
              <span>Evidence-Based Algorithm</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-3">
        {/* AI Clinical Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 p-3 bg-rose-50/90 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm"
        >
          <div className="p-1 px-1.5 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-black shrink-0 mt-0.5 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle size={12} className="text-rose-600 animate-pulse" />
            AI Safety Notice
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-rose-950 font-semibold leading-normal">
              Please note: AI can make mistakes. This is a decision support tool, not a medical device. Always verify all drug dosages, titration schedules, patient details, and clinical instructions with the original clinical prescribing source or regional guidelines before proceeding.
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {/* Main Inputs */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-3 bg-amber-50 border-2 border-amber-200 rounded-[24px] shadow-sm flex items-start gap-3 mb-0.5"
            >
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-tight">Important Clinical Guidance</h3>
                <p className="text-[10px] text-amber-800/80 font-medium leading-normal mt-0.5 italic">
                  All 4 sections below must be completed before patient eligibility can be determined [1].
                </p>
                
                <div className="mt-2.5 p-2 bg-white/60 border border-amber-200 rounded-xl flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="consent-check"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="w-4 h-4 rounded-md border-amber-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
                  />
                  <label htmlFor="consent-check" className="text-[10px] font-bold text-amber-900 cursor-pointer select-none">
                    patient consent obtained
                  </label>
                </div>

                <AnimatePresence>
                  {hasConsent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-amber-200/50"
                    >
                      <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-2">Which GLP-1RA(s) are you considering for this patient?</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {['Semaglutide', 'Tirzepatide', 'Liraglutide'].map((med) => (
                          <label 
                            key={med}
                            className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all ${
                              selectedMedChoices.includes(med)
                                ? 'bg-indigo-600 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                                : 'bg-white border-amber-200 hover:border-indigo-300'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              className="sr-only"
                              checked={selectedMedChoices.includes(med)}
                              onChange={() => {
                                setSelectedMedChoices(prev => 
                                  prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]
                                );
                              }}
                            />
                            <div className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                              selectedMedChoices.includes(med) ? 'bg-white' : 'bg-slate-100 border border-slate-200'
                            }`}>
                              {selectedMedChoices.includes(med) && <Check size={10} className="text-indigo-600" />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-tight ${
                              selectedMedChoices.includes(med) ? 'text-white' : 'text-slate-600'
                            }`}>
                              {med}
                            </span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <div className={`transition-all duration-500 ${hasConsent && selectedMedChoices.length > 0 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale-[0.5]'}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
          
          {/* Section 1: Anthropometry Check */}
          <section className="glass-card rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <span className="font-black text-sm">1</span>
                </div>
                    <div>
                      <h2 className="font-black text-slate-800 tracking-tight text-base uppercase leading-none">Anthropometry Check</h2>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">patient measurements</p>
                    </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetAnthropometry}
                  className="flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                >
                  <RotateCcw size={10} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            <div className="p-3 space-y-3 bg-white/40">
              {/* Mandatory Metric Units Notice */}
              <div id="mandatory-metric-notice" className="p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2.5">
                <Info size={14} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-900 leading-normal font-semibold">
                  <span className="font-extrabold text-amber-950 uppercase tracking-wide">Metric Units Note:</span> Measurements must be entered in metric units. Please enter height in <span className="font-extrabold text-indigo-700">centimetres (cm)</span>, weight in <span className="font-extrabold text-indigo-700">kilograms (kg)</span>, and waist circumference in <span className="font-extrabold text-indigo-700">centimetres (cm)</span> for calculations to function correctly.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                
                {/* Height Input */}
                <div id="height-input-wrapper" className="space-y-1.5 flex flex-col justify-between">
                  <label className="label-upper">Height (cm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="any"
                      className={`input-field pr-12 text-lg font-bold transition-colors ${patient.height > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                      placeholder="0"
                      value={patient.height || ''}
                      onChange={(e) => handlePatientChange('height', parseFloat(e.target.value) || 0)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest pointer-events-none select-none">
                      cm
                    </div>
                  </div>
                </div>

                {/* Weight Input */}
                <div id="weight-input-wrapper" className="space-y-1.5 flex flex-col justify-between">
                  <label className="label-upper">Weight (kg)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="any"
                      className={`input-field pr-12 text-lg font-bold transition-colors ${patient.weight > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                      placeholder="0.0"
                      value={patient.weight || ''}
                      onChange={(e) => handlePatientChange('weight', parseFloat(e.target.value) || 0)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest pointer-events-none select-none">
                      kg
                    </div>
                  </div>
                </div>

                {/* Waist Circumference Input */}
                <div id="waist-input-wrapper" className="space-y-1.5 flex flex-col justify-between">
                  <label className="label-upper">Waist Circumference (cm)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      step="any"
                      className={`input-field pr-12 text-lg font-bold transition-colors ${patient.waistCircumference > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                      placeholder="0"
                      value={patient.waistCircumference || ''}
                      onChange={(e) => handlePatientChange('waistCircumference', parseInt(e.target.value) || 0)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest pointer-events-none select-none">
                      cm
                    </div>
                  </div>
                </div>

                {/* Calculated BMI Output */}
                <div id="bmi-output-wrapper" className="space-y-1.5 flex flex-col justify-between">
                  <label className="label-upper">Calculated BMI (kg/m²)</label>
                  <div className={`input-field flex items-center justify-between transition-all h-[42px] ${
                    patient.bmi >= 30 ? 'bg-amber-50 border-amber-200' : 
                    patient.bmi > 0 ? 'bg-indigo-50/30 border-indigo-600' : 
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-xl font-black ${
                      patient.bmi >= 30 ? 'text-amber-600' : 
                      patient.bmi > 0 ? 'text-indigo-600' : 
                      'text-indigo-400'
                    }`}>
                      {patient.bmi ? patient.bmi.toFixed(1) : '—'}
                    </span>
                    {patient.bmi > 0 && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Calculated</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Extreme Value Warning/Confirmation Alert */}
              {(patient.height > 220 || patient.weight > 200 || patient.waistCircumference > 150 || (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50))) && (
                <div 
                  id="anthropometry-threshold-warning" 
                  className={`p-3 border rounded-xl flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200 transition-all ${
                    (patient.height > 220 && !confirmedHeight) || 
                    (patient.weight > 200 && !confirmedWeight) || 
                    (patient.waistCircumference > 150 && !confirmedWaist) ||
                    (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi)
                      ? "bg-rose-50 border-rose-200/60"
                      : "bg-emerald-50/50 border-emerald-200/60"
                  }`}
                >
                  {((patient.height > 220 && !confirmedHeight) || 
                    (patient.weight > 200 && !confirmedWeight) || 
                    (patient.waistCircumference > 150 && !confirmedWaist) ||
                    (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi)) ? (
                    <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0 animate-bounce" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  )}
                  <div className="space-y-1 w-full">
                    <p className={`text-[10px] font-extrabold uppercase tracking-wide ${
                      ((patient.height > 220 && !confirmedHeight) || 
                       (patient.weight > 200 && !confirmedWeight) || 
                       (patient.waistCircumference > 150 && !confirmedWaist) ||
                       (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi))
                        ? "text-rose-950"
                        : "text-emerald-950"
                    }`}>
                      {((patient.height > 220 && !confirmedHeight) || 
                        (patient.weight > 200 && !confirmedWeight) || 
                        (patient.waistCircumference > 150 && !confirmedWaist) ||
                        (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi))
                          ? "Please Confirm Measurements Accuracy"
                          : "Extreme Measurements Confirmed"}
                    </p>
                    <p className={`text-[10px] leading-normal font-semibold ${
                      ((patient.height > 220 && !confirmedHeight) || 
                       (patient.weight > 200 && !confirmedWeight) || 
                       (patient.waistCircumference > 150 && !confirmedWaist) ||
                       (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi))
                        ? "text-rose-900"
                        : "text-emerald-900"
                    }`}>
                      {((patient.height > 220 && !confirmedHeight) || 
                        (patient.weight > 200 && !confirmedWeight) || 
                        (patient.waistCircumference > 150 && !confirmedWaist) ||
                        (patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && !confirmedBmi))
                          ? "One or more values are unusually extreme. Please click on each flagged button below to confirm that it is indeed accurate before assessment can continue."
                          : "All uncommonly extreme values have been reviewed and confirmed accurate by clinical staff."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {patient.height > 220 && (
                        <button
                          type="button"
                          onClick={() => setConfirmedHeight(!confirmedHeight)}
                          className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            confirmedHeight
                              ? "bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-sm"
                              : "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900 shadow-md animate-pulse"
                          }`}
                        >
                          {confirmedHeight ? (
                            <Check size={11} className="text-emerald-700 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                          <span>Height: {patient.height} cm</span>
                        </button>
                      )}
                      {patient.weight > 200 && (
                        <button
                          type="button"
                          onClick={() => setConfirmedWeight(!confirmedWeight)}
                          className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            confirmedWeight
                              ? "bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-sm"
                              : "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-950 shadow-md animate-pulse"
                          }`}
                        >
                          {confirmedWeight ? (
                            <Check size={11} className="text-emerald-700 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                          <span>Weight: {patient.weight} kg</span>
                        </button>
                      )}
                      {patient.waistCircumference > 150 && (
                        <button
                          type="button"
                          onClick={() => setConfirmedWaist(!confirmedWaist)}
                          className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            confirmedWaist
                              ? "bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-sm"
                              : "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900 shadow-md animate-pulse"
                          }`}
                        >
                          {confirmedWaist ? (
                            <Check size={11} className="text-emerald-700 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                          <span>Waist: {patient.waistCircumference} cm</span>
                        </button>
                      )}
                      {patient.bmi > 0 && (patient.bmi < 15 || patient.bmi > 50) && (
                        <button
                          type="button"
                          onClick={() => setConfirmedBmi(!confirmedBmi)}
                          className={`px-2.5 py-1.5 border rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                            confirmedBmi
                              ? "bg-emerald-100/80 border-emerald-300 text-emerald-800 shadow-sm"
                              : "bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-900 shadow-md animate-pulse"
                          }`}
                        >
                          {confirmedBmi ? (
                            <Check size={11} className="text-emerald-700 shrink-0" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                          )}
                          <span>BMI: {patient.bmi.toFixed(1)} kg/m²</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </motion.div>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Section 2: Patient Context */}
              <section className="glass-card rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <span className="font-black text-sm">2</span>
                    </div>
                    <div>
                      <h2 className="font-black text-slate-800 tracking-tight text-base uppercase leading-none">Patient Context</h2>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Demographics & Population</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={resetPatientContext}
                      className="flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                    >
                      <RotateCcw size={10} />
                      <span>Reset</span>
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-3 bg-white/40">
                  <div className="p-2.5 bg-indigo-50/50 border border-indigo-100/50 rounded-xl flex items-start gap-2.5">
                    <Lock size={12} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-indigo-900/70 leading-normal font-medium">
                      <span className="font-bold text-indigo-900">Privacy Notice:</span> To maintain patient confidentiality, do not enter any patient-identifying information [5].
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="label-upper">Age (Adults 18-110)</label>
                      <input 
                        type="number" 
                        className={`input-field font-bold transition-all ${patient.age > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'} ${ageError ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                        placeholder="__"
                        min="18"
                        max="110"
                        value={patient.age || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          // Clear error if it becomes valid while typing
                          if ((val >= 18 && val <= 110) || val === 0) {
                            setAgeError(false);
                          }
                          
                          if (val === 0 || val <= 110) {
                            handlePatientChange('age', val);
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          if (val > 0 && (val < 18 || val > 110)) {
                            handlePatientChange('age', 0);
                            setAgeError(true);
                          } else {
                            setAgeError(false);
                          }
                        }}
                      />
                      {ageError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-[9px] font-black text-red-600 uppercase tracking-widest mt-1 bg-red-50 px-2 py-1 rounded-md border border-red-100 inline-block"
                        >
                          Age must be between 18 and 110
                        </motion.p>
                      )}
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="label-upper">Sex Assigned at Birth</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['female', 'male'] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => handlePatientChange('gender', g)}
                            className={`h-12 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${
                              patient.gender === g 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                              : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl transition-all border-2 ${
                    patient.population === 'asian_indigenous' 
                      ? 'bg-orange-50 border-orange-500 shadow-lg shadow-orange-100' 
                      : patient.population === 'general'
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                        : 'bg-orange-50/50 border-orange-200 border-dashed'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 font-sans">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className={patient.population === null ? "text-orange-500" : "opacity-0"} />
                          <span className={`text-sm font-black uppercase tracking-tight transition-all ${
                            patient.population === 'asian_indigenous' ? 'text-orange-900' :
                            patient.population === 'general' ? 'text-emerald-900' :
                            'text-orange-800'
                          }`}>
                            High Metabolic Risk Population
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed transition-all font-medium ${
                          patient.population === 'asian_indigenous' ? 'text-orange-700' :
                          patient.population === 'general' ? 'text-emerald-700' :
                          'text-orange-600'
                        }`}>
                          Specifically East/South/South-East Asian, Aboriginal, or Torres Strait Islander descent [1].
                        </p>
                      </div>
                      
                      <div className="flex bg-white/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner shrink-0 self-center">
                        <button
                          onClick={() => handlePatientChange('population', 'asian_indigenous')}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            patient.population === 'asian_indigenous'
                              ? 'bg-orange-600 text-white shadow-xl shadow-orange-200 scale-105'
                              : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handlePatientChange('population', 'general')}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                            patient.population === 'general'
                              ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Section 3: Clinical Assessment */}
            <section className="glass-card rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                    <span className="font-black text-sm">3</span>
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 tracking-tight text-base uppercase leading-none">Clinical Assessment</h2>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Screening & Safety</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={resetClinicalAssessment}
                    className="flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                  >
                    <RotateCcw size={10} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
              
              <div className="p-3 space-y-4 bg-white/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Comorbidities */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Plus size={14} className="text-amber-500" />
                        Comorbidities
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">Affects eligibility thresholds</p>
                    </div>
                    <div className="space-y-1.5">
                      {Object.keys(INITIAL_COMPLICATIONS).map((key) => (
                        <label key={key} className="flex items-center gap-2.5 p-1.5 rounded-xl group/item cursor-pointer border border-transparent hover:bg-white hover:shadow-sm transition-all">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              className="peer sr-only"
                              checked={complications[key as keyof Complications]}
                              onChange={() => toggleComplication(key as keyof Complications)}
                            />
                            <div className="w-4 h-4 border-2 border-slate-400 rounded peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all group-hover/item:border-amber-200"></div>
                            <Check size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
                            {COMPLICATION_LABELS[key] || key}
                          </span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-3 p-2 rounded-xl group/item cursor-pointer border transition-all ${
                        comphistoryNone ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'border-transparent hover:bg-white hover:shadow-sm'
                      }`}>
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={comphistoryNone}
                            onChange={toggleComphistoryNone}
                          />
                          <div className={`w-5 h-5 border-2 rounded-lg transition-all ${
                            comphistoryNone ? 'bg-indigo-600 border-indigo-600' : 'border-slate-400 group-hover/item:border-indigo-200'
                          }`}></div>
                          <Check size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                          comphistoryNone ? 'text-indigo-900' : 'text-slate-600 group-hover/item:text-slate-900'
                        }`}>
                          None of the above
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Contraindications */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-500" />
                        Contraindications
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">Safety exclusion factors</p>
                    </div>
                    <div className="space-y-1">
                      {Object.keys(INITIAL_CONTRAINDICATIONS).map((key) => (
                        <label key={key} className="flex items-center gap-2.5 p-1.5 rounded-xl group/item cursor-pointer border border-transparent hover:bg-white hover:shadow-sm transition-all">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              className="peer sr-only"
                              checked={contraindications[key as keyof Contraindications]}
                              onChange={() => toggleContraindication(key as keyof Contraindications)}
                            />
                            <div className="w-4 h-4 border-2 border-slate-400 rounded peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all group-hover/item:border-rose-200"></div>
                            <AlertTriangle size={10} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
                            {CONTRAINDICATION_LABELS[key] || key}
                          </span>
                        </label>
                      ))}
                      <label className={`flex items-center gap-3 p-2 rounded-xl group/item cursor-pointer border transition-all ${
                        contraNone ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'border-transparent hover:bg-white hover:shadow-sm'
                      }`}>
                        <div className="relative flex items-center">
                          <input 
                            type="checkbox" 
                            className="peer sr-only"
                            checked={contraNone}
                            onChange={toggleContraNone}
                          />
                          <div className={`w-5 h-5 border-2 rounded-lg transition-all ${
                            contraNone ? 'bg-emerald-600 border-emerald-600' : 'border-slate-400 group-hover/item:border-emerald-200'
                          }`}></div>
                          <ShieldCheck size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className={`text-[11px] font-black uppercase tracking-tight transition-colors ${
                          contraNone ? 'text-emerald-900' : 'text-slate-600 group-hover/item:text-slate-900'
                        }`}>
                          None of the above
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          {/* Section 4: Interactions Check */}
          <section className="glass-card rounded-[24px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="p-2.5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <span className="font-black text-sm">4</span>
                </div>
                <div>
                  <h2 className="font-black text-slate-800 tracking-tight text-base uppercase leading-none">Interactions Check</h2>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Pharmacological Safety</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetInteractions}
                  className="flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                >
                  <RotateCcw size={10} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
            <div className="p-3 space-y-3 bg-white/40">
              <p className="text-[10px] text-slate-500 leading-normal font-medium">
                Identify key medications that may involve clinical interactions [4].
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INTERACTION_MEDICATIONS.map((med) => (
                  <label 
                    key={med.id} 
                    className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all hover:shadow-md ${
                      patient.currentMedications.includes(med.id) 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-white border-slate-200 hover:border-emerald-100 shadow-sm'
                    }`}
                  >
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={patient.currentMedications.includes(med.id)}
                        onChange={() => toggleMedication(med.id)}
                      />
                      <div className={`w-4 h-4 border-2 rounded transition-all ${
                        patient.currentMedications.includes(med.id)
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-slate-300'
                      }`}></div>
                      <Check size={10} className={`absolute left-0.5 text-white transition-opacity ${
                        patient.currentMedications.includes(med.id) ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 tracking-tight leading-none">{med.label}</span>
                  </label>
                ))}
                <label 
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all hover:shadow-md ${
                    medsNone 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'bg-white border-slate-200 hover:border-indigo-100 shadow-sm'
                  }`}
                >
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      className="peer sr-only"
                      checked={medsNone}
                      onChange={toggleMedsNone}
                    />
                    <div className={`w-5 h-5 border-2 rounded-lg transition-all ${
                      medsNone
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-300'
                    }`}></div>
                    <Check size={12} className={`absolute left-1 text-white transition-opacity ${
                      medsNone ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                  <span className="text-xs font-black text-slate-700 tracking-widest uppercase leading-none italic">None of the above</span>
                </label>
              </div>
            </div>
          </section>
        </motion.div>
        </div>
      </div>

        {/* Assessment Summary Section (Stacked at the Bottom) */}
        <div className="relative mt-4">
          <AnimatePresence>
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[2px] rounded-[32px] flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={18} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Re-evaluating Eligibility...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
          <section className="glass-card rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200">
            <div className="p-3 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white tracking-tight leading-none">Assessment Summary</h2>
                    <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-indigo-400 mt-0.5">Clinical Decision Support</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-4 bg-white">
              {/* Quick Input Summary */}
              {(patient.weight > 0 || patient.age > 0) && (
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">BMI</p>
                    <p className={`text-lg font-black ${patient.bmi >= 30 ? 'text-amber-600' : 'text-indigo-600'}`}>
                      {patient.bmi ? patient.bmi.toFixed(1) : '—'} <span className="text-[8px] text-slate-400">kg/m²</span>
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Age</p>
                    <p className="text-lg font-black text-slate-800">
                      {patient.age > 0 ? patient.age : '—'} <span className="text-[8px] text-slate-400">yrs</span>
                    </p>
                  </div>
                </div>
              )}
              {/* Eligibility Status */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Eligibility Status</h3>
                <AnimatePresence mode="wait">
                  {assessment.safetyState === 'incomplete' ? (
                    <motion.div 
                      key="incomplete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 shadow-lg shadow-indigo-50">
                        <Clock size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-indigo-900 leading-tight tracking-tight text-sm">Assessment Incomplete</p>
                        <p className="text-[10px] text-indigo-700/80 mt-0.5 font-medium leading-tight italic">
                          Please complete:
                        </p>
                        <ul className="mt-2 grid grid-cols-2 gap-1.5">
                          {assessment.missingSections.map((section, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-[9px] font-bold text-red-600 bg-red-50/50 px-1.5 py-0.5 rounded-lg border border-red-100/50">
                              <AlertCircle size={8} />
                              {section}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : assessment.safetyState === 'eligible' ? (
                    <motion.div 
                      key="eligible"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="font-black text-emerald-900 leading-tight text-sm">Patient is Eligible</p>
                        <p className="text-[10px] text-emerald-700/80 mt-0.5 font-medium leading-tight italic">Meets evidence-based criteria for GLP-1 RA therapy adjunct to lifestyle intervention.</p>
                      </div>
                    </motion.div>
                  ) : assessment.safetyState === 'caution' ? (
                    <motion.div 
                      key="caution"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                        <Scale size={18} />
                      </div>
                      <div>
                        <p className="font-black text-amber-900 leading-tight text-sm">Eligible with Caution</p>
                        <p className="text-[10px] text-amber-700/80 mt-0.5 font-medium leading-tight italic">Meets criteria with significant clinical/pharmacological cautions. Review details.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="ineligible"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-sm"
                    >
                      <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
                        <XCircle size={18} />
                      </div>
                      <div>
                        <p className="font-black text-red-900 leading-tight text-sm">Criteria Not Met</p>
                        <p className="text-[10px] text-red-700/80 mt-0.5 font-medium leading-tight italic mb-2">
                          {assessment.hasContraindications 
                            ? "Medical contraindications identified." 
                            : assessment.isUnderage
                            ? "Adult patients (18-110) only."
                            : "Does not meet weight-based thresholds."}
                        </p>

                        {assessment.missingFactors.length > 0 && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-red-200/60">
                            <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest">Requirements for Eligibility:</h4>
                            <ul className="space-y-1.5">
                              {assessment.missingFactors.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-red-500 leading-tight">
                                  <div className="w-1 h-1 rounded-full bg-red-300 mt-1.5 shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Recommendation Confidence Index */}
              {assessment.isComplete && assessment.confidenceScore < 50 && (
                <div id="recommendation-confidence-section" className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] leading-none mb-1">Recommendation Confidence</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Adherence & Risk Certainty Index</p>
                    </div>
                    <span id="confidence-percentage-badge" className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm tracking-widest uppercase ${
                      assessment.confidenceScore >= 70 ? 'bg-emerald-100/90 border border-emerald-300 text-emerald-800' :
                      assessment.confidenceScore >= 50 ? 'bg-amber-100/90 border border-amber-300 text-amber-800' :
                      'bg-rose-100/90 border border-rose-300 text-rose-800 animate-pulse'
                    }`}>
                      {assessment.confidenceScore}% Confidence
                    </span>
                  </div>

                  {/* Visual Confidence Bar */}
                  <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/20">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        assessment.confidenceScore >= 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                        assessment.confidenceScore >= 50 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' :
                        'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                      }`}
                      style={{ width: `${assessment.confidenceScore}%` }}
                    />
                  </div>

                  {/* Warnings for low confidence (< 50%) */}
                  {assessment.confidenceScore < 50 ? (
                    <div id="low-confidence-warning" className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={18} className="text-rose-600 mt-0.5 shrink-0 animate-bounce" />
                        <div className="space-y-1">
                          <p className="font-extrabold text-xs text-rose-950 uppercase tracking-tight">Recommendation Uncertainty Indication</p>
                          <p className="text-[10px] text-rose-900 leading-relaxed font-semibold">
                            Our calculated clinical confidence in this eligibility recommendation is <span className="underline font-black">{assessment.confidenceScore}%</span>, which is below the 50% threshold. This represents a highly atypical patient cohort, substantial clinical complexity, or compounding contraindications/interactions.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white/75 p-3 rounded-lg border border-rose-100 space-y-1 text-[10px] text-rose-950">
                        <p className="font-extrabold uppercase text-[9px] text-rose-700 tracking-wider mb-1 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-rose-500" />
                          Identified Divergence Factors:
                        </p>
                        <ul className="space-y-1">
                          {assessment.confidenceReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-normal font-semibold">
                              <span className="text-rose-500 shrink-0 select-none">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-rose-100 border border-rose-200 rounded-lg flex items-start gap-2 text-[10.5px] font-black text-rose-950 uppercase tracking-tight leading-normal">
                        <span className="shrink-0 mt-0.5 animate-pulse text-rose-700">➜</span>
                        <p>
                          Critical Action: We strongly advise that you seek specialist and multidisciplinary expert advice (e.g., from an Endocrinologist, Cardiologist, or Obesity Specialist) prior to adopting or administering this recommendation.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[9.5px] text-slate-500 leading-normal font-medium">
                      Confidence scoring accounts for factors like age groups, metabolic risk profiles, active comorbidity density, and potential drug-drug interactions. Higher is closer to standard clinical trials evidence.
                    </p>
                  )}
                </div>
              )}

              {/* Criteria Met */}
              {assessment.reasons.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Clinical Criteria Met</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {assessment.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-bold text-slate-700">
                        <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Check size={8} className="text-indigo-600" />
                        </div>
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* High Metabolic Risk Acknowledgement */}
              {assessment.isComplete && assessment.isHighMetabolicRisk && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2 font-sans">High Metabolic Risk Consideration</h3>
                  <div className="p-3 bg-orange-50 border-2 border-orange-100/50 rounded-[24px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldAlert size={48} className="text-orange-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-200">
                          <Zap size={16} />
                        </div>
                        <p className="font-black text-xs text-orange-950 tracking-tight leading-tight">Patient in High Metabolic Risk Category</p>
                      </div>
                      <p className="text-[9px] font-bold text-orange-900/80 leading-normal mb-2">
                        Early intervention threshold applied (BMI ≥27.5) as the patient belongs to a high-risk population (Indigenous or Asian) [1].
                      </p>
                      
                      <div className="space-y-2 p-2.5 bg-white/60 rounded-xl border border-orange-200/40">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-orange-800 leading-normal">
                            <span className="font-black">Sensitivity:</span> Significant metabolic benefits possible even with modest weight loss.
                          </p>
                          <p className="text-[9px] font-bold text-orange-800 leading-normal">
                            <span className="font-black">Screening:</span> Heightened vigilance for early-onset Type 2 diabetes and CVD required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Overall Interaction Assessment */}
              {assessment.interactionSummary && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Interaction Recommendation</h3>
                  <div className={`p-5 rounded-[32px] border-2 ${
                    assessment.interactionSummary.hasAbsolute ? 'bg-rose-50 border-rose-200 text-rose-900' :
                    assessment.interactionSummary.hasRelative ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <Scale size={20} className={
                        assessment.interactionSummary.hasAbsolute ? 'text-rose-600' :
                        assessment.interactionSummary.hasRelative ? 'text-amber-600' :
                        'text-indigo-600'
                      } />
                      <p className="font-black text-sm tracking-tight">
                        {assessment.interactionSummary.hasAbsolute ? 'Absolute Contraindication Detected' :
                         assessment.interactionSummary.hasRelative ? 'Relative Contraindication / Caution Recommended' :
                         'Prescription with Monitoring Requirements'}
                      </p>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-80">
                      {assessment.interactionSummary.hasAbsolute ? 'One or more current medications are absolutely contraindicated with GLP-1RA therapy. Review patient profile and consider alternative weight management strategies.' :
                       assessment.interactionSummary.hasRelative ? 'Clinical interactions identified that may require modification or cessation of current therapy before GLP-1RA initiation (e.g. redundancy or risk factors).' :
                       'Therapy may be prescribed alongside current medications, provided the specific additional screening and monitoring requirements (outlined below) are followed.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Drug Interactions Individual List */}
              {patient.currentMedications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Specific Interaction Details</h3>
                  <div className="space-y-3">
                    {interactions.map((inter, i) => (
                      <div key={i} className={`p-4 rounded-[28px] border-2 shadow-sm ${
                        inter.severity === 'absolute' ? 'bg-rose-50 border-rose-100 text-rose-900' :
                        inter.severity === 'relative' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                        'bg-indigo-50 border-indigo-100 text-indigo-900'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={18} className={
                            inter.severity === 'absolute' ? 'text-rose-600' :
                            inter.severity === 'relative' ? 'text-amber-600' :
                            'text-indigo-600'
                          } />
                          <span className="font-extrabold text-[10px] uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-lg border border-black/5">
                            {inter.severity === 'absolute' ? 'Absolute Contraindication' :
                             inter.severity === 'relative' ? 'Relative Contraindication' :
                             'Monitoring Required'}
                          </span>
                        </div>
                        <p className="text-xs font-black mb-1.5 leading-tight">{inter.medication}: {inter.warning}</p>
                        
                        <div className="mt-3 p-2.5 bg-white/60 rounded-xl border border-black/5">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Recommendation</p>
                          <p className="text-[11px] font-bold text-slate-800 leading-tight mb-2 underline decoration-indigo-200 underline-offset-2">{inter.recommendationLabel}</p>
                          <p className="text-[11px] font-medium leading-relaxed text-slate-600"><span className="font-black text-slate-700">Management:</span> {inter.management}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medication Options */}
              {assessment.isEligible && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">pharmacotherapy dosing guide</h3>
                  </div>
                  
                  <div className="p-4 bg-rose-50/50 border border-rose-200/50 rounded-2xl flex items-start gap-4">
                    <ShieldCheck size={16} className="text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-rose-900 leading-relaxed font-semibold">
                      <span className="font-bold text-rose-950 uppercase">Clinical Recommendation:</span> Dosage information is provided from the Australian Obesity Management Algorithm and clinical review articles [1, 2, 3]. These doses are general recommendations only. Clinicians must exercise independent professional judgment to determine whether these recommendations are appropriate for their individual patient.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {medications
                      .filter(m => selectedMedChoices.includes(m.name))
                      .map((med) => (
                       <div key={med.name} className="p-3 bg-slate-50/50 border border-slate-100 rounded-[20px] hover:border-indigo-200 transition-all group hover:bg-white hover:shadow-xl hover:shadow-indigo-100/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-black text-slate-900 text-sm">{med.name}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Start Dose</p>
                            <p className="text-xs font-black text-indigo-600 mt-0.5">{med.startingDose}</p>
                          </div>
                          <div className="p-1.5 bg-white rounded-xl border border-slate-100 shadow-sm text-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Max Dose</p>
                            <p className="text-xs font-black text-indigo-600 mt-0.5">{med.maxDose}</p>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-white/50 rounded-xl border border-slate-100">
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Clock size={8} className="text-indigo-500" />
                            Escalation Schedule
                          </p>
                          <p className="text-[10px] text-slate-600 font-bold leading-tight mb-2">{med.escalation}</p>
                          
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <p className="text-[7px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                              <Search size={8} />
                              Titration Protocol [1, 2, 3]
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              <div className="space-y-1">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-tighter italic">Appropriateness of Dose Adjustment:</p>
                                <div className="grid grid-cols-1 gap-1.5 mt-1">
                                  <div className="p-1 px-1.5 bg-green-50/50 border border-green-100 rounded text-[8px] leading-tight">
                                    <span className="font-black text-green-700 uppercase">Increase:</span> Consider increasing dose if current dose is well-tolerated and target dose/weight loss not yet achieved.
                                  </div>
                                  <div className="p-1 px-1.5 bg-amber-50/50 border border-amber-100 rounded text-[8px] leading-tight">
                                    <span className="font-black text-amber-700 uppercase">Maintain:</span> Consider maintaining dose if target weight loss achieved OR mild transient side effects present.
                                  </div>
                                  <div className="p-1 px-1.5 bg-rose-50/50 border border-rose-100 rounded text-[8px] leading-tight">
                                    <span className="font-black text-rose-700 uppercase">Decrease/Cease:</span> Consider decreasing or ceasing dose if persistent intolerable gastrointestinal or safety concerns arise.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoring */}
              {assessment.isEligible && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-1">Safety & Monitoring [1, 2, 3]</h3>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        "Review: One month (titration), then 3 to 6 monthly (stable)",
                        "Check Weight and BMI",
                        "Monitor blood pressure & heart rate",
                        "home blood glucose monitoring if comorbid Type 2 diabetes",
                        "Assess gastrointestinal tolerance & GI symptoms",
                        "Review activity (150-300min/wk) & diet adherence",
                        calorieTarget ? `Energy-reduced diet (~${calorieTarget.min}-${calorieTarget.max} kcal/day)` : "Energy-reduced diet"
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50/50 rounded-lg text-[9px] font-bold text-slate-500 border border-slate-100 hover:bg-white transition-all">
                          <div className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_4px_rgba(129,140,248,0.5)]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black text-orange-600 uppercase tracking-[0.15em] mb-1">Potential Side Effects [1, 2, 3]</h3>
                    <div className="p-3 bg-orange-50/30 border border-orange-100/50 rounded-2xl">
                      <div className="grid grid-cols-1 gap-2">
                        {medications
                          .filter(m => selectedMedChoices.includes(m.name))
                          .map((med) => (
                            <div key={med.name} className="space-y-1">
                              <p className="text-[9px] font-black text-orange-900 uppercase tracking-tighter flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-orange-400" />
                                {med.name}
                              </p>
                              <div className="flex flex-wrap gap-1 ml-2.5">
                                {med.sideEffects.map((effect, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 bg-white border border-orange-100 rounded text-[8px] font-bold text-orange-700 uppercase">
                                    {effect}
                                  </span>
                                ))}
                                {/* Adding standardized clinical highlights if missing */}
                                <span className="px-1.5 py-0.5 bg-white border border-orange-100 rounded text-[8px] font-bold text-orange-700 uppercase">
                                  Heart Rate Increase
                                </span>
                                <span className="px-1.5 py-0.5 bg-white border border-orange-100 rounded text-[8px] font-bold text-orange-700 uppercase italic">
                                  AKI Risk (if dehydrated)
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Clinical Note Button */}
              {assessment.isComplete && (
                <div className="pt-6 border-t border-slate-100">
                  <button
                    onClick={handleToggleNote}
                    disabled={isGeneratingNote}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-3xl transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 group"
                  >
                    {isGeneratingNote ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <BookOpen size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{isGeneratingNote ? 'Processing Clinical Data...' : showClinicalNote ? 'Hide Clinical Note' : 'Generate Clinical Note'}</span>
                  </button>
                  
                  <AnimatePresence>
                    {showClinicalNote && !isGeneratingNote && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl relative">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinical Case Note Preview</span>
                            <button
                              onClick={handleCopyNote}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                copySuccess 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                                : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-200 shadow-sm'
                              }`}
                            >
                              {copySuccess ? <Check size={12} /> : <ClipboardCheck size={12} />}
                              <span>{copySuccess ? 'Copied!' : 'Copy to Clipboard'}</span>
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            {generateClinicalNote()}
                          </pre>
                        </div>
                        <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest px-4">
                          Note: This summary is generated for documentation purposes only. ensure all details are verified before pasting into medical records.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </section>
          </div>
        </div>
      </div>
    </main>

      {/* Reset Button */}
      <div className="max-w-4xl mx-auto px-4 mb-4 text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 rounded-[24px] transition-all duration-300 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 border border-slate-200 group"
        >
          <RotateCcw size={14} className="text-indigo-600 group-hover:rotate-[-120deg] transition-transform duration-500" />
          <span>Reset Assessment</span>
        </button>
      </div>

      {/* Footer: Citations & Disclaimer */}
      <footer className="max-w-4xl mx-auto px-4 pb-8 pt-2">
        <div className="glass-card rounded-[32px] p-6 space-y-6 bg-white/80 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-600" />
                References
              </h3>
              <ul className="space-y-2">
                {[
                  "[1] Obesity Algorithm - Markovic 2022.",
                  "[2] GLP-1 RA Weight Loss - AJGP 2025.",
                  "[3] Obesity Pharmacotherapy - AJGP 2025.",
                  "[4] Privacy Act (Cth) & APPs."
                ].map((cite, i) => (
                  <li key={i} className="text-[9px] text-slate-400 font-medium font-mono leading-tight p-2 bg-slate-50 rounded-lg border border-slate-100 italic transition-colors hover:text-slate-500">
                    {cite}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 bg-rose-600 rounded-[28px] text-white shadow-xl shadow-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <Info size={16} className="text-rose-200" />
                <h3 className="font-extrabold uppercase tracking-widest text-xs">Medical Disclaimer</h3>
              </div>
              <p className="text-[10px] font-medium leading-normal text-rose-50/90 italic">
                Decision support only. Not a replacement for clinical judgment. Always verify dosing, contraindications, drug interactions and side effects with TGA product materials.
              </p>
              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-rose-200">
                <span>V1.2 Release</span>
                <span>© 2026 Clinical Decision Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

