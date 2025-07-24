import React from 'react'
import Button from './Button'

interface NavigationProps {
  currentView: string
  examHistoryCount: number
  onNavigateToExams: () => void
  onNavigateToHistory: () => void
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  examHistoryCount,
  onNavigateToExams,
  onNavigateToHistory,
}) => {
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
              onClick={onNavigateToExams}
              variant={currentView === 'examList' ? 'primary' : 'secondary'}
              size="sm"
            >
              Exams
            </Button>
            <Button
              onClick={onNavigateToHistory}
              variant={currentView === 'examHistory' ? 'primary' : 'secondary'}
              size="sm"
            >
              History ({examHistoryCount})
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation