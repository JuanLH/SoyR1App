import { useState } from 'react'
import { Exam, ExamResult, Question } from './types/exam'
import { useLocalStorage } from './hooks/useLocalStorage'
import { sampleExams } from './data/sampleExams'
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
    const exam = sampleExams.find(e => e.id === result.examId)
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
    switch (currentView) {
      case 'examList':
        return (
          <ExamList
            exams={sampleExams}
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