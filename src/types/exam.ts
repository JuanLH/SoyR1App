export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  category?: string
}

export interface Exam {
  id: string
  title: string
  description: string
  duration: number // in minutes
  questions: Question[]
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  totalQuestions: number
}

export interface UserAnswer {
  questionId: string
  selectedAnswer: number | null
  isMarkedForReview: boolean
  timeSpent: number // in seconds
}

export interface ExamSession {
  examId: string
  startTime: Date
  endTime?: Date
  answers: UserAnswer[]
  timeRemaining: number // in seconds
  isCompleted: boolean
  currentQuestionIndex: number
}

export interface ExamResult {
  id: string
  examId: string
  examTitle: string
  score: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unansweredQuestions: number
  timeSpent: number // in seconds
  completedAt: Date
  answers: UserAnswer[]
  percentage: number
}

export interface ExamHistory {
  results: ExamResult[]
  totalExamsTaken: number
  averageScore: number
}