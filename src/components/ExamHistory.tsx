import React, { useState } from 'react'
import { ExamResult } from '../types/exam'
import Button from './Button'

interface ExamHistoryProps {
  results: ExamResult[]
  onViewResult: (result: ExamResult) => void
  onBackToExams: () => void
}

const ExamHistory: React.FC<ExamHistoryProps> = ({
  results,
  onViewResult,
  onBackToExams,
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        break
      case 'score':
        comparison = a.percentage - b.percentage
        break
      case 'title':
        comparison = a.examTitle.localeCompare(b.examTitle)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100 text-green-800'
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const calculateStats = () => {
    if (results.length === 0) return null
    
    const totalScore = results.reduce((sum, result) => sum + result.percentage, 0)
    const averageScore = Math.round(totalScore / results.length)
    const bestScore = Math.max(...results.map(r => r.percentage))
    const totalTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0)
    
    return {
      totalExams: results.length,
      averageScore,
      bestScore,
      totalTimeSpent
    }
  }

  const stats = calculateStats()

  const handleSort = (newSortBy: 'date' | 'score' | 'title') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam History</h1>
          <p className="text-gray-600">Track your progress and review past results</p>
        </div>
        <Button onClick={onBackToExams} variant="secondary">
          Back to Exams
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalExams}</div>
            <div className="text-sm text-gray-600">Exams Taken</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>
              {stats.bestScore}%
            </div>
            <div className="text-sm text-gray-600">Best Score</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatTime(stats.totalTimeSpent)}
            </div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-800">Results</h2>
              <div className="flex space-x-2">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'score' | 'title', 'asc' | 'desc']
                    setSortBy(newSortBy)
                    setSortOrder(newSortOrder)
                  }}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="date-desc">Date (Newest)</option>
                  <option value="date-asc">Date (Oldest)</option>
                  <option value="score-desc">Score (Highest)</option>
                  <option value="score-asc">Score (Lowest)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="divide-y divide-gray-200">
            {sortedResults.map((result) => (
              <div key={result.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {result.examTitle}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500">
                            {result.completedAt.toLocaleDateString()} at{' '}
                            {result.completedAt.toLocaleTimeString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(result.timeSpent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(result.percentage)}`}>
                        {result.percentage}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {result.score}/{result.totalQuestions}
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(result.percentage)}`}>
                      {result.percentage >= 80 ? 'Excellent' :
                       result.percentage >= 70 ? 'Good' :
                       result.percentage >= 60 ? 'Average' : 'Poor'}
                    </span>
                    
                    <Button
                      onClick={() => onViewResult(result)}
                      variant="secondary"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                {/* Progress indicators */}
                <div className="mt-3 flex space-x-4 text-xs text-gray-500">
                  <span>✓ {result.correctAnswers} Correct</span>
                  <span>✗ {result.incorrectAnswers} Incorrect</span>
                  {result.unansweredQuestions > 0 && (
                    <span>○ {result.unansweredQuestions} Unanswered</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No exam history yet</h3>
          <p className="text-gray-500 mb-4">Take your first exam to see your results here</p>
          <Button onClick={onBackToExams} variant="primary">
            Start Your First Exam
          </Button>
        </div>
      )}
    </div>
  )
}

export default ExamHistory