import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Exam, ExamResult } from './types/exam'
import { useLocalStorage } from './hooks/useLocalStorage'
import { isAuthenticated, logout, getSession } from './services/authService'
import ExamList from './components/ExamList'
import ExamRunner from './components/ExamRunner'
import ExamResults from './components/ExamResults'
import ExamHistory from './components/ExamHistory'
import Button from './components/Button'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import './App.css'

type AppView = 'landing' | 'login' | 'examList' | 'examInterface' | 'examResults' | 'examHistory'

function App() {
  const { t, i18n } = useTranslation()
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null)
  const [examHistory, setExamHistory] = useLocalStorage<ExamResult[]>('examHistory', [])
  const [sessionChecked, setSessionChecked] = useState(false)

  // ── Session guard — runs once on mount ──────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentView('examList')
    } else {
      setCurrentView('landing')
    }
    setSessionChecked(true)
  }, [])

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLoginSuccess = () => {
    setCurrentView('examList')
  }

  const handleLogout = () => {
    logout()
    setCurrentView('landing')
    setSelectedExam(null)
    setCurrentResult(null)
  }

  // ── Exam handlers ─────────────────────────────────────────────────────────────
  const handleStartExam = (exam: Exam) => {
    setSelectedExam(exam)
    setSelectedExamId(exam.id)
    setCurrentView('examInterface')
  }

  const handleExamComplete = (result: ExamResult) => {
    setCurrentResult(result)
    setExamHistory(prev => [result, ...prev])
    setCurrentView('examResults')
  }

  const handleRetakeExam = () => {
    if (selectedExam) setCurrentView('examInterface')
  }

  const handleBackToExams = () => {
    setSelectedExam(null)
    setSelectedExamId(null)
    setCurrentResult(null)
    setCurrentView('examList')
  }

  const handleViewHistory = () => setCurrentView('examHistory')

  const handleViewResult = (result: ExamResult) => {
    setCurrentResult(result)
    // Reconstruct a minimal Exam shell from the stored result so the
    // ExamResults view can render without needing the full exam in memory.
    setSelectedExam({
      id: result.examId,
      title: result.examTitle,
      description: '',
      duration: Math.ceil(result.timeSpent / 60),
      questions: [],
      category: '',
      difficulty: 'medium',
      totalQuestions: result.totalQuestions,
    })
    setCurrentView('examResults')
  }

  const handleExitExam = () => {
    if (window.confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
      handleBackToExams()
    }
  }

  // ── Render helpers ────────────────────────────────────────────────────────────
  const renderNavigation = () => {
    if (currentView === 'examInterface' || currentView === 'landing' || currentView === 'login') {
      return null
    }

    const session = getSession()

    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-bold text-gray-800">{t('app.title')}</h1>
              {session?.username && (
                <span className="ml-3 text-sm text-gray-500 hidden sm:inline">
                  {t('app.welcome')}, <span className="font-semibold text-gray-700">{session.username}</span>
                  {session.role && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize">
                      {session.role}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-3 items-center">
              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
              >
                {i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
              <Button
                onClick={handleBackToExams}
                variant={currentView === 'examList' ? 'primary' : 'secondary'}
                size="sm"
              >
                {t('app.exams')}
              </Button>
              <Button
                onClick={handleViewHistory}
                variant={currentView === 'examHistory' ? 'primary' : 'secondary'}
                size="sm"
              >
                {t('app.history')} ({examHistory.length})
              </Button>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
              >
                {t('app.logout')}
              </Button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const renderContent = () => {
    // Don't render anything until session check completes (avoids flash)
    if (!sessionChecked) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
        </div>
      )
    }

    if (currentView === 'landing') {
      return <LandingPage onNavigateToLogin={() => setCurrentView('login')} />
    }

    if (currentView === 'login') {
      return (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setCurrentView('landing')}
        />
      )
    }

    switch (currentView) {
      case 'examList':
        return <ExamList onStartExam={handleStartExam} />

      case 'examInterface':
        return selectedExamId ? (
          <ExamRunner
            examId={selectedExamId}
            onExamComplete={handleExamComplete}
            onExitExam={handleExitExam}
          />
        ) : null

      case 'examResults':
        return selectedExam && currentResult ? (
          <ExamResults
            result={currentResult}
            questions={selectedExam.questions}
            onRetakeExam={handleRetakeExam}
            onBackToExams={handleBackToExams}
          />
        ) : null

      case 'examHistory':
        return (
          <ExamHistory history={examHistory} onViewDetails={handleViewResult} onBackToExams={handleBackToExams} />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      <main>
        {renderContent()}
      </main>
    </div>
  )
}

export default App
