import React, { useState } from 'react'
import { ExamResult, Question } from '../types/exam'
import Button from './Button'

interface ExamResultsProps {
  result: ExamResult
  questions: Question[]
  onRetakeExam: () => void
  onBackToExams: () => void
}

const ExamResults: React.FC<ExamResultsProps> = ({
  result,
  questions,
  onRetakeExam,
  onBackToExams,
}) => {
  const [showDetailedResults, setShowDetailedResults] = useState(false)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-100'
    if (percentage >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const getAnswerStatus = (questionIndex: number) => {
    const userAnswer = result.answers[questionIndex]
    const question = questions[questionIndex]
    
    if (userAnswer.selectedAnswer === null) {
      return { status: 'unanswered', color: 'text-gray-500', bg: 'bg-gray-100' }
    }
    
    if (userAnswer.selectedAnswer === question.correctAnswer) {
      return { status: 'correct', color: 'text-green-600', bg: 'bg-green-100' }
    }
    
    return { status: 'incorrect', color: 'text-red-600', bg: 'bg-red-100' }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBgColor(result.percentage)} mb-4`}>
          <span className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
            {result.percentage}%
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Completed!</h1>
        <p className="text-gray-600">{result.examTitle}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{result.score}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{result.incorrectAnswers}</div>
          <div className="text-sm text-gray-600">Incorrect</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{result.unansweredQuestions}</div>
          <div className="text-sm text-gray-600">Unanswered</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{formatTime(result.timeSpent)}</div>
          <div className="text-sm text-gray-600">Time Spent</div>
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance Analysis</h2>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Score</span>
            <span>{result.score}/{result.totalQuestions} ({result.percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                result.percentage >= 80 ? 'bg-green-500' :
                result.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <strong>Completed on:</strong> {result.completedAt.toLocaleDateString()} at {result.completedAt.toLocaleTimeString()}
          </p>
          <p>
            <strong>Grade:</strong> {' '}
            <span className={getScoreColor(result.percentage)}>
              {result.percentage >= 80 ? 'Excellent' :
               result.percentage >= 70 ? 'Good' :
               result.percentage >= 60 ? 'Average' : 'Needs Improvement'}
            </span>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Button
          onClick={() => setShowDetailedResults(!showDetailedResults)}
          variant="secondary"
          className="flex-1"
        >
          {showDetailedResults ? 'Hide' : 'Show'} Detailed Results
        </Button>
        <Button onClick={onRetakeExam} variant="primary" className="flex-1">
          Retake Exam
        </Button>
        <Button onClick={onBackToExams} variant="secondary" className="flex-1">
          Back to Exams
        </Button>
      </div>

      {/* Detailed Results */}
      {showDetailedResults && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Detailed Results</h2>
          
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = result.answers[index]
              const answerStatus = getAnswerStatus(index)
              
              return (
                <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-gray-800">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {userAnswer.isMarkedForReview && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          Marked for Review
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${answerStatus.bg} ${answerStatus.color}`}>
                        {answerStatus.status.charAt(0).toUpperCase() + answerStatus.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{question.question}</p>
                  
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optionIndex) => {
                      const isCorrect = optionIndex === question.correctAnswer
                      const isUserAnswer = optionIndex === userAnswer.selectedAnswer
                      
                      let optionClass = 'p-3 rounded border '
                      if (isCorrect) {
                        optionClass += 'border-green-500 bg-green-50 text-green-800'
                      } else if (isUserAnswer && !isCorrect) {
                        optionClass += 'border-red-500 bg-red-50 text-red-800'
                      } else {
                        optionClass += 'border-gray-200 bg-gray-50'
                      }
                      
                      return (
                        <div key={optionIndex} className={optionClass}>
                          <div className="flex items-center">
                            {isCorrect && <span className="mr-2 text-green-600">✓</span>}
                            {isUserAnswer && !isCorrect && <span className="mr-2 text-red-600">✗</span>}
                            <span>{option}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {question.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <h4 className="font-medium text-blue-800 mb-1">Explanation:</h4>
                      <p className="text-blue-700 text-sm">{question.explanation}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Time spent: {formatTime(userAnswer.timeSpent)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamResults