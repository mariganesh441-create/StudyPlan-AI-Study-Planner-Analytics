import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { GoalModal } from '../components/goals/GoalModal';

export const GoalsView: React.FC = () => {
  const { goals, toggleGoalCompleted, updateGoal, deleteGoal, subjects } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredGoals = goals.filter(g => {
    return filterCategory === 'all' || g.category === filterCategory;
  });

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setGoalToEdit(null);
    setIsModalOpen(true);
  };

  const completedCount = goals.filter(g => g.is_completed).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Action */}
      <div className="bg-[#111728] p-5 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white glow-title">Academic Goals & Milestones</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] font-bold border border-[#7C3AED]/40">
              {completedCount}/{goals.length} Completed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Set ambitious study objectives, deadlines, and monitor completion percentages
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'Subject Mastery', 'Exam Prep', 'Daily Habit', 'Project'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filterCategory === cat
                ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                : 'bg-[#141C32] text-slate-300 hover:bg-[#1A233C] border border-slate-800/80'
            }`}
          >
            {cat === 'all' ? 'All Goals' : cat}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredGoals.map((goal) => {
          const subject = subjects.find(s => s.id === goal.subject_id);
          const isDone = goal.is_completed || goal.current_progress_percentage >= 100;

          return (
            <div
              key={goal.id}
              className={`bg-[#111728] rounded-2xl border p-5 sm:p-6 shadow-sm hover:border-slate-700/80 transition-all flex flex-col justify-between ${
                isDone ? 'border-[#2DD4BF]/40 bg-[#111728]' : 'border-slate-800/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleGoalCompleted(goal.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isDone 
                          ? 'bg-[#2DD4BF] border-[#2DD4BF] text-slate-950 shadow-sm' 
                          : 'border-slate-600 hover:border-[#7C3AED] bg-[#141C32]'
                      }`}
                      title={isDone ? 'Mark active' : 'Mark completed'}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E2945] text-[#2DD4BF] border border-slate-700/60">
                          {goal.category}
                        </span>
                        {subject && (
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-base font-bold mt-1.5 leading-snug ${
                        isDone ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete goal "${goal.title}"?`)) deleteGoal(goal.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#F472B6] hover:bg-slate-800/80 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Target Metric */}
                <div className="mt-4 p-3 rounded-xl bg-[#141C32] border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Target Metric:</span>
                  <span className="font-bold text-[#2DD4BF]">{goal.target_metric}</span>
                </div>

                {/* Progress bar and slider */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Progress</span>
                    <span className="font-black text-white glow-stat-purple">{goal.current_progress_percentage}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#18223C] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isDone ? 'bg-[#2DD4BF]' : 'bg-gradient-to-r from-[#6D28D9] to-[#7C3AED]'
                      }`}
                      style={{ width: `${goal.current_progress_percentage}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.current_progress_percentage}
                    onChange={(e) => updateGoal(goal.id, {
                      current_progress_percentage: parseInt(e.target.value),
                      is_completed: parseInt(e.target.value) >= 100,
                    })}
                    className="w-full accent-[#7C3AED] cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Deadline footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <span className={`font-bold ${isDone ? 'text-[#2DD4BF]' : 'text-slate-300'}`}>
                  {isDone ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  );
};
