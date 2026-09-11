import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Calendar, 
  Target, 
  Clock, 
  ListTree,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, DifficultyLevel } from '../types';
import { SubjectModal } from '../components/subjects/SubjectModal';
import { ActiveTab } from '../components/layout/Sidebar';

interface SubjectsViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ setActiveTab }) => {
  const { subjects, deleteSubject, getSubjectProgress, topics } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const filteredSubjects = subjects.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const handleEdit = (sub: Subject) => {
    setSubjectToEdit(sub);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSubjectToEdit(null);
    setIsModalOpen(true);
  };

  const calculateDaysLeft = (examDateStr?: string) => {
    if (!examDateStr) return null;
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111728] p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subjects (e.g. DSA, Python)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subjects */}
      {filteredSubjects.length === 0 ? (
        <div className="bg-[#111728] rounded-2xl border border-slate-800/80 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No subjects found</h4>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or add a new subject.</p>
          <button
            onClick={handleCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold cursor-pointer"
          >
            Add Subject Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSubjects.map((sub) => {
            const calculatedProgress = getSubjectProgress(sub.id);
            const subTopics = topics.filter(t => t.subject_id === sub.id);
            const daysLeft = calculateDaysLeft(sub.exam_date);
            const isUrgent = daysLeft !== null && daysLeft <= 7;

            return (
              <div
                key={sub.id}
                className="bg-[#111728] rounded-2xl border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Subject top bar with color accent */}
                <div className="h-2 w-full" style={{ backgroundColor: sub.color }} />

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm"
                          style={{ backgroundColor: sub.color }}
                        >
                          {sub.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-base">{sub.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.difficulty === 'Hard' ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/30' :
                              sub.difficulty === 'Medium' ? 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30' : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                            }`}>
                              {sub.difficulty}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{subTopics.length} topics</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleEdit(sub)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-slate-800/60 transition-colors cursor-pointer"
                        title="Edit subject"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Knowledge & Syllabus Progress */}
                    <div className="mt-5 space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-semibold text-slate-300">Syllabus Progress</span>
                          <span className="font-extrabold text-white">{calculatedProgress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#18223C] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${calculatedProgress}%`, backgroundColor: sub.color }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-xl bg-[#141C32] border border-slate-800/80">
                          <span className="text-[11px] text-slate-400 block font-medium">Current Level</span>
                          <span className="text-sm font-bold text-slate-200">{sub.current_knowledge_percentage}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#141C32] border border-slate-800/80">
                          <span className="text-[11px] text-slate-400 block font-medium">Target Score</span>
                          <span className="text-sm font-bold text-[#2DD4BF]">{sub.target_percentage}%</span>
                        </div>
                      </div>

                      {/* Meta badges: Weekly target & Exam countdown */}
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.weekly_study_target_hours}h / week</span>
                        </div>

                        {daysLeft !== null && (
                          <div className={`flex items-center gap-1 font-bold ${
                            isUrgent ? 'text-[#F472B6]' : 'text-slate-300'
                          }`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{daysLeft === 0 ? 'Exam Today!' : `${daysLeft}d left`}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Link to Syllabus */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <button
                      onClick={() => setActiveTab('syllabus')}
                      className="text-xs font-bold text-[#7C3AED] hover:text-[#9F67FF] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Syllabus Topics</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleEdit(sub)}
                      className="text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Subject */}
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        subjectToEdit={subjectToEdit}
      />
    </div>
  );
};
