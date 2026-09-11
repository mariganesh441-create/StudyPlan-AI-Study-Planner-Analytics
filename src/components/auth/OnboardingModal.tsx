import React, { useState } from 'react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Clock, 
  Target, 
  School,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DifficultyLevel, StudyPeriod } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { profile, completeOnboarding } = useApp();

  const [step, setStep] = useState(1);

  // Form state across 8 steps
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [college, setCollege] = useState(profile?.college || 'Apex Institute of Technology');
  const [course, setCourse] = useState(profile?.course || 'B.Tech in Computer Science');
  const [semester, setSemester] = useState(profile?.semester || 'Semester 5');
  
  // Initial subjects list
  const [subjectsList, setSubjectsList] = useState<Array<{
    name: string;
    difficulty: DifficultyLevel;
    examDate: string;
    targetPercentage: number;
    color: string;
  }>>([
    { name: 'DSA', difficulty: 'Hard', examDate: '2026-09-15', targetPercentage: 90, color: '#EF4444' },
    { name: 'Python', difficulty: 'Easy', examDate: '2026-10-02', targetPercentage: 95, color: '#3B82F6' },
    { name: 'DBMS', difficulty: 'Medium', examDate: '2026-09-28', targetPercentage: 88, color: '#10B981' },
  ]);

  const [newSubName, setNewSubName] = useState('');
  const [newSubDiff, setNewSubDiff] = useState<DifficultyLevel>('Medium');
  const [newSubDate, setNewSubDate] = useState('');

  const [dailyHours, setDailyHours] = useState(profile?.daily_available_hours || 4);
  const [startTime, setStartTime] = useState(profile?.preferred_study_start_time || '18:00');
  const [endTime, setEndTime] = useState(profile?.preferred_study_end_time || '22:00');
  const [studyPeriod, setStudyPeriod] = useState<StudyPeriod>(profile?.preferred_study_period || 'Evening');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(profile?.weekly_study_target_hours || 24);

  if (!isOpen) return null;

  const handleAddSubject = () => {
    if (!newSubName.trim()) return;
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
    setSubjectsList(prev => [
      ...prev,
      {
        name: newSubName.trim(),
        difficulty: newSubDiff,
        examDate: newSubDate,
        targetPercentage: 90,
        color: colors[prev.length % colors.length],
      }
    ]);
    setNewSubName('');
    setNewSubDate('');
  };

  const handleRemoveSubject = (index: number) => {
    setSubjectsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinish = async () => {
    await completeOnboarding({
      full_name: fullName,
      college,
      course,
      semester,
      daily_available_hours: Number(dailyHours),
      preferred_study_start_time: startTime,
      preferred_study_end_time: endTime,
      preferred_study_period: studyPeriod,
      weekly_study_target_hours: Number(weeklyTargetHours),
    }, subjectsList);
    onClose();
  };

  const stepsList = [
    { title: 'Student Name', desc: 'Personal details' },
    { title: 'College & Course', desc: 'Academic institution' },
    { title: 'Semester', desc: 'Current term' },
    { title: 'Subjects', desc: 'Courses enrolled' },
    { title: 'Exam Dates', desc: 'Upcoming tests' },
    { title: 'Daily Hours', desc: 'Available time' },
    { title: 'Study Routine', desc: 'Preferred window' },
    { title: 'Weekly Goal', desc: 'Study target' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header with Step Progress */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base tracking-tight">Personalized Study Setup</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white">
              Step {step} of 8
            </span>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(step / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* STEP 1: Student Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">What is your full name?</h3>
                <p className="text-xs text-slate-600">Your name will personalize your study analytics and reports.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 2: College & Course */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">College & Degree Program</h3>
                <p className="text-xs text-slate-600">Help the AI tailor recommendations for your academic curriculum.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">College / University</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Apex Institute of Technology"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Major</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="e.g. B.Tech in Computer Science"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Semester */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Which semester are you in?</h3>
                <p className="text-xs text-slate-600">Select your current academic period.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSemester(sem)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium text-left border transition-all ${
                      semester === sem 
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Add Subjects */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Add Your Subjects</h3>
                <p className="text-xs text-slate-600">Enter the subjects you are taking this semester.</p>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Data Structures (DSA)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                />
                <select
                  value={newSubDiff}
                  onChange={(e) => setNewSubDiff(e.target.value as DifficultyLevel)}
                  aria-label="Subject difficulty level"
                  className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {subjectsList.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="font-semibold text-slate-900">{sub.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-600">
                        {sub.difficulty}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(i)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Add Exam Dates */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Set Exam Dates</h3>
                <p className="text-xs text-slate-600">The AI uses exam proximity to automatically prioritize urgent topics.</p>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {subjectsList.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                      <span className="text-sm font-semibold text-slate-900">{sub.name}</span>
                    </div>
                    <input
                      type="date"
                      value={sub.examDate}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSubjectsList(prev => prev.map((s, idx) => idx === i ? { ...s, examDate: newDate } : s));
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Daily Available Study Hours */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Daily Study Capacity</h3>
                <p className="text-xs text-slate-600">How many hours can you realistically commit to self-study each day?</p>
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Target Hours / Day</span>
                  <span className="text-2xl font-black text-indigo-600">{dailyHours} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  {[2, 4, 6, 8].map(h => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDailyHours(h)}
                      className={`p-2 rounded-lg border ${
                        dailyHours === h ? 'bg-indigo-50 border-indigo-500 font-bold text-indigo-700' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {h} hrs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Preferred Study Time */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Preferred Study Routine</h3>
                <p className="text-xs text-slate-600">When is your focus and cognitive retention at its highest?</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { period: 'Morning', label: 'Morning (06:00 - 12:00)', desc: 'Fresh & quiet start' },
                  { period: 'Afternoon', label: 'Afternoon (12:00 - 17:00)', desc: 'Post-lecture focus' },
                  { period: 'Evening', label: 'Evening (18:00 - 22:00)', desc: 'Deep work & assignments' },
                  { period: 'Night', label: 'Night (22:00 - 02:00)', desc: 'Night owl productivity' },
                ].map(p => (
                  <button
                    key={p.period}
                    type="button"
                    onClick={() => {
                      setStudyPeriod(p.period as StudyPeriod);
                      if (p.period === 'Morning') { setStartTime('07:00'); setEndTime('11:00'); }
                      if (p.period === 'Evening') { setStartTime('18:00'); setEndTime('22:00'); }
                      if (p.period === 'Night') { setStartTime('22:00'); setEndTime('02:00'); }
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      studyPeriod === p.period 
                        ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-600' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">{p.label}</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Weekly Study Target */}
          {step === 8 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Set Weekly Study Target</h3>
                <p className="text-xs text-slate-600">Your North Star study hours for maintaining consistency and exam readiness.</p>
              </div>

              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-indigo-900">Recommended based on {dailyHours}h/day:</p>
                  <p className="text-xs text-indigo-700">~{dailyHours * 6} hours per 6-day academic cycle</p>
                </div>
                <span className="text-2xl font-black text-indigo-700">{weeklyTargetHours}h / wk</span>
              </div>

              <div className="space-y-3 pt-1">
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="1"
                  value={weeklyTargetHours}
                  onChange={(e) => setWeeklyTargetHours(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Light (15h)</span>
                  <span>Moderate (24h)</span>
                  <span>Intense (35h+)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 8 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Launch My Study Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
