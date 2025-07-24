import React, { useState, useMemo } from 'react'
import { Exam } from '../types/exam'
import ExamCard from './ExamCard'

interface ExamListProps {
  exams: Exam[]
  onStartExam: (exam: Exam) => void
}

const ExamList: React.FC<ExamListProps> = ({ exams, onStartExam }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter exams based on search term (title and category)
  const filteredExams = useMemo(() => {
    if (!searchTerm.trim()) {
      return exams
    }
    
    const searchLower = searchTerm.toLowerCase().trim()
    return exams.filter(exam => 
      exam.title.toLowerCase().includes(searchLower) ||
      exam.category.toLowerCase().includes(searchLower)
    )
  }, [exams, searchTerm])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Exams</h1>
        <p className="text-gray-600">Choose an exam to test your knowledge</p>
      </div>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => (
          <ExamCard
            key={exam.id}
            exam={exam}
            onStartExam={onStartExam}
          />
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            {searchTerm.trim() ? '🔍' : '📚'}
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {searchTerm.trim() ? 'No exams found' : 'No exams available'}
          </h3>
          <p className="text-gray-500">
            {searchTerm.trim() 
              ? 'Try adjusting your search terms or browse all available exams'
              : 'Check back later for new exams'
            }
          </p>
          {searchTerm.trim() && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExamList