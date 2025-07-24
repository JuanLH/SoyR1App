import React, { useState, useEffect } from 'react'
import { Exam, ExamSession, UserAnswer, ExamResult } from '../types/exam'
import { useTimer } from '../hooks/useTimer'
import Button from './Button'

interface ExamInterfaceProps {
  exam: Exam
  onExamComplete: (result: ExamResult) => void
  onExitExam: () => void
}

const ExamInterface: React.FC<ExamInterfaceProps> = ({
  exam,
  onExamComplete,
  onExitExam,
}) => {
  const [session, setSession] = useState<ExamSession>({
    examId: exam.id,
    startTime: new Date(),
    answers: exam.questions.map(q => ({
      questionId: q.id,
      selectedAnswer: null,
      isMarkedForReview: false,
      timeSpent: 0
    })),
    timeRemaining: exam.duration * 60,
    isCompleted: false,
    currentQuestionIndex: 0
  })

  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  const { timeRemaining, formatTime, isTimeUp } = useTimer({
    initialTime: exam.duration * 60,
    onTimeUp: handleTimeUp,
    autoStart: true
  })

  function handleTimeUp() {
    completeExam()
  }

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [session.currentQuestionIndex])

  const updateQuestionTime = () => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000)
    setSession(prev => ({
      ...prev,
      answers: prev.answers.map((answer, index) =>
        index === prev.currentQuestionIndex
          ? { ...answer, timeSpent: answer.timeSpent + timeSpent }
          : answer
      )
    }))
  }

  const handleAnswerSelect = (answerIndex: number) => {
    updateQuestionTime()
    setSession(prev => ({
      ...prev,
      answers: prev.answers.map((answer, index) =>
        index === prev.currentQuestionIndex
          ? { ...answer, selectedAnswer: answerIndex }
          : answer
      )
    }))
    setQuestionStartTime(Date.now())
  }

  const toggleMarkForReview = () => {
    setSession(prev => ({
      ...prev,
      answers: prev.answers.map((answer, index) =>
        index === prev.currentQuestionIndex
          ? { ...answer, isMarkedForReview: !answer.isMarkedForReview }
          : answer
      )
    }))
  }

  const navigateToQuestion = (questionIndex: number) => {
    updateQuestionTime()
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: questionIndex
    }))
  }

  const nextQuestion = () => {
    if (session.currentQuestionIndex < exam.questions.length - 1) {
      navigateToQuestion(session.currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (session.currentQuestionIndex > 0) {
      navigateToQuestion(session.currentQuestionIndex - 1)
    }
  }

  const completeExam = () => {
    updateQuestionTime()
    
    const correctAnswers = session.answers.filter(
      (answer, index) => answer.selectedAnswer === exam.questions[index].correctAnswer
    ).length

    const result: ExamResult = {
      id: `result-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      score: correctAnswers,
      totalQuestions: exam.questions.length,
      correctAnswers,
      incorrectAnswers: session.answers.filter(
        (answer, index) => 
          answer.selectedAnswer !== null && 
          answer.selectedAnswer !== exam.questions[index].correctAnswer
      ).length,
      unansweredQuestions: session.answers.filter(answer => answer.selectedAnswer === null).length,
      timeSpent: (exam.duration * 60) - timeRemaining,
      completedAt: new Date(),
      answers: session.answers,
      percentage: Math.round((correctAnswers / exam.questions.length) * 100)
    }

    onExamComplete(result)
  }

  const currentQuestion = exam.questions[session.currentQuestionIndex]
  const currentAnswer = session.answers[session.currentQuestionIndex]

  const answeredCount = session.answers.filter(a => a.selectedAnswer !== null).length
  const markedCount = session.answers.filter(a => a.isMarkedForReview).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{exam.title}</h1>
              <p className="text-sm text-gray-600">
                Question {session.currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-mono font-bold text-gray-800">
                  {formatTime}
                </div>
                <div className="text-xs text-gray-500">Time Remaining</div>
              </div>
              <Button variant="secondary" onClick={onExitExam}>
                Exit Exam
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Panel */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-medium text-gray-800">
                  Question {session.currentQuestionIndex + 1}
                </h2>
                <button
                  onClick={toggleMarkForReview}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentAnswer.isMarkedForReview
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {currentAnswer.isMarkedForReview ? '★ Marked' : '☆ Mark for Review'}
                </button>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {currentQuestion.question}
              </p>
              {currentQuestion.category && (
                <div className="mt-2 inline-block">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-md">
                    {currentQuestion.category}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentAnswer.selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={index}
                      checked={currentAnswer.selectedAnswer === index}
                      onChange={() => handleAnswerSelect(index)}
                      className="mr-3 h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">{option}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={previousQuestion}
                disabled={session.currentQuestionIndex === 0}
                variant="secondary"
              >
                Previous
              </Button>
              <div className="flex space-x-3">
                {session.currentQuestionIndex === exam.questions.length - 1 ? (
                  <Button onClick={completeExam} variant="primary">
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} variant="primary">
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question Navigator */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
            <h3 className="font-medium text-gray-800 mb-4">Question Navigator</h3>
            
            <div className="mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span>Answered:</span>
                <span className="font-medium">{answeredCount}/{exam.questions.length}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Marked:</span>
                <span className="font-medium">{markedCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((_, index) => {
                const answer = session.answers[index]
                let bgColor = 'bg-gray-200'
                
                if (answer.selectedAnswer !== null) {
                  bgColor = 'bg-green-500 text-white'
                } else if (answer.isMarkedForReview) {
                  bgColor = 'bg-yellow-500 text-white'
                }
                
                if (index === session.currentQuestionIndex) {
                  bgColor += ' ring-2 ring-blue-500'
                }

                return (
                  <button
                    key={index}
                    onClick={() => navigateToQuestion(index)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-all ${bgColor}`}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>

            <div className="mt-4 text-xs text-gray-500">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                Answered
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                Marked for Review
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded mr-2"></div>
                Not Answered
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamInterface