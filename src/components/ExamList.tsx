import React from 'react'
import { Exam } from '../types/exam'
import Button from './Button'

interface ExamListProps {
  exams: Exam[]
  onStartExam: (exam: Exam) => void
}

const ExamList: React.FC<ExamListProps> = ({ exams, onStartExam }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Exams</h1>
        <p className="text-gray-600">Choose an exam to test your knowledge</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-gray-800 line-clamp-2">
                {exam.title}
              </h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                  exam.difficulty
                )}`}
              >
                {exam.difficulty.charAt(0).toUpperCase() + exam.difficulty.slice(1)}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {exam.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium text-gray-700">{exam.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions:</span>
                <span className="font-medium text-gray-700">{exam.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-700">{exam.duration} minutes</span>
              </div>
            </div>

            <Button
              onClick={() => onStartExam(exam)}
              className="w-full"
              variant="primary"
            >
              Start Exam
            </Button>
          </div>
        ))}
      </div>

      {exams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No exams available</h3>
          <p className="text-gray-500">Check back later for new exams</p>
        </div>
      )}
    </div>
  )
}

export default ExamList