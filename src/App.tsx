import { useState, useEffect } from 'react'
import { Exam, ExamResult, Question } from './types/exam'
import { useLocalStorage } from './hooks/useLocalStorage'
import { sampleExams } from './data/sampleExams'
import { enurmQuestions } from './data/enurmExams'
import { createExamsFromENURMData } from './utils/enurm-mapper'
import ExamList from './components/ExamList'
import ExamInterface from './components/ExamInterface'
import ExamResults from './components/ExamResults'
import ExamHistory from './components/ExamHistory'
import Button from './components/Button'
import './App.css'

type AppView = 'examList' | 'examInterface' | 'examResults' | 'examHistory'

function App() {
  const [currentView, setCurrentView] = useState<AppView>('examList')
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [currentResult, setCurrentResult] = useState<ExamResult | null>(null)
  const [examHistory, setExamHistory] = useLocalStorage<ExamResult[]>('examHistory', [])
  const [availableExams, setAvailableExams] = useState<Exam[]>([])
  const [isLoadingExams, setIsLoadingExams] = useState(true)

  // Load ENURM exams on app startup
  useEffect(() => {
    const loadExams = async () => {
      try {
        // Generate exams from ENURM data
        const enurmExamsBySubject = createExamsFromENURMData(enurmQuestions, {
          groupBy: 'convocatoria'
        })

        const enurmExamsByTopic = createExamsFromENURMData(enurmQuestions)

        // Combine sample exams with ENURM exams
        const allExams = [
          ...sampleExams,
          ...enurmExamsBySubject,
          ...enurmExamsByTopic
        ]

        setAvailableExams(allExams)
      } catch (error) {
        console.error('Error loading ENURM exams:', error)
        // Fallback to sample exams only
        setAvailableExams(sampleExams)
      } finally {
        setIsLoadingExams(false)
      }
    }

    loadExams()
  }, [])

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
    if (selectedExam) {
      setCurrentView('examInterface')
    }
  }

  const handleBackToExams = () => {
    setSelectedExam(null)
    setCurrentResult(null)
    setCurrentView('examList')
  }

  const handleViewHistory = () => {
    setCurrentView('examHistory')
  }

  const handleViewResult = (result: ExamResult) => {
    setCurrentResult(result)
    // Find the exam for this result
    const exam = availableExams.find(e => e.id === result.examId)
    if (exam) {
      setSelectedExam(exam)
    }
    setCurrentView('examResults')
  }


  const handleExitExam = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit the exam? Your progress will be lost.'
    )
    if (confirmExit) {
      handleBackToExams()
    }
  }

  const renderNavigation = () => {
    if (currentView === 'examInterface') {
      return null // Navigation is handled within ExamInterface
    }

    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-bold text-gray-800">Exam Study App</h1>
            </div>
            <div className="flex space-x-4">
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
            </div>
          </div>
        </div>
      </nav>
    )
  }

  const renderContent = () => {
    if (isLoadingExams) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Loading ENURM Exams...</h2>
            <p className="text-gray-500">Preparing your exam content</p>
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'examList':
        return (
          <ExamList
            exams={availableExams}
            onStartExam={handleStartExam}
          />
        )

      case 'examInterface':
        return selectedExam ? (
          <ExamInterface
            exam={selectedExam}
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
          <ExamHistory
            results={examHistory}
            onViewResult={handleViewResult}
            onBackToExams={handleBackToExams}
          />
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