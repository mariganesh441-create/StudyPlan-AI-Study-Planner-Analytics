import React, { useState } from 'react';
import { 
  ListTree, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Check,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Topic, TopicStatus, DifficultyLevel } from '../types';
import { TopicModal } from '../components/syllabus/TopicModal';

export const SyllabusView: React.FC = () => {
  const { 
    subjects, 
    topics, 
    toggleTopicStatus, 
    deleteTopic, 
    getSubjectProgress 
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // Filter topics
  const filteredTopics = topics.filter(t => {
    const matchesSub = selectedSubjectId === 'all' || t.subject_id === selectedSubjectId;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSub && matchesStatus && matchesSearch;
  }).sort((a, b) => a.order_index - b.order_index);

  // Progress calculations for active subject
  const currentSubjectTopics = selectedSubjectId === 'all' 
    ? topics 
    : topics.filter(t => t.subject_id === selectedSubjectId);

  const totalDuration = currentSubjectTopics.reduce((acc, t) => acc + (t.estimated_duration_hours || 1), 0);
  const completedDuration = currentSubjectTopics
    .filter(t => t.status === 'Completed')
    .reduce((acc, t) => acc + (t.estimated_duration_hours || 1), 0);

  const autoProgress = totalDuration > 0 ? Math.round((completedDuration / totalDuration) * 100) : 0;
  const completedCount = currentSubjectTopics.filter(t => t.status === 'Completed').length;
  const inProgressCount = currentSubjectTopics.filter(t => t.status === 'In Progress').length;
  const pendingCount = currentSubjectTopics.filter(t => t.status === 'Pending').length;

  const handleEdit = (topic: Topic) => {
    setTopicToEdit(topic);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setTopicToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Subject Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedSubjectId === 'all'
              ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
              : 'bg-[#141C32] text-slate-300 hover:bg-[#1A233C] border border-slate-800/80'
          }`}
        >
          All Subjects ({topics.length} Topics)
        </button>

        {subjects.map(sub => {
          const isSelected = selectedSubjectId === sub.id;
          const subProgress = getSubjectProgress(sub.id);
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-[#7C3AED]/30 glow-badge-purple'
                  : 'bg-[#141C32] text-slate-300 hover:bg-[#1A233C] border border-slate-800/80'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }} />
              <span>{sub.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-white/20 text-white' : 'bg-[#1E2945] text-slate-300'
              }`}>
                {subProgress}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress Calculation Card */}
      <div className="bg-[#111728] rounded-2xl p-6 border border-slate-800/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white glow-title">
                {activeSubject ? `${activeSubject.name} Syllabus Progress` : 'Total Curriculum Progress'}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#2DD4BF] font-bold border border-[#7C3AED]/40">
                Auto-calculated formula
              </span>
            </div>
            <p className="text-xs text-[#2DD4BF]/90 mt-1 font-mono">
              Subject Progress = (Completed: {completedDuration}h / Total: {totalDuration}h) × 100
            </p>
          </div>

          <div className="flex items-baseline gap-2 shrink-0">
            <span className="text-4xl font-black text-white glow-stat-purple">{autoProgress}%</span>
            <span className="text-xs text-slate-400 font-semibold">Mastered</span>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-3 w-full bg-[#18223C] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] rounded-full transition-all duration-500"
              style={{ width: `${autoProgress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-2.5 rounded-xl bg-[#141C32] border border-[#2DD4BF]/30">
            <span className="text-[11px] font-bold text-[#2DD4BF] uppercase block">Completed</span>
            <span className="text-base font-extrabold text-white">{completedCount} topics</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141C32] border border-[#7C3AED]/30">
            <span className="text-[11px] font-bold text-[#A78BFA] uppercase block">In Progress</span>
            <span className="text-base font-extrabold text-white">{inProgressCount} topics</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#141C32] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Pending</span>
            <span className="text-base font-extrabold text-slate-300">{pendingCount} topics</span>
          </div>
        </div>
      </div>

      {/* Action and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111728] p-4 rounded-2xl border border-slate-800/80 shadow-sm">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. Dynamic Programming, Trees)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-white placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-700/80 bg-[#141C32] text-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#7C3AED]/30 glow-badge-purple transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.length === 0 ? (
          <div className="bg-[#111728] rounded-2xl border border-slate-800/80 p-12 text-center">
            <ListTree className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white">No topics match filters</h4>
            <p className="text-xs text-slate-400 mt-1">Add topics to this subject syllabus to begin calculating progress.</p>
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold cursor-pointer"
            >
              Add First Topic
            </button>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const subject = subjects.find(s => s.id === topic.subject_id);

            return (
              <div
                key={topic.id}
                className="bg-[#111728] rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-sm hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => toggleTopicStatus(topic.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                      topic.status === 'Completed'
                        ? 'bg-[#2DD4BF] border-[#2DD4BF] text-slate-950 shadow-xs'
                        : topic.status === 'In Progress'
                        ? 'border-[#7C3AED] bg-[#7C3AED]/20 text-[#7C3AED]'
                        : 'border-slate-600 hover:border-[#7C3AED] bg-[#141C32]'
                    }`}
                    title="Click to cycle: Pending -> In Progress -> Completed"
                  >
                    {topic.status === 'Completed' && <Check className="w-4 h-4 stroke-[3]" />}
                    {topic.status === 'In Progress' && <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 font-mono">#{topic.order_index}</span>
                      <h4 className={`text-sm font-bold truncate ${
                        topic.status === 'Completed' ? 'text-slate-500 line-through' : 'text-white'
                      }`}>
                        {topic.name}
                      </h4>
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: subject?.color || '#7C3AED' }}
                      >
                        {subject?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        topic.difficulty === 'Hard' ? 'bg-[#F472B6]/20 text-[#F472B6] border border-[#F472B6]/30' :
                        topic.difficulty === 'Medium' ? 'bg-[#7C3AED]/20 text-[#2DD4BF] border border-[#7C3AED]/30' : 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30'
                      }`}>
                        {topic.difficulty}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{topic.estimated_duration_hours} hours</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                  <button
                    onClick={() => toggleTopicStatus(topic.id)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                      topic.status === 'Completed' ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30' :
                      topic.status === 'In Progress' ? 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {topic.status}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(topic)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#7C3AED] hover:bg-slate-800/60 transition-colors cursor-pointer"
                      title="Edit topic"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete topic "${topic.name}"?`)) deleteTopic(topic.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#F472B6] hover:bg-slate-800/60 transition-colors cursor-pointer"
                      title="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      <TopicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        topicToEdit={topicToEdit}
        defaultSubjectId={selectedSubjectId !== 'all' ? selectedSubjectId : undefined}
      />
    </div>
  );
};
