import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ExamResult } from '../types/exam'
import Button from './Button'

interface ExamHistoryProps {
  history: ExamResult[] // Changed from results
  onViewDetails: (result: ExamResult) => void // Changed from onViewResult
  onBackToExams: () => void
}

type SortField = 'date' | 'score' | 'title'
type SortDirection = 'asc' | 'desc'

const ExamHistory: React.FC<ExamHistoryProps> = ({
  history, // Changed from results
  onViewDetails, // Changed from onViewResult
  onBackToExams,
}) => {
  const { t } = useTranslation()
  const [sortField, setSortField] = useState<SortField>('date') // Changed from sortBy
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc') // Changed from sortOrder

  const sortedResults = useMemo(() => {
    return [...history].sort((a, b) => { // Changed from results
      let comparison = 0

      switch (sortField) { // Changed from sortBy
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

      return sortDirection === 'asc' ? comparison : -comparison // Changed from sortOrder
    })
  }, [history, sortField, sortDirection]) // Added history, sortField, sortDirection as dependencies

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
    if (history.length === 0) return null // Changed from results.length

    const totalScore = history.reduce((sum, result) => sum + result.percentage, 0) // Changed from results
    const averageScore = Math.round(totalScore / history.length) // Changed from results.length
    const bestScore = Math.max(...history.map(r => r.percentage)) // Changed from results.map
    const totalTimeSpent = history.reduce((sum, result) => sum + result.timeSpent, 0) // Changed from results

    return {
      totalExams: history.length, // Changed from results.length
      averageScore,
      bestScore,
      totalTimeSpent
    }
  }

  const stats = calculateStats()

  // handleSort function removed as the select element now directly controls sortField and sortDirection

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('examHistory.title')}</h1>
          <p className="text-gray-600">{t('examHistory.subtitle')}</p>
        </div>
        <button
          onClick={onBackToExams}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('examHistory.back')}
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('examHistory.stats.exams')}</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalExams}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('examHistory.stats.average')}</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                {stats.averageScore}%
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('examHistory.stats.best')}</p>
              <p className={`text-2xl font-bold ${getScoreColor(stats.bestScore)}`}>
                {stats.bestScore}%
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{t('examHistory.stats.time')}</p>
              <p className="text-2xl font-bold text-gray-800">
                {formatTime(stats.totalTimeSpent)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {history.length > 0 ? ( // Changed from results.length
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">{t('examHistory.table.title')}</h2>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [SortField, SortDirection]
                  setSortField(field)
                  setSortDirection(direction)
                }}
                className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              >
                <option value="date-desc">{t('examHistory.table.sort.dateDesc')}</option>
                <option value="date-asc">{t('examHistory.table.sort.dateAsc')}</option>
                <option value="score-desc">{t('examHistory.table.sort.scoreDesc')}</option>
                <option value="score-asc">{t('examHistory.table.sort.scoreAsc')}</option>
                <option value="title-asc">{t('examHistory.table.sort.titleAsc')}</option>
                <option value="title-desc">{t('examHistory.table.sort.titleDesc')}</option>
              </select>
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
                            {new Date(result.completedAt).toLocaleDateString()} at{' '}
                            {new Date(result.completedAt).toLocaleTimeString()}
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
                      {result.percentage >= 80 ? t('examHistory.badge.excellent') :
                        result.percentage >= 70 ? t('examHistory.badge.good') :
                          result.percentage >= 60 ? t('examHistory.badge.average') : t('examHistory.badge.poor')}
                    </span>

                    <Button
                      onClick={() => onViewDetails(result)} // Changed from onViewResult
                      variant="secondary"
                      size="sm"
                    >
                      {t('examHistory.table.viewDetails')}
                    </Button>
                  </div>
                </div>

                {/* Progress indicators */}
                <div className="mt-3 flex space-x-4 text-xs text-gray-500">
                  <span>{t('examHistory.table.correct', { count: result.correctAnswers })}</span>
                  <span>{t('examHistory.table.incorrect', { count: result.incorrectAnswers })}</span>
                  {result.unansweredQuestions > 0 && (
                    <span>{t('examHistory.table.unanswered', { count: result.unansweredQuestions })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t('examHistory.empty.title')}</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {t('examHistory.empty.subtitle')}
          </p>
          <button
            onClick={onBackToExams}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
          >
            {t('examHistory.empty.start')}
          </button>
        </div>
      )}
    </div>
  )
}

export default ExamHistory