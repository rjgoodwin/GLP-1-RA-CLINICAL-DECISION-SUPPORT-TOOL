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
  Clock
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
  population: 'general',
  currentMedications: [],
};

const MEDICATION_INTERACTIONS: { keywords: string[], severity: 'high' | 'moderate' | 'low', warning: string, management: string }[] = [
  {
    keywords: ['insulin'],
    severity: 'high',
    warning: 'Increased risk of severe hypoglycemia.',
    management: 'Consider reducing insulin dose by 20-50% upon initiation. Frequent blood glucose monitoring is essential.'
  },
  {
    keywords: ['gliclazide', 'glipizide', 'glimepiride', 'sulfonylurea', 'daonil', 'diamicron'],
    severity: 'high',
    warning: 'Increased risk of hypoglycemia.',
    management: 'Consider reducing sulfonylurea dose by 50% or stopping. Monitor blood glucose closely.'
  },
  {
    keywords: ['perindopril', 'ramipril', 'irbesartan', 'candesartan', 'amlodipine', 'atenolol', 'metoprolol', 'antihypertensive', 'lisinopril', 'telmisartan'],
    severity: 'moderate',
    warning: 'Potential for additive hypotensive effect.',
    management: 'Monitor blood pressure routinely. Down-titrate antihypertensives if hypotension or dizziness occurs.'
  },
  {
    keywords: ['warfarin', 'coumadin', 'marevan'],
    severity: 'moderate',
    warning: 'Potential for altered INR due to delayed gastric emptying and dietary changes.',
    management: 'Monitor INR one week after initiation and during dose escalation.'
  },
  {
    keywords: ['dapagliflozin', 'empagliflozin', 'sglt2', 'forxiga', 'jardiance'],
    severity: 'moderate',
    warning: 'Risk of euglycaemic ketoacidosis (especially if combined with VLED).',
    management: 'Monitor ketones if patient feels unwell. Consider temporary cessation if on VLED.'
  },
  {
    keywords: ['digoxin', 'lithium', 'phenytoin', 'theophylline'],
    severity: 'low',
    warning: 'Delayed gastric emptying may affect absorption of narrow therapeutic index drugs.',
    management: 'Monitor clinical effect and serum levels where appropriate.'
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
  const [complications, setComplications] = useState<Complications>(INITIAL_COMPLICATIONS);
  const [contraindications, setContraindications] = useState<Contraindications>(INITIAL_CONTRAINDICATIONS);
  const [medInput, setMedInput] = useState('');

  const resetTool = () => {
    setPatient(INITIAL_PATIENT);
    setComplications(INITIAL_COMPLICATIONS);
    setContraindications(INITIAL_CONTRAINDICATIONS);
    setMedInput('');
  };

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
  };

  const toggleContraindication = (key: keyof Contraindications) => {
    setContraindications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addMedication = () => {
    if (medInput.trim()) {
      setPatient(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, medInput.trim()]
      }));
      setMedInput('');
    }
  };

  const removeMedication = (index: number) => {
    setPatient(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter((_, i) => i !== index)
    }));
  };

  const interactions = useMemo(() => {
    const identified: Interaction[] = [];
    patient.currentMedications.forEach(med => {
      const lowerMed = med.toLowerCase();
      MEDICATION_INTERACTIONS.forEach(inter => {
        if (inter.keywords.some(k => lowerMed.includes(k))) {
          identified.push({
            medication: med,
            severity: inter.severity,
            warning: inter.warning,
            management: inter.management
          });
        }
      });
    });
    return identified;
  }, [patient.currentMedications]);

  const assessment = useMemo(() => {
    const reasons: string[] = [];
    const hasComplications = Object.values(complications).some(v => v);
    const hasContraindications = Object.values(contraindications).some(v => v);
    
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

    const isEligible = (eligibleByBMI || eligibleByWC) && !hasContraindications && patient.age >= 18;

    const missingFactors: string[] = [];
    if (patient.age > 0 && patient.age < 18) {
      missingFactors.push('Patient must be 18 years or older');
    }
    if (hasContraindications) {
      missingFactors.push('Presence of clinical contraindications makes therapy inappropriate');
    }
    if (!eligibleByBMI && !eligibleByWC && !hasContraindications && patient.age >= 18) {
      missingFactors.push(`BMI must be ≥ ${bmiThreshold} kg/m²`);
      if (!hasComplications) {
        missingFactors.push(`BMI ≥ ${overweightThreshold} kg/m² with one or more clinical comorbidities (e.g. Type 2 Diabetes, OSA, Hypertension)`);
      }
      missingFactors.push(`Waist Circumference must be > ${wcThreshold} cm`);
    }

    return {
      isEligible,
      reasons,
      hasContraindications,
      isUnderage: patient.age > 0 && patient.age < 18,
      missingFactors
    };
  }, [patient, complications, contraindications]);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 transition-transform hover:scale-105 duration-300">
              <Stethoscope size={24} />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 leading-none py-1">
                <span className="block">GLUCAGON-LIKE RECEPTOR-1 AGONISTS (GLP-1RAs)</span>
                <span className="block text-indigo-600 mt-1 uppercase text-[13px] md:text-base">Clinical Decision Support Tool for Weight Management</span>
              </h1>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <Activity size={14} className="text-indigo-500" />
              <span>Evidence-Based Algorithm</span>
            </div>
            <button 
              onClick={resetTool}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl transition-all font-bold border border-slate-200 hover:border-red-200 shadow-sm shadow-slate-200/50"
            >
              <RotateCcw size={16} className="transition-transform group-hover:rotate-[-45deg]" />
              <span className="text-sm">Reset</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
          
          {/* Section 1: Patient Profile */}
          <section className="glass-card rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <User size={18} className="text-indigo-600" />
                </div>
                <h2 className="font-extrabold text-slate-800 tracking-tight">Patient Profile</h2>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border border-slate-100 px-3 py-1 rounded-full">Step 01</span>
            </div>
            <div className="p-6 space-y-6 bg-white/40">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl flex items-start gap-4">
                <Lock size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-900/70 leading-relaxed font-medium">
                  <span className="font-bold text-indigo-900">Privacy Notice:</span> To maintain patient confidentiality and comply with Australian Privacy Principles, do not enter any patient-identifying information such as names or dates of birth. Data entry should be limited to necessary clinical parameters only [5].
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="label-upper">Age (Years)</label>
                  <input 
                    type="number" 
                    className="input-field"
                    placeholder=""
                    value={patient.age || ''}
                    onChange={(e) => handlePatientChange('age', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="label-upper">Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['female', 'male'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => handlePatientChange('gender', g)}
                        className={`h-11 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all ${
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

                <div className="space-y-2">
                  <label className="label-upper">Population Group</label>
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative flex items-center mt-0.5">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={patient.population === 'asian_indigenous'}
                          onChange={() => handlePatientChange('population', patient.population === 'asian_indigenous' ? 'general' : 'asian_indigenous')}
                        />
                        <div className="w-6 h-6 border-2 border-slate-400 rounded-lg peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all group-hover:border-indigo-200 shadow-sm"></div>
                        <Check size={14} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">
                          High Metabolic Risk Population
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-tight">
                          (Asian / Indigenous descent)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 border border-slate-200/60 p-5 rounded-2xl italic mt-2">
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  <span className="font-bold text-slate-700 not-italic">Clinical Note:</span> Specific ethnic groups, including people of East Asian, South Asian, South-East Asian, and Aboriginal or Torres Strait Islander descent, are classified as high metabolic risk. The Australian Obesity Management Algorithm recommends identifying these groups because they experience obesity-related complications at lower BMI levels [1].
                </p>
              </div>
            </div>
          </section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Section 2: Patient Anthropometry */}
          <section className="glass-card rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Activity size={18} className="text-sky-600" />
                </div>
                <h2 className="font-extrabold text-slate-800 tracking-tight">Patient Anthropometry</h2>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border border-slate-100 px-3 py-1 rounded-full">Step 02</span>
            </div>
            <div className="p-6 space-y-6 bg-white/40">
              <p className="text-[11px] text-slate-500 leading-relaxed bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50 italic font-medium">
                Baseline criteria for identifying overweight and obesity [1].
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-upper">Weight (kg)</label>
                  <input 
                    type="number" 
                    className="input-field text-lg"
                    placeholder=""
                    value={patient.weight || ''}
                    onChange={(e) => handlePatientChange('weight', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Height (cm)</label>
                  <input 
                    type="number" 
                    className="input-field text-lg"
                    placeholder=""
                    value={patient.height || ''}
                    onChange={(e) => handlePatientChange('height', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-upper">BMI (kg/m²)</label>
                  <input 
                    type="number" 
                    className="input-field text-xl font-bold bg-slate-50/80 border-slate-300 text-indigo-600"
                    placeholder=""
                    value={patient.bmi ? patient.bmi.toFixed(1) : ''}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-upper">Waist Circumference (cm)</label>
                  <input 
                    type="number" 
                    className="input-field text-lg"
                    placeholder=""
                    value={patient.waistCircumference || ''}
                    onChange={(e) => handlePatientChange('waistCircumference', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>
          </section>
        </motion.div>


        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Section 2: Clinical Context */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Comorbidities */}
            <section className="glass-card rounded-[32px] overflow-hidden group">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Activity size={18} className="text-amber-500" />
                  </div>
                  <h2 className="font-extrabold text-slate-800 tracking-tight text-sm">Comorbidities</h2>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-0.5 border border-slate-100 rounded-lg">Step 03</span>
              </div>
              <div className="p-4 space-y-3 bg-white/40">
                <p className="text-[11px] text-slate-500 leading-normal bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 italic font-medium">
                  Identifies treatment intensity and BMI eligibility thresholds [1].
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {Object.keys(INITIAL_COMPLICATIONS).map((key) => (
                    <label key={key} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 transition-all cursor-pointer group/item border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md shadow-slate-200/20">
                      <div className="relative flex items-center">
                        <input 
                          type="checkbox" 
                          className="peer sr-only"
                          checked={complications[key as keyof Complications]}
                          onChange={() => toggleComplication(key as keyof Complications)}
                        />
                        <div className="w-5 h-5 border-2 border-slate-400 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all group-hover/item:border-amber-200"></div>
                        <CheckCircle2 size={12} className="absolute left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
                        {COMPLICATION_LABELS[key] || key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Contraindications */}
            <section className="glass-card rounded-[32px] overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
                    <AlertCircle size={18} className="text-rose-500" />
                  </div>
                  <h2 className="font-extrabold text-slate-800 tracking-tight text-sm">Contraindications</h2>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-2 py-0.5 border border-slate-100 rounded-lg">Step 04</span>
              </div>
              <div className="p-4 space-y-3 bg-white/40">
                <p className="text-[11px] text-slate-500 leading-normal bg-rose-50/50 p-3 rounded-xl border border-rose-100/30 italic font-medium">
                  Critical safety exclusion factors for GLP-1RA therapy inappropriately [4].
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {Object.keys(INITIAL_CONTRAINDICATIONS).map((key) => (
                    <label key={key} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 transition-all cursor-pointer group/item border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md shadow-slate-200/20">
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
                      <span className="text-xs font-bold text-slate-600 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
                        {CONTRAINDICATION_LABELS[key] || key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Section 3: Medication List */}
          <section className="glass-card rounded-[32px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Pill size={18} className="text-emerald-600" />
                </div>
                <h2 className="font-extrabold text-slate-800 tracking-tight">Current Medications</h2>
              </div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full">Step 05</span>
            </div>
            <div className="p-6 space-y-6 bg-white/40">
              <p className="text-[11px] text-slate-500 leading-relaxed bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 italic font-medium">
                Identifying potential interactions is critical. GLP-1RA can alter absorption through delayed gastric emptying and increase hypoglycemia risk [4].
              </p>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    className="input-field pl-11 h-14 text-base"
                    placeholder="Enter medication name..."
                    value={medInput}
                    onChange={(e) => setMedInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Pill size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
                <button 
                  onClick={addMedication}
                  className="h-14 px-8 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <AnimatePresence>
                  {patient.currentMedications.map((med, i) => (
                    <motion.div 
                      key={`${med}-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-300 rounded-2xl group shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                    >
                      <span className="text-sm font-bold text-slate-700 lowercase first-letter:uppercase">{med}</span>
                      <button 
                        onClick={() => removeMedication(i)}
                        className="text-slate-300 hover:text-rose-500 transition-colors bg-slate-50 p-1 rounded-lg"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {patient.currentMedications.length === 0 && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl w-full text-center">No medications added. Enter current medications to check for interactions.</p>
                )}
              </div>
            </div>
          </section>
        </motion.div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 space-y-6">
          <section className="glass-card rounded-[40px] overflow-hidden sticky top-24 shadow-2xl shadow-indigo-100/50">
            <div className="p-6 border-b border-slate-100 bg-slate-900 border-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <ClipboardCheck size={20} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-white tracking-tight">Clinical Recommendation</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400">Analysis Result</p>
                  </div>
                </div>
                <div className="px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-black text-white/50 uppercase tracking-widest border border-white/10">v1.2</div>
              </div>
            </div>

            <div className="p-6 space-y-6 bg-white">
              {/* Eligibility Status */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Eligibility Status</h3>
                <AnimatePresence mode="wait">
                  {assessment.isEligible ? (
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

              {/* Drug Interactions */}
              {patient.currentMedications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Drug Interactions Analysis</h3>
                  {interactions.length > 0 ? (
                    <div className="space-y-3">
                      {interactions.map((inter, i) => (
                        <div key={i} className={`p-4 rounded-[28px] border-2 shadow-sm ${
                          inter.severity === 'high' ? 'bg-rose-50 border-rose-100 text-rose-900' :
                          inter.severity === 'moderate' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                          'bg-indigo-50 border-indigo-100 text-indigo-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle size={18} className={
                              inter.severity === 'high' ? 'text-rose-600' :
                              inter.severity === 'moderate' ? 'text-amber-600' :
                              'text-indigo-600'
                            } />
                            <span className="font-extrabold text-xs uppercase tracking-tight">
                              {inter.medication} Alert
                            </span>
                          </div>
                          <p className="text-xs font-black mb-1.5 leading-tight">{inter.warning}</p>
                          <div className="mt-2 pt-2 border-t border-black/5">
                            <p className="text-[11px] font-medium leading-relaxed"><span className="font-black">Management:</span> {inter.management}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-3xl flex items-start gap-3 border-dashed">
                      <ShieldCheck size={18} className="text-emerald-600 mt-0.5" />
                      <p className="text-[11px] font-bold text-emerald-800 leading-relaxed">
                        No known drug interactions identified for the entered medications.
                      </p>
                    </div>
                  )}
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
                      "Self-Monitoring of Blood Glucose (SMBG) if comorbid diabetes",
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
            </div>
          </section>
        </div>
      </div>
    </main>

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
                This tool is intended for use by healthcare professionals as a decision support aid. It does not replace clinical judgment or official product information. Always verify dosing and contraindications with current professional guidelines and TGA-approved product materials.
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

