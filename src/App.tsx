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
  Zap
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
    management: 'Prescribe with monitoring. Monitor BP regularly. Consider dose reduction if blood pressure falls below target.',
    recommendationLabel: 'Prescribe with monitoring (BP)'
  },
  {
    id: 'arbs',
    label: 'Angiotensin II Receptor Blockers (ARBs)',
    severity: 'monitoring' as const,
    warning: 'Risk of additive hypotension or orthostasis, especially with concurrent weight loss.',
    management: 'Prescribe with monitoring. Monitor BP regularly. Review dose if blood pressure is consistently below target.',
    recommendationLabel: 'Prescribe with monitoring (BP)'
  },
  {
    id: 'diuretics',
    label: 'Diuretics',
    severity: 'monitoring' as const,
    warning: 'Risk of hypotension, orthostasis, and potential dehydration/electrolyte imbalance.',
    management: 'Prescribe with monitoring. Monitor BP and hydration status. Consider dose reduction or cessation if blood pressure falls below target.',
    recommendationLabel: 'Prescribe with monitoring (BP & Hydration)'
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

  const handleReset = () => {
    setPatient(INITIAL_PATIENT);
    setComplications(INITIAL_COMPLICATIONS);
    setContraindications(INITIAL_CONTRAINDICATIONS);
    setComphistoryNone(false);
    setContraNone(false);
    setMedsNone(false);
    setShowClinicalNote(false);
    setCopySuccess(false);
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
    medsNone
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
  };

  const resetAnthropometry = () => {
    setPatient(prev => ({
      ...prev,
      weight: 0,
      height: 0,
      bmi: 0,
      waistCircumference: 0
    }));
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
    if (patient.age > 0 && patient.age < 18) {
      missingFactors.push('Patient must be 18 years or older');
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
    const isAgeComplete = patient.age > 0;
    const isGenderComplete = patient.gender !== null;
    const isPopulationComplete = patient.population !== null;
    const isComplicationsComplete = Object.values(complications).some(v => v) || comphistoryNone;
    const isContraindicationsComplete = Object.values(contraindications).some(v => v) || contraNone;
    const isMedicationsComplete = patient.currentMedications.length > 0 || medsNone;
    
    const isComplete = isWeightComplete && isHeightComplete && isWaistComplete && 
                        isAgeComplete && isGenderComplete && isPopulationComplete &&
                        isComplicationsComplete && isContraindicationsComplete && isMedicationsComplete;

    const missingSections: string[] = [];
    if (!isWeightComplete) missingSections.push('Weight');
    if (!isHeightComplete) missingSections.push('Height');
    if (!isWaistComplete) missingSections.push('Waist Circumference');
    if (!isAgeComplete) missingSections.push('Age (Adults 18+)');
    if (!isGenderComplete) missingSections.push('Sex Assigned at Birth');
    if (!isPopulationComplete) missingSections.push('High Metabolic Risk Population status');
    if (!isComplicationsComplete) missingSections.push('Comorbidities Assessment');
    if (!isContraindicationsComplete) missingSections.push('Contraindications Assessment');
    if (!isMedicationsComplete) missingSections.push('Interactions Check');

    // A patient is clinical eligible based on metrics
    const meetsMedicalCriteria = (eligibleByBMI || eligibleByWC) && !hasContraindications && patient.age >= 18;
    
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

    if (isComplete && !eligibleByBMI && !eligibleByWC && !hasContraindications && patient.age >= 18) {
      missingFactors.push(`BMI must be ≥ ${bmiThreshold} kg/m²`);
      if (!hasComplications) {
        missingFactors.push(`BMI ≥ ${overweightThreshold} kg/m² with one or more clinical comorbidities (e.g. Type 2 Diabetes, OSA, Hypertension)`);
      }
      missingFactors.push(`Waist Circumference must be > ${wcThreshold} cm`);
    }

    if (hasAbsoluteDrugInteraction) {
      missingFactors.push('Absolute pharmacological contraindication detected');
    }

    return {
      isEligible,
      safetyState,
      reasons,
      hasContraindications: hasContraindications || hasAbsoluteDrugInteraction,
      isUnderage: patient.age > 0 && patient.age < 18,
      isComplete,
      missingSections,
      missingFactors,
      interactionSummary,
      isHighMetabolicRisk: patient.population === 'asian_indigenous'
    };
  }, [patient, complications, contraindications, interactions, comphistoryNone, contraNone, medsNone]);

  const medications: MedicationOption[] = [
    {
      name: 'Semaglutide',
      brand: 'Wegovy®',
      startingDose: '0.25 mg once weekly',
      escalation: 'Increase dose every 4 weeks (0.25 mg → 0.5 mg → 1.0 mg → 1.7 mg → 2.4 mg) subject to tolerance [2, 3]',
      maxDose: '2.4 mg once weekly',
      contraindications: ['Medullary Thyroid Cancer', 'Multiple Endocrine Neoplasia Syndrome Type 2 (MEN2)', 'Pregnancy'],
      sideEffects: ['Nausea', 'Diarrhoea', 'Vomiting', 'Constipation', 'Pancreatitis (rare)'],
    },
    {
      name: 'Tirzepatide',
      brand: 'Mounjaro®',
      startingDose: '2.5 mg once weekly',
      escalation: 'Increase dose to 5 mg weekly after 4 weeks. Further increases can be made in 2.5 mg increments every 4 weeks [2, 3]',
      maxDose: '15 mg once weekly',
      contraindications: ['Pregnancy', 'Breastfeeding / Lactation', 'Medullary Thyroid Cancer', 'MEN2 Syndrome', 'History of Pancreatitis', 'Hypersensitivity to GLP-1 RA / GIP'],
      sideEffects: ['Nausea', 'Diarrhoea', 'Vomiting', 'Decreased appetite'],
    },
    {
      name: 'Liraglutide',
      brand: 'Saxenda®',
      startingDose: '0.6 mg daily',
      escalation: 'Increase by 0.6 mg weekly until maximum dose is reached to minimize GI side effects [1, 2]',
      maxDose: '3.0 mg daily',
      contraindications: ['Pregnancy', 'Medullary Thyroid Cancer', 'MEN2 Syndrome', 'Hypersensitivity to GLP-1 RA'],
      sideEffects: ['Nausea', 'Vomiting', 'Diarrhoea', 'Constipation', 'Gallstones'],
    }
  ];

  const generateClinicalNote = () => {
    const date = new Date().toLocaleDateString('en-AU');
    const time = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    
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
      note += `- Suggested medications per algorithm: ${medications.map(m => m.name).join(', ')}.\n`;
      note += `- Follow standard escalation schedule and monthly clinical review.\n`;
      note += `- Emphasise lifestyle modification including calorie deficit and 150-300 mins exercise/week.\n`;
    } else {
      note += `- Not meeting criteria for GLP-1 RA at this time based on algorithm thresholds.\n`;
      note += `- Recommend ongoing lifestyle support and review metrics in 3-6 months.\n`;
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
                <span className="block text-indigo-600 mt-1 uppercase text-[8px] md:text-sm font-black">Clinical Decision Support Tool</span>
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

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="p-6 bg-amber-50 border-2 border-amber-200 rounded-[32px] shadow-sm flex items-start gap-4 mb-2"
            >
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-black text-amber-900 uppercase tracking-tight">Important Clinical Guidance</h3>
                <p className="text-xs text-amber-800/80 font-medium leading-relaxed mt-1">
                  All 4 sections below must be completed before patient eligibility can be determined. Please ensure that each field is marked either with positive findings or by selecting "None of the above" where applicable. Additionally, please ensure that the patient has provided informed consent to the use of this calculator and the entry of their clinical data.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
          
          {/* Section 1: Anthropometry Check */}
          <section className="glass-card rounded-[32px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <span className="font-black text-lg">1</span>
                </div>
                    <div>
                      <h2 className="font-black text-slate-800 tracking-tight text-lg uppercase">Anthropometry Check</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Weight, Height & BMI Measurements</p>
                    </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetAnthropometry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <RotateCcw size={12} />
                  <span>Reset Section</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 bg-white/40">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-3">
                  <label className="label-upper">Weight (kg)</label>
                  <input 
                    type="number" 
                    className={`input-field text-lg font-bold transition-colors ${patient.weight > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                    placeholder="0.0"
                    value={patient.weight || ''}
                    onChange={(e) => handlePatientChange('weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-upper">Height (cm)</label>
                  <input 
                    type="number" 
                    className={`input-field text-lg font-bold transition-colors ${patient.height > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                    placeholder="0"
                    value={patient.height || ''}
                    onChange={(e) => handlePatientChange('height', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="label-upper">BMI (kg/m²)</label>
                  <div className={`input-field flex items-center justify-between transition-all ${
                    patient.bmi >= 30 ? 'bg-amber-50 border-amber-200' : 
                    patient.bmi > 0 ? 'bg-indigo-50/30 border-indigo-600' : 
                    'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-2xl font-black ${
                      patient.bmi >= 30 ? 'text-amber-600' : 
                      patient.bmi > 0 ? 'text-indigo-600' : 
                      'text-indigo-400'
                    }`}>
                      {patient.bmi ? patient.bmi.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="label-upper">Waist Circumference (cm)</label>
                  <input 
                    type="number" 
                    className={`input-field text-lg font-bold transition-colors ${patient.waistCircumference > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                    placeholder="0"
                    value={patient.waistCircumference || ''}
                    onChange={(e) => handlePatientChange('waistCircumference', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </section>
        </motion.div>

        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Section 2: Patient Context */}
              <section className="glass-card rounded-[32px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                      <span className="font-black text-lg">2</span>
                    </div>
                    <div>
                      <h2 className="font-black text-slate-800 tracking-tight text-lg uppercase">Patient Context</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Demographics & Population</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={resetPatientContext}
                      className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Section</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6 bg-white/40">
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-4">
                    <Lock size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                      <span className="font-bold text-indigo-900">Privacy Notice:</span> To maintain patient confidentiality and comply with Australian Privacy Principles, do not enter any patient-identifying information [5].
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="label-upper">Age (Adults 18+)</label>
                      <input 
                        type="number" 
                        className={`input-field font-bold transition-all ${patient.age > 0 ? 'border-indigo-600 text-indigo-600' : 'border-slate-300'}`}
                        placeholder="18"
                        value={patient.age || ''}
                        onChange={(e) => handlePatientChange('age', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-3">
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
            <section className="glass-card rounded-[32px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                    <span className="font-black text-lg">3</span>
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 tracking-tight text-lg uppercase">Clinical Assessment</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Screening & Safety</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={resetClinicalAssessment}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    <RotateCcw size={12} />
                    <span>Reset Section</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-8 bg-white/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Comorbidities */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Plus size={14} className="text-amber-500" />
                        Comorbidities
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">Affects eligibility thresholds</p>
                    </div>
                    <div className="space-y-1.5">
                      {Object.keys(INITIAL_COMPLICATIONS).map((key) => (
                        <label key={key} className="flex items-center gap-3 p-2 rounded-xl group/item cursor-pointer border border-transparent hover:bg-white hover:shadow-sm transition-all">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              className="peer sr-only"
                              checked={complications[key as keyof Complications]}
                              onChange={() => toggleComplication(key as keyof Complications)}
                            />
                            <div className="w-5 h-5 border-2 border-slate-400 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all group-hover/item:border-amber-200"></div>
                            <Check size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-rose-500" />
                        Contraindications
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase tracking-tighter">Safety exclusion factors</p>
                    </div>
                    <div className="space-y-1.5">
                      {Object.keys(INITIAL_CONTRAINDICATIONS).map((key) => (
                        <label key={key} className="flex items-center gap-3 p-2 rounded-xl group/item cursor-pointer border border-transparent hover:bg-white hover:shadow-sm transition-all">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              className="peer sr-only"
                              checked={contraindications[key as keyof Contraindications]}
                              onChange={() => toggleContraindication(key as keyof Contraindications)}
                            />
                            <div className="w-5 h-5 border-2 border-slate-400 rounded-lg peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all group-hover/item:border-rose-200"></div>
                            <AlertTriangle size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
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
          <section className="glass-card rounded-[32px] overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-100/50">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                  <span className="font-black text-lg">4</span>
                </div>
                <div>
                  <h2 className="font-black text-slate-800 tracking-tight text-lg uppercase">Interactions Check</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pharmacological Safety</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={resetInteractions}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                >
                  <RotateCcw size={12} />
                  <span>Reset Section</span>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6 bg-white/40">
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Identify key medications that may involve clinical interactions with GLP-1RA therapy [4].
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INTERACTION_MEDICATIONS.map((med) => (
                  <label 
                    key={med.id} 
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer border transition-all hover:shadow-md ${
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
                      <div className={`w-5 h-5 border-2 rounded-lg transition-all ${
                        patient.currentMedications.includes(med.id)
                        ? 'bg-emerald-600 border-emerald-600'
                        : 'border-slate-300'
                      }`}></div>
                      <Check size={12} className={`absolute left-1 text-white transition-opacity ${
                        patient.currentMedications.includes(med.id) ? 'opacity-100' : 'opacity-0'
                      }`} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 tracking-tight leading-none">{med.label}</span>
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

        {/* Right Column: Results */}
        <div className="lg:col-span-5 relative">
          <AnimatePresence>
            {isCalculating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/40 backdrop-blur-[2px] rounded-[40px] flex items-center justify-center pointer-events-none"
              >
                <div className="bg-white px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
                  <Loader2 className="animate-spin text-indigo-600" size={24} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600">Re-evaluating Clinical Eligibility...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
          <section className="glass-card rounded-[40px] overflow-hidden sticky top-24 shadow-2xl shadow-slate-200/50 border border-slate-200">
            <div className="p-6 bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white tracking-tight leading-none">Assessment Summary</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400 mt-1">Real-time Clinical Guide</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8 bg-white">
              {/* Quick Input Summary */}
              {(patient.weight > 0 || patient.age > 0) && (
                <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Calculated BMI</p>
                    <p className={`text-xl font-black ${patient.bmi >= 30 ? 'text-amber-600' : 'text-indigo-600'}`}>
                      {patient.bmi ? patient.bmi.toFixed(1) : '—'} <span className="text-[10px] text-slate-400">kg/m²</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Patient Age</p>
                    <p className="text-xl font-black text-slate-800">
                      {patient.age > 0 ? patient.age : '—'} <span className="text-[10px] text-slate-400">yrs</span>
                    </p>
                  </div>
                </div>
              )}
              {/* Eligibility Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Eligibility Status</h3>
                <AnimatePresence mode="wait">
                  {assessment.safetyState === 'incomplete' ? (
                    <motion.div 
                      key="incomplete"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-start gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 shadow-lg shadow-indigo-50">
                        <Clock size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-indigo-900 leading-tight tracking-tight">Assessment Incomplete</p>
                        <p className="text-xs text-indigo-700/80 mt-1 font-medium leading-relaxed italic">
                          Please complete the following required sections to finalize the clinical eligibility calculation:
                        </p>
                        <ul className="mt-3 space-y-1.5">
                          {assessment.missingSections.map((section, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50/50 px-2 py-1 rounded-lg border border-red-100/50">
                              <AlertCircle size={10} />
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
                      className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-start gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <p className="font-black text-emerald-900 leading-tight">Patient is Eligible</p>
                        <p className="text-xs text-emerald-700/80 mt-1 font-medium leading-relaxed italic">Meets evidence-based criteria for GLP-1 RA therapy adjunct to lifestyle intervention.</p>
                      </div>
                    </motion.div>
                  ) : assessment.safetyState === 'caution' ? (
                    <motion.div 
                      key="caution"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-start gap-4 shadow-sm"
                    >
                      <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                        <Scale size={24} />
                      </div>
                      <div>
                        <p className="font-black text-amber-900 leading-tight">Eligible with Caution</p>
                        <p className="text-xs text-amber-700/80 mt-1 font-medium leading-relaxed italic">Patient meets weight criteria, but significant clinical or pharmacological cautions are present. Review interaction details below before prescribing.</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="ineligible"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-start gap-4"
                    >
                      <div className="w-12 h-12 bg-slate-400 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200">
                        <Info size={24} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">Criteria Not Met</p>
                        <p className="text-xs text-slate-600/80 mt-1 font-medium leading-relaxed italic mb-4">
                          {assessment.hasContraindications 
                            ? "Medical contraindications identified. GLP-1 RA therapy is not appropriate." 
                            : assessment.isUnderage
                            ? "Tool is for adult patients (18+) only."
                            : "Patient does not currently meet weight-based clinical thresholds for pharmacotherapy."}
                        </p>

                        {assessment.missingFactors.length > 0 && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-slate-200/60">
                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Requirements for Eligibility:</h4>
                            <ul className="space-y-1.5">
                              {assessment.missingFactors.map((f, i) => (
                                <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-500 leading-tight">
                                  <div className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
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

              {/* Criteria Met */}
              {assessment.reasons.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Clinical Criteria Met</h3>
                  <div className="space-y-2">
                    {assessment.reasons.map((r, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700">
                        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-indigo-600" />
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
                  <div className="p-5 bg-orange-50 border-2 border-orange-100/50 rounded-[32px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <ShieldAlert size={64} className="text-orange-600" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-200">
                          <Zap size={20} />
                        </div>
                        <p className="font-black text-sm text-orange-950 tracking-tight leading-tight">Patient in High Metabolic Risk Category</p>
                      </div>
                      <p className="text-[11px] font-bold text-orange-900/80 leading-relaxed mb-4">
                        This patient belongs to a population group (Asian or Indigenous) known to have a significantly higher risk of cardiometabolic complications at lower anthropometric levels compared to the general population.
                      </p>
                      
                      <div className="space-y-3 p-3.5 bg-white/60 rounded-2xl border border-orange-200/40">
                        <p className="text-[10px] font-black uppercase text-orange-600/60 tracking-widest mb-1">Clinical Importance for Prescribers:</p>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-orange-800 leading-relaxed">
                            <span className="font-black">Early Intervention:</span> Patients should be considered for GLP-1 RA therapy at lower BMI (≥27.5) and Waist Circumference thresholds, as health risks escalate faster in these groups.
                          </p>
                          <p className="text-[10px] font-bold text-orange-800 leading-relaxed">
                            <span className="font-black">Metabolic Sensitivity:</span> These individuals may experience metabolic benefits even with modest weight loss, making them strong candidates for early pharmacological adjuncts to lifestyle changes.
                          </p>
                          <p className="text-[10px] font-bold text-orange-800 leading-relaxed">
                            <span className="font-black">Co-morbidity Screening:</span> Heightened vigilance is required for screening and managing comorbid Type 2 Diabetes and Cardiovascular disease, which often manifest earlier.
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
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Pharmacotherapy Options</h3>
                  </div>
                  
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-4">
                    <ShieldCheck size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-indigo-900/70 leading-relaxed font-semibold">
                      <span className="font-bold text-indigo-900 uppercase">Clinical Recommendation:</span> Dosage information is provided from the Australian Obesity Management Algorithm and clinical review articles [1, 2, 3]. These doses are general recommendations only. Clinicians must exercise independent professional judgment to determine whether these recommendations are appropriate for their individual patient.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {medications.map((med) => (
                      <div key={med.name} className="p-5 bg-slate-50/50 border border-slate-100 rounded-[32px] hover:border-indigo-200 transition-all group hover:bg-white hover:shadow-xl hover:shadow-indigo-100/30">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="font-black text-slate-900 text-base">{med.name}</span>
                            <span className="ml-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">{med.brand}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Dose</p>
                            <p className="text-sm font-black text-indigo-600 mt-0.5">{med.startingDose}</p>
                          </div>
                          <div className="p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Max Dose</p>
                            <p className="text-sm font-black text-indigo-600 mt-0.5">{med.maxDose}</p>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-white/50 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <Clock size={10} className="text-indigo-500" />
                            Escalation Schedule
                          </p>
                          <p className="text-xs text-slate-600 font-bold leading-relaxed">{med.escalation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoring */}
              {assessment.isEligible && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Safety and Monitoring Recommendations [1, 2, 3]</h3>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      "Monthly clinical review for dose tolerance",
                      "Monitor Blood Pressure & Resting Heart Rate (HR)",
                      "self-monitored blood glucose if comorbid diabetes",
                      "Assess for prolonged Gastrointestinal (GI) symptoms",
                      "Energy-reduced diet (approx. 2000–4000 kJ/day deficit)",
                      "Aerobic and resistance physical activity (150–300 mins/week)",
                      "Standardized behavioral lifestyle interventions"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 bg-slate-50/50 rounded-xl text-[10px] font-bold text-slate-500 border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                        {item}
                      </div>
                    ))}
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
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-3 px-8 py-5 bg-white hover:bg-slate-50 text-slate-800 rounded-[32px] transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 border border-slate-200 group"
        >
          <RotateCcw size={18} className="text-indigo-600 group-hover:rotate-[-120deg] transition-transform duration-500" />
          <span>Reset All Sections</span>
        </button>
      </div>

      {/* Footer: Citations & Disclaimer */}
      <footer className="max-w-7xl mx-auto px-6 pb-12 pt-6">
        <div className="glass-card rounded-[40px] p-8 space-y-8 bg-white/80 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" />
                Scientific References
              </h3>
              <ul className="space-y-3">
                {[
                  "[1] Markovic TP, et al. The Australian Obesity Management Algorithm - a simple tool to guide the management of obesity in primary care. 2022.",
                  "[2] Li YR, et al. Glucagon-like peptide-1 receptor agonists for weight loss: Consider the case for selective pharmacotherapy. AJGP 2025;54(4).",
                  "[3] Forner P, Hocking S. Pharmacotherapy for the management of overweight and obesity. AJGP 2025;54(4).",
                  "[4] Privacy Act 1988 (Cth) & Australian Privacy Principles."
                ].map((cite, i) => (
                  <li key={i} className="text-[10px] text-slate-400 font-medium font-mono leading-relaxed p-3 bg-slate-50 rounded-xl border border-slate-100 hover:text-slate-600 transition-colors">
                    {cite}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-indigo-600 rounded-[32px] text-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-3 mb-3">
                <Info size={20} className="text-indigo-200" />
                <h3 className="font-extrabold uppercase tracking-widest text-sm">Clinical Warning</h3>
              </div>
              <p className="text-xs font-medium leading-relaxed text-indigo-100 italic">
                This tool is intended for use by healthcare professionals as a decision support aid. It does not replace clinical judgment or official product information. Always verify dosing and contraindications with current professional guidelines and TGA-approved product materials. The drug interactions included in this app may not be an exhaustive list.
              </p>
              <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200">
                <span>V1.2 Clinical Release</span>
                <span>© 2026 Clinical Decision Support</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

