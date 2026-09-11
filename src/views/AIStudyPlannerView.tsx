import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Clock, 
  Calendar as CalendarIcon, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  RefreshCw,
  BookOpen,
  BrainCircuit,
  Sliders,
  AlertTriangle,
  Flame,
  Check,
  Trash2,
  Edit2,
  CalendarCheck,
  TrendingUp,
  HelpCircle,
  BarChart3,
  CalendarRange,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  calculateSubjectPriorities, 
  generateAIStudyPlan, 
  runWhatIfSimulation, 
  formatDateStr 
} from '../lib/plannerAlgorithm';
import { StudySession, SubjectPriority, WhatIfScenario, PlanSimulationResult, DifficultyLevel } from '../types';

export const AIStudyPlannerView: React.FC = () => {
  const { 
    profile, 
    subjects, 
    exams, 
    topics, 
    studySessions, 
    dailyProgress,
    getSubjectProgress,
    applyGeneratedPlan,
    applyExamDateChange,
    applyDailyHoursChange,
    updateStudySession,
    deleteStudySession
  } = useApp();

  // Active sub-tab inside AI Planner
  const [activePlannerTab, setActivePlannerTab] = useState<'generator' | 'priorities' | 'what-if' | 'adjustments'>('generator');

  // Plan generation state
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [includeRevision, setIncludeRevision] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [proposedPlan, setProposedPlan] = useState<StudySession[] | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{ session_date: string; start_time: string; duration_minutes: number }>({
    session_date: '',
    start_time: '',
    duration_minutes: 60,
  });

  // Dedicated User Input Parameters for AI Planning (Subject selection, Hours, Exams, Priority, Progress, Difficulty)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(() => subjects.map(s => s.id));
  const [inputDailyHours, setInputDailyHours] = useState<number>(profile?.daily_available_hours || 4);
  const [showInputTuner, setShowInputTuner] = useState<boolean>(true);
  const [subjectConfigs, setSubjectConfigs] = useState<Record<string, {
    difficulty: DifficultyLevel;
    examDate: string;
    currentProgress: number;
    targetScore: number;
  }>>(() => {
    const initial: Record<string, any> = {};
    subjects.forEach(s => {
      const relatedExam = exams.find(e => e.subject_id === s.id);
      initial[s.id] = {
        difficulty: s.difficulty,
        examDate: relatedExam?.exam_date || s.exam_date || '',
        currentProgress: getSubjectProgress(s.id),
        targetScore: s.target_percentage || 90
      };
    });
    return initial;
  });

  // What-if simulation state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-2h-tomorrow');
  const [simulationResult, setSimulationResult] = useState<PlanSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Quick adjustment states
  const [adjustedDailyHours, setAdjustedDailyHours] = useState<number>(profile?.daily_available_hours || 4);
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [newExamDate, setNewExamDate] = useState<string>(exams[0]?.exam_date || '');
  const [adjustmentMessage, setAdjustmentMessage] = useState<string | null>(null);

  // Calculate real-time subject priorities
  const subjectPriorities: SubjectPriority[] = useMemo(() => {
    return calculateSubjectPriorities(subjects, exams, topics, studySessions, getSubjectProgress);
  }, [subjects, exams, topics, studySessions, getSubjectProgress]);

  // Toggle subject selection for plan
  const handleToggleSubject = (subId: string) => {
    if (selectedSubjectIds.includes(subId)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter(id => id !== subId));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, subId]);
    }
  };

  // Update subject configuration parameters
  const handleUpdateSubjectConfig = (subId: string, updates: Partial<{
    difficulty: DifficultyLevel;
    examDate: string;
    currentProgress: number;
    targetScore: number;
  }>) => {
    setSubjectConfigs(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        ...updates
      }
    }));
  };

  // Handle plan generation with animated step feedback & user custom parameters
  const handleGeneratePlan = () => {
    if (!profile) return;
    setIsGenerating(true);
    setGenerationStep('Evaluating 5-factor subject priorities with custom inputs...');

    setTimeout(() => {
      setGenerationStep('Mapping open focus windows & balancing workload...');
      
      setTimeout(() => {
        setGenerationStep('Synthesizing revision sessions & time slots...');

        setTimeout(() => {
          // Prepare active subjects with user overrides
          const activeSubjects = subjects
            .filter(s => selectedSubjectIds.includes(s.id))
            .map(s => {
              const cfg = subjectConfigs[s.id];
              return {
                ...s,
                difficulty: cfg ? cfg.difficulty : s.difficulty,
                exam_date: cfg?.examDate || s.exam_date,
                target_percentage: cfg?.targetScore || s.target_percentage
              };
            });

          // Prepare modified exams
          const activeExams = exams.map(e => {
            const cfg = subjectConfigs[e.subject_id];
            return cfg?.examDate ? { ...e, exam_date: cfg.examDate } : e;
          });

          // Custom progress getter reflecting user inputs
          const customGetSubjectProgress = (id: string) => {
            return subjectConfigs[id]?.currentProgress !== undefined
              ? subjectConfigs[id].currentProgress
              : getSubjectProgress(id);
          };

          const customProfile = {
            ...profile,
            daily_available_hours: inputDailyHours
          };

          const plan = generateAIStudyPlan(
            activeSubjects,
            topics,
            activeExams,
            studySessions,
            customProfile,
            customGetSubjectProgress,
            { horizonDays, includeRevision }
          );
          setProposedPlan(plan);
          setIsGenerating(false);
          setGenerationStep('');
        }, 500);
      }, 500);
    }, 450);
  };

  // Apply proposed plan to actual schedule & Supabase
  const handleApplyPlan = async () => {
    if (!proposedPlan || proposedPlan.length === 0) return;
    await applyGeneratedPlan(proposedPlan);
    setProposedPlan(null);
  };

  // Discard proposed plan
  const handleDiscardPlan = () => {
    setProposedPlan(null);
  };

  // Remove session from proposed plan preview
  const handleRemoveProposedSession = (sessionId: string) => {
    if (!proposedPlan) return;
    setProposedPlan(proposedPlan.filter(s => s.id !== sessionId));
  };

  // Edit session in proposed plan
  const handleStartEditSession = (s: StudySession) => {
    setEditingSessionId(s.id);
    setEditFormData({
      session_date: s.session_date,
      start_time: s.start_time,
      duration_minutes: s.planned_duration_minutes || s.duration_minutes || 60,
    });
  };

  const handleSaveEditSession = (sessionId: string) => {
    if (!proposedPlan) return;
    const [h, m] = editFormData.start_time.split(':').map(Number);
    const endMinutes = h * 60 + m + editFormData.duration_minutes;
    const endHH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endMM = String(endMinutes % 60).padStart(2, '0');

    setProposedPlan(proposedPlan.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        session_date: editFormData.session_date,
        start_time: editFormData.start_time,
        end_time: `${endHH}:${endMM}`,
        duration_minutes: editFormData.duration_minutes,
        planned_duration_minutes: editFormData.duration_minutes,
      };
    }));
    setEditingSessionId(null);
  };

  // Pre-configured What-If Scenarios
  const scenarios: WhatIfScenario[] = [
    {
      id: 'scenario-2h-tomorrow',
      name: '2 Hours Tomorrow (Reduced Capacity)',
      description: 'Simulate having only 2 hours available tomorrow due to college assignment commitments.',
      type: 'hours_change',
      params: { hours: 2 },
    },
    {
      id: 'scenario-dsa-earlier',
      name: 'DSA Exam Advanced by 5 Days',
      description: 'Simulate university surprise announcement advancing the Data Structures exam by 5 days.',
      type: 'exam_shift',
      params: { subject_id: 'sub-dsa', days_shift: -5 },
    },
    {
      id: 'scenario-miss-today',
      name: 'Miss Today’s Study Block',
      description: 'Simulate missing today’s scheduled session and see automated rescheduling impact.',
      type: 'miss_session',
      params: {},
    },
    {
      id: 'scenario-extra-weekend',
      name: '3 Extra Focus Hours This Weekend',
      description: 'Simulate adding 3 additional study hours on Saturday & Sunday for exam prep.',
      type: 'extra_time',
      params: { hours: 3 },
    },
  ];

  const handleRunSimulation = (scId: string) => {
    const sc = scenarios.find(s => s.id === scId);
    if (!sc || !profile) return;
    setIsSimulating(true);
    setSelectedScenarioId(scId);

    setTimeout(() => {
      const result = runWhatIfSimulation(
        sc,
        studySessions,
        subjects,
        exams,
        topics,
        profile,
        getSubjectProgress
      );
      setSimulationResult(result);
      setIsSimulating(false);
    }, 400);
  };

  const handleApplyDailyHours = async () => {
    await applyDailyHoursChange(adjustedDailyHours);
    setAdjustmentMessage(`Updated daily study capacity to ${adjustedDailyHours} hours.`);
    setTimeout(() => setAdjustmentMessage(null), 4000);
  };

  const handleApplyExamDate = async () => {
    if (!selectedExamId || !newExamDate) return;
    await applyExamDateChange(selectedExamId, newExamDate);
    setAdjustmentMessage(`Updated exam date and automatically readjusted upcoming study sessions.`);
    setTimeout(() => setAdjustmentMessage(null), 4000);
  };

  // Group proposed sessions by date for display
  const groupedProposedSessions = useMemo(() => {
    if (!proposedPlan) return {};
    const grouped: Record<string, StudySession[]> = {};
    proposedPlan.forEach(s => {
      if (!grouped[s.session_date]) grouped[s.session_date] = [];
      grouped[s.session_date].push(s);
    });
    return grouped;
  }, [proposedPlan]);

  return (
    <div className="space-y-6 pb-12">
      {/* AI Planner Master Header */}
      <div className="bg-gradient-to-r from-[#1E1138] via-[#111728] to-[#131D36] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#7C3AED]/30 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#7C3AED]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] text-xs font-semibold border border-[#7C3AED]/30">
              <BrainCircuit className="w-4 h-4 text-[#2DD4BF]" />
              <span>Algorithmic Schedule Optimization Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white glow-title">
              AI Study Planner &amp; Dynamic Timetable
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Analyzes exam proximity, progress deficits, difficulty weights, and remaining syllabus hours to synthesize an optimal, conflict-free study schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePlannerTab('generator')}
              className="px-5 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Study Plan</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActivePlannerTab('generator')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activePlannerTab === 'generator'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plan Generator</span>
          </button>
          <button
            onClick={() => setActivePlannerTab('priorities')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activePlannerTab === 'priorities'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Priority Scorecard ({subjects.length})</span>
          </button>
          <button
            onClick={() => setActivePlannerTab('what-if')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activePlannerTab === 'what-if'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>&ldquo;What-If&rdquo; Simulation</span>
          </button>
          <button
            onClick={() => setActivePlannerTab('adjustments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activePlannerTab === 'adjustments'
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Capacity &amp; Exam Date Rules</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PLAN GENERATOR & INTERACTIVE PREVIEW */}
      {activePlannerTab === 'generator' && (
        <div className="space-y-6">
          {/* Interactive Parameters & Subject Input Tuning Panel */}
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#2DD4BF]" />
                  <h3 className="text-base font-bold text-white glow-title">
                    AI Study Plan Inputs &amp; Constraints
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Tune your available study capacity, adjust subject difficulties, deadlines, and current progress before running plan synthesis.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowInputTuner(!showInputTuner)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {showInputTuner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showInputTuner ? 'Collapse Inputs' : 'Expand Inputs'}</span>
                </button>

                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-bold text-xs shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Generating...' : 'Generate Personalized Plan'}</span>
                </button>
              </div>
            </div>

            {/* Top Level Controls: Daily Hours & Horizon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Daily Study Budget</span>
                  </label>
                  <span className="text-xs font-bold text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded-md border border-[#2DD4BF]/30">
                    {inputDailyHours} hrs / day
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={inputDailyHours}
                  onChange={e => setInputDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-[#7C3AED] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>1.0 hr (Light)</span>
                  <span>4.0 hrs (Standard)</span>
                  <span>8.0 hrs (Intensive)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800/80 space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>Planning Horizon</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setHorizonDays(7)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      horizonDays === 7 
                        ? 'bg-[#7C3AED] text-white shadow-xs' 
                        : 'bg-[#111728] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Next 7 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setHorizonDays(14)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      horizonDays === 14 
                        ? 'bg-[#7C3AED] text-white shadow-xs' 
                        : 'bg-[#111728] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Next 14 Days
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1020] border border-slate-800/80 flex flex-col justify-center space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
                  <span>Exam Revision Strategy</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs font-medium text-slate-300 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={includeRevision}
                    onChange={e => setIncludeRevision(e.target.checked)}
                    className="w-4 h-4 text-[#7C3AED] rounded border-slate-700 bg-[#111728] focus:ring-[#7C3AED]"
                  />
                  <span>Synthesize Pre-Exam Buffers (1–2 days prior)</span>
                </label>
              </div>
            </div>

            {/* Subject-Wise Input Matrix */}
            {showInputTuner && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Subject Parameters ({selectedSubjectIds.length} of {subjects.length} selected)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Priority auto-computed via Urgency + Progress Gap + Difficulty Multiplier
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {subjects.map(subject => {
                    const isSelected = selectedSubjectIds.includes(subject.id);
                    const cfg = subjectConfigs[subject.id] || {
                      difficulty: subject.difficulty,
                      examDate: subject.exam_date || '',
                      currentProgress: getSubjectProgress(subject.id),
                      targetScore: subject.target_percentage || 90
                    };
                    const prio = subjectPriorities.find(p => p.subject_id === subject.id);

                    return (
                      <div
                        key={subject.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-[#0B1020] border-slate-700/80'
                            : 'bg-[#0B1020]/40 border-slate-800/40 opacity-50'
                        }`}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Col 1: Checkbox & Name */}
                          <div className="md:col-span-3 flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSubject(subject.id)}
                              className="w-4 h-4 text-[#7C3AED] rounded border-slate-600 bg-[#111728] focus:ring-[#7C3AED] shrink-0"
                            />
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subject.color || '#7C3AED' }} />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{subject.name}</h4>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Prio: {prio?.priority_score || 50}/100</span>
                                <span>• {prio && prio.priority_score >= 60 ? 'High' : (prio && prio.priority_score >= 35 ? 'Medium' : 'Low')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Difficulty Level */}
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                              Difficulty Level
                            </label>
                            <select
                              value={cfg.difficulty}
                              disabled={!isSelected}
                              onChange={e => handleUpdateSubjectConfig(subject.id, { difficulty: e.target.value as DifficultyLevel })}
                              className="w-full px-2 py-1 rounded-lg bg-[#111728] border border-slate-700 text-white text-xs focus:outline-none focus:border-[#7C3AED] disabled:opacity-50"
                            >
                              <option value="Easy">Easy (Light load)</option>
                              <option value="Medium">Medium (Balanced)</option>
                              <option value="Hard">Hard (High load)</option>
                            </select>
                          </div>

                          {/* Col 3: Exam / Deadline */}
                          <div className="md:col-span-3">
                            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                              Exam / Deadline Date
                            </label>
                            <input
                              type="date"
                              value={cfg.examDate}
                              disabled={!isSelected}
                              onChange={e => handleUpdateSubjectConfig(subject.id, { examDate: e.target.value })}
                              className="w-full px-2 py-1 rounded-lg bg-[#111728] border border-slate-700 text-white text-xs focus:outline-none focus:border-[#7C3AED] disabled:opacity-50"
                            />
                          </div>

                          {/* Col 4: Current Progress Slider */}
                          <div className="md:col-span-2">
                            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                              <span>Progress</span>
                              <span className="text-[#2DD4BF] font-bold">{cfg.currentProgress}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={cfg.currentProgress}
                              disabled={!isSelected}
                              onChange={e => handleUpdateSubjectConfig(subject.id, { currentProgress: parseInt(e.target.value, 10) })}
                              className="w-full accent-[#2DD4BF] disabled:opacity-50 cursor-pointer"
                            />
                          </div>

                          {/* Col 5: Target Score */}
                          <div className="md:col-span-2">
                            <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                              Target Score
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="50"
                                max="100"
                                value={cfg.targetScore}
                                disabled={!isSelected}
                                onChange={e => handleUpdateSubjectConfig(subject.id, { targetScore: parseInt(e.target.value, 10) || 90 })}
                                className="w-full px-2 py-1 rounded-lg bg-[#111728] border border-slate-700 text-white text-xs focus:outline-none focus:border-[#7C3AED] disabled:opacity-50"
                              />
                              <span className="text-xs text-slate-400">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generation Progress Indicator */}
            {isGenerating && (
              <div className="p-4 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center gap-3 animate-pulse">
                <Sparkles className="w-5 h-5 text-[#2DD4BF] shrink-0" />
                <div className="text-xs text-slate-200 font-medium">{generationStep}</div>
              </div>
            )}
          </div>

          {/* PROPOSED PLAN PREVIEW BANNER & SESSIONS LIST */}
          {proposedPlan && (
            <div className="space-y-4">
              <div className="bg-[#111728] border border-[#2DD4BF]/40 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 flex items-center justify-center shrink-0 shadow-sm">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 px-2 py-0.5 rounded-md">
                        Plan Ready for Review
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {proposedPlan.length} sessions generated ({Math.round(proposedPlan.reduce((acc, s) => acc + s.duration_minutes, 0) / 60)} hours total)
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">
                      Proposed Study Schedule Generated
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Review, adjust dates or durations, and click &ldquo;Apply Plan to Calendar&rdquo; to save directly to your timetable and Supabase database.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={handleDiscardPlan}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleApplyPlan}
                    className="px-5 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#14B8A6] text-slate-950 text-xs font-bold shadow-md shadow-[#2DD4BF]/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Apply Plan to Calendar</span>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Grouped Preview */}
              <div className="space-y-4">
                {(Object.entries(groupedProposedSessions) as [string, StudySession[]][]).map(([dateStr, sessions]) => {
                  const dateObj = new Date(dateStr + 'T00:00:00');
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  });

                  return (
                    <div key={dateStr} className="bg-[#111728] rounded-2xl border border-slate-800/80 shadow-sm overflow-hidden">
                      <div className="px-6 py-3.5 bg-[#141C32] border-b border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <CalendarIcon className="w-4 h-4 text-[#7C3AED]" />
                          <span className="text-xs font-bold text-white">{formattedDate}</span>
                          <span className="text-xs text-slate-400">({dateStr})</span>
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                          {sessions.length} sessions • {Math.round(sessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60 * 10) / 10}h planned
                        </span>
                      </div>

                      <div className="p-4 space-y-3">
                        {sessions.map(session => {
                          const subject = subjects.find(s => s.id === session.subject_id);
                          const isEditing = editingSessionId === session.id;

                          return (
                            <div 
                              key={session.id}
                              className={`p-4 rounded-xl border transition-all ${
                                session.is_revision 
                                  ? 'bg-[#201538] border-[#7C3AED]/40' 
                                  : 'bg-[#141C32] border-slate-800/80 hover:border-slate-700/80'
                              }`}
                            >
                              {!isEditing ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <div 
                                      className="w-3 h-3 rounded-full mt-1.5 shrink-0" 
                                      style={{ backgroundColor: subject?.color || '#7C3AED' }}
                                    />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="text-xs font-bold text-white">{session.title}</h5>
                                        {session.is_revision && (
                                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30">
                                            Pre-Exam Revision
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1">{session.notes}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 self-end sm:self-center shrink-0">
                                    <div className="text-right">
                                      <span className="text-xs font-bold text-white block">
                                        {session.start_time} – {session.end_time}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        {session.duration_minutes} mins
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleStartEditSession(session)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-slate-800/80 transition-colors cursor-pointer"
                                        title="Edit date/time"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleRemoveProposedSession(session.id)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#F472B6] hover:bg-slate-800/80 transition-colors cursor-pointer"
                                        title="Remove session"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="text-xs font-bold text-white">Edit Proposed Session</div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-[11px] text-slate-400 block mb-1">Date</label>
                                      <input
                                        type="date"
                                        value={editFormData.session_date}
                                        onChange={e => setEditFormData({ ...editFormData, session_date: e.target.value })}
                                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#111728] text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] text-slate-400 block mb-1">Start Time</label>
                                      <input
                                        type="time"
                                        value={editFormData.start_time}
                                        onChange={e => setEditFormData({ ...editFormData, start_time: e.target.value })}
                                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#111728] text-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[11px] text-slate-400 block mb-1">Duration (mins)</label>
                                      <input
                                        type="number"
                                        step="15"
                                        min="30"
                                        max="180"
                                        value={editFormData.duration_minutes}
                                        onChange={e => setEditFormData({ ...editFormData, duration_minutes: parseInt(e.target.value, 10) || 60 })}
                                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700/80 bg-[#111728] text-white"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingSessionId(null)}
                                      className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveEditSession(session.id)}
                                      className="px-4 py-1 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg cursor-pointer"
                                    >
                                      Update
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CURRENT ACTIVE SCHEDULE SUMMARY */}
          {!proposedPlan && (
            <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white glow-title">Current Scheduled Study Sessions</h4>
                  <p className="text-xs text-slate-400">
                    Live database sessions synced across your calendar and daily task tracking.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 px-3 py-1 rounded-full">
                  {studySessions.filter(s => s.status === 'Planned').length} Upcoming Planned
                </span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {studySessions
                  .filter(s => s.status !== 'Cancelled')
                  .slice(0, 6)
                  .map(session => {
                    const subject = subjects.find(s => s.id === session.subject_id);

                    return (
                      <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full shrink-0" 
                            style={{ backgroundColor: subject?.color || '#7C3AED' }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">{session.title}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                session.status === 'Completed'
                                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                                  : session.status === 'Missed'
                                  ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40'
                                  : 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30'
                              }`}>
                                {session.status}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {session.session_date} • {session.start_time}–{session.end_time} ({session.duration_minutes}m)
                            </span>
                          </div>
                        </div>

                        <div className="text-right text-xs font-semibold text-slate-300">
                          {subject?.name}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRIORITY SCORECARD */}
      {activePlannerTab === 'priorities' && (
        <div className="space-y-6">
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="max-w-2xl space-y-1">
              <h3 className="text-base font-bold text-white glow-title">5-Factor Subject Priority Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Priorities are recalculated automatically based on: 
                <strong className="text-slate-200"> 1) Closer exam dates</strong>, 
                <strong className="text-slate-200"> 2) Lower progress</strong>, 
                <strong className="text-slate-200"> 3) Hard difficulty</strong>, 
                <strong className="text-slate-200"> 4) Remaining syllabus hours</strong>, and 
                <strong className="text-slate-200"> 5) Deficit against weekly study targets</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectPriorities.map(sp => {
              return (
                <div 
                  key={sp.subject_id}
                  className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl text-white font-black text-sm flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: sp.color }}
                      >
                        #{sp.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{sp.subject_name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sp.difficulty === 'Hard'
                              ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40'
                              : sp.difficulty === 'Medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                          }`}>
                            {sp.difficulty} (x{sp.score_factors.difficulty_multiplier})
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {sp.exam_date 
                            ? `Exam on ${sp.exam_date} (${sp.days_to_exam} days remaining)`
                            : 'No exam date assigned'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-white glow-stat-purple">{sp.priority_score}</div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-300">Knowledge Progress</span>
                      <span className="text-white">{sp.current_progress}% / Target {sp.target_percentage}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#18223C] rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${sp.current_progress}%`, 
                          backgroundColor: sp.color 
                        }}
                      />
                    </div>
                  </div>

                  {/* 5-factor breakdown matrix */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div className="p-2.5 rounded-lg bg-[#141C32] border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Exam Urgency</span>
                      <strong className="text-white font-bold">+{sp.score_factors.exam_urgency_score} pts</strong>
                      <span className="text-[10px] text-slate-400 block">
                        {sp.days_to_exam !== null ? `${sp.days_to_exam}d until test` : 'No test'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141C32] border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Progress Deficit</span>
                      <strong className="text-white font-bold">+{sp.score_factors.progress_gap_score} pts</strong>
                      <span className="text-[10px] text-slate-400 block">
                        Gap: {Math.max(0, sp.target_percentage - sp.current_progress)}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141C32] border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Remaining Syllabus</span>
                      <strong className="text-white font-bold">+{sp.score_factors.syllabus_load_score} pts</strong>
                      <span className="text-[10px] text-slate-400 block">
                        {sp.remaining_syllabus_hours}h estimated
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141C32] border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block font-medium">Weekly Target Deficit</span>
                      <strong className="text-white font-bold">+{sp.score_factors.weekly_deficit_score} pts</strong>
                      <span className="text-[10px] text-slate-400 block">
                        {sp.weekly_deficit_hours}h behind target
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WHAT-IF SIMULATION ENGINE */}
      {activePlannerTab === 'what-if' && (
        <div className="space-y-6">
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="max-w-2xl space-y-1">
              <h3 className="text-base font-bold text-white glow-title">What-If Schedule Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test hypothetical academic events or capacity changes non-destructively. See projected syllabus completion dates, overload risks, and simulated timetables before applying.
              </p>
            </div>
          </div>

          {/* Scenario selector cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scenarios.map(sc => (
              <button
                key={sc.id}
                onClick={() => handleRunSimulation(sc.id)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedScenarioId === sc.id
                    ? 'border-[#7C3AED] bg-[#7C3AED]/15 shadow-sm ring-2 ring-[#7C3AED]/30'
                    : 'border-slate-800/80 bg-[#111728] hover:border-slate-700/80'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30 flex items-center justify-center font-bold text-xs mb-3">
                  <Zap className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-white leading-snug mb-1">{sc.name}</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">{sc.description}</p>
              </button>
            ))}
          </div>

          {/* Simulation Output Comparison */}
          {simulationResult && (
            <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30">
                    Simulation Active
                  </span>
                  <h4 className="text-lg font-bold text-white mt-1">
                    {simulationResult.scenario_name}
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulationResult(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 rounded-xl cursor-pointer"
                  >
                    Clear Simulation
                  </button>
                </div>
              </div>

              {/* Metric Delta Comparison Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#141C32] border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Weekly Target Hours</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                      {simulationResult.simulated_metrics.weekly_hours}h
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      {simulationResult.current_metrics.weekly_hours}h
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141C32] border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Planned Sessions</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-white">
                      {simulationResult.simulated_metrics.total_planned_sessions}
                    </span>
                    <span className="text-xs text-slate-500">
                      (current: {simulationResult.current_metrics.total_planned_sessions})
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141C32] border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Projected Syllabus Finish</span>
                  <div className="text-sm font-bold text-[#2DD4BF]">
                    {simulationResult.simulated_metrics.syllabus_completion_date}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141C32] border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1">Cognitive Overload Risk</span>
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    simulationResult.simulated_metrics.overload_risk === 'High'
                      ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/40'
                      : simulationResult.simulated_metrics.overload_risk === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40'
                  }`}>
                    {simulationResult.simulated_metrics.overload_risk} Risk
                  </span>
                </div>
              </div>

              {/* Impact statements */}
              <div className="p-4 rounded-xl bg-[#141C32] border border-[#7C3AED]/30 space-y-2">
                <div className="text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                  <span>AI Algorithmic Impact Summary</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  {simulationResult.impact_summary.map((statement, idx) => (
                    <li key={idx}>{statement}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CAPACITY & EXAM DATE ADJUSTMENTS */}
      {activePlannerTab === 'adjustments' && (
        <div className="space-y-6">
          <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
            <div className="max-w-2xl space-y-1">
              <h3 className="text-base font-bold text-white glow-title">Adaptive Rebalancing Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When exam dates or study capacity shift, StudyPlan AI immediately adjusts schedules without disturbing completed milestones or scheduling subjects past their exams.
              </p>
            </div>
          </div>

          {adjustmentMessage && (
            <div className="p-4 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-xs font-medium text-[#2DD4BF] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
              <span>{adjustmentMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Hours Adjustment Card */}
            <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Daily Study Capacity</h4>
                  <p className="text-xs text-slate-400">Adjust available focus hours per day</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Available Hours:</span>
                  <span className="text-[#2DD4BF] font-bold text-base">{adjustedDailyHours} Hours / day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={adjustedDailyHours}
                  onChange={e => setAdjustedDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-[#7C3AED] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 Hour (Light)</span>
                  <span>4 Hours (Standard)</span>
                  <span>8 Hours (Intensive)</span>
                </div>
              </div>

              <button
                onClick={handleApplyDailyHours}
                className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all cursor-pointer"
              >
                Apply Capacity &amp; Rebalance
              </button>
            </div>

            {/* Exam Date Shift Card */}
            <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30 flex items-center justify-center font-bold">
                  <CalendarRange className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Exam Date Rebalancing</h4>
                  <p className="text-xs text-slate-400">Advance or defer an upcoming exam</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Select Exam</label>
                  <select
                    value={selectedExamId}
                    onChange={e => {
                      setSelectedExamId(e.target.value);
                      const ex = exams.find(item => item.id === e.target.value);
                      if (ex) setNewExamDate(ex.exam_date);
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  >
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name} ({exam.exam_date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">New Exam Milestone Date</label>
                  <input
                    type="date"
                    value={newExamDate}
                    onChange={e => setNewExamDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyExamDate}
                className="w-full py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-all cursor-pointer"
              >
                Update Date &amp; Pull Study Sessions Ahead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
