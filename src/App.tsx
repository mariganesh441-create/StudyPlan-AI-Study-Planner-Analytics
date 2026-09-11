import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { QuickStudySessionModal } from './components/dashboard/QuickStudySessionModal';
import { SubjectModal } from './components/subjects/SubjectModal';
import { RescheduleBanner } from './components/planner/RescheduleBanner';

// Views
import { DashboardView } from './views/DashboardView';
import { SubjectsView } from './views/SubjectsView';
import { SyllabusView } from './views/SyllabusView';
import { ExamsView } from './views/ExamsView';
import { GoalsView } from './views/GoalsView';
import { AIStudyPlannerView } from './views/AIStudyPlannerView';
import { AnalyticsView } from './views/AnalyticsView';
import { CalendarView } from './views/CalendarView';
import { DailyTasksView } from './views/DailyTasksView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { EvaluationDossierView } from './views/EvaluationDossierView';

const MainLayout: React.FC = () => {
  const { user, profile } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isQuickSessionOpen, setIsQuickSessionOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenQuickSession={() => setIsQuickSessionOpen(true)}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          />
        );
      case 'evaluation':
        return <EvaluationDossierView />;
      case 'subjects':
        return <SubjectsView setActiveTab={setActiveTab} />;
      case 'syllabus':
        return <SyllabusView />;
      case 'exams':
        return <ExamsView />;
      case 'goals':
        return <GoalsView />;
      case 'ai-planner':
        return <AIStudyPlannerView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
      case 'daily-tasks':
        return <DailyTasksView />;
      case 'reports':
      case 'weekly-reports':
      case 'monthly-reports':
        return <ReportsView />;
      case 'notifications':
        return <NotificationsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenQuickSession={() => setIsQuickSessionOpen(true)}
            onOpenAddSubject={() => setIsAddSubjectOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0B1020] text-slate-100 font-sans antialiased overflow-hidden selection:bg-[#7C3AED] selection:text-white">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0B1020]">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          onOpenQuickSession={() => setIsQuickSessionOpen(true)}
          onOpenAddSubject={() => setIsAddSubjectOpen(true)}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#0B1020]">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onFinish={() => {
          setIsOnboardingOpen(false);
          setActiveTab('dashboard');
        }}
      />

      <QuickStudySessionModal
        isOpen={isQuickSessionOpen}
        onClose={() => setIsQuickSessionOpen(false)}
      />

      <SubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
      />

      {/* Persistent AI Reschedule Notification Banner */}
      <RescheduleBanner />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
