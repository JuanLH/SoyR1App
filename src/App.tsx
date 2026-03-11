import { useState, useEffect } from 'react'
import { Exam, ExamResult } from './types/exam'
import { useLocalStorage } from './hooks/useLocalStorage'
import { sampleExams } from './data/sampleExams'
import { enurmQuestions } from './data/enurmExams'
import { createExamsFromENURMData } from './utils/enurm-mapper'
import { isAuthenticated, logout, getSession } from './services/authService'
import ExamList from './components/ExamList'
import ExamInterface from './components/ExamInterface'
import ExamResults from './components/ExamResults'
import ExamHistory from './components/ExamHistory'
import Button from './components/Button'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import './App.css'

type AppView = 'landing' | 'login' | 'examList' | 'examInterface' | 'examResults' | 'examHistory'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing')
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null)
  const [examHistory, setExamHistory] = useLocalStorage<ExamResult[]>('examHistory', [])
  const [availableExams, setAvailableExams] = useState<Exam[]>([])
  const [isLoadingExams, setIsLoadingExams] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)

  // ── Session guard — runs once on mount ──────────────────────────────────────
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentView('examList')
      loadExams()
    } else {
      setCurrentView('landing')
    }
    setSessionChecked(true)
  }, [])

  // ── Exam loading ─────────────────────────────────────────────────────────────
  const loadExams = async () => {
    setIsLoadingExams(true)
    try {
      const enurmExamsBySubject = createExamsFromENURMData(enurmQuestions, { groupBy: 'convocatoria' })
      const enurmExamsByTopic = createExamsFromENURMData(enurmQuestions)
      setAvailableExams([...sampleExams, ...enurmExamsBySubject, ...enurmExamsByTopic])
    } catch (error) {
      console.error('Error loading ENURM exams:', error)
      setAvailableExams(sampleExams)
    } finally {
      setIsLoadingExams(false)
    }
  }

  // ── Auth handlers ────────────────────────────────────────────────────────────
  const handleLoginSuccess = () => {
    setCurrentView('examList')
    loadExams()
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
    setCurrentResult(null)
    setCurrentView('examList')
  }

  const handleViewHistory = () => setCurrentView('examHistory')

  const handleViewResult = (result: ExamResult) => {
    setCurrentResult(result)
    const exam = availableExams.find(e => e.id === result.examId)
    if (exam) setSelectedExam(exam)
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
              <h1 className="text-xl font-bold text-gray-800">Exam Study App</h1>
              {session?.username && (
                <span className="ml-3 text-sm text-gray-500 hidden sm:inline">
                  Welcome, <span className="font-semibold text-gray-700">{session.username}</span>
                  {session.role && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-medium capitalize">
                      {session.role}
                    </span>
                  )}
                </span>
              )}
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleBackToExams}
                variant={currentView === 'examList' ? 'primary' : 'secondary'}
                size="sm"
              >
                Exams
              </Button>
              <Button
                onClick={handleViewHistory}
                variant={currentView === 'examHistory' ? 'primary' : 'secondary'}
                size="sm"
              >
                History ({examHistory.length})
              </Button>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
              >
                Logout
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

    if (isLoadingExams) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading ENURM Exams…</h2>
            <p className="text-gray-500">Preparing your exam content</p>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'examList':
        return <ExamList exams={availableExams} onStartExam={handleStartExam} />

      case 'examInterface':
        return selectedExam ? (
          <ExamInterface exam={selectedExam} onExamComplete={handleExamComplete} onExitExam={handleExitExam} />
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
          <ExamHistory results={examHistory} onViewResult={handleViewResult} onBackToExams={handleBackToExams} />
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
