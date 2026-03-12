// ─── API Models (backend response shapes) ────────────────────────────────────

/** Matches the shape returned by GET /api/Exams */
export interface ExamDto {
  id: string
  title: string
  description: string | null
  callName: string
  year: number
  category: string | null
  subject: string | null
  difficulty: 'easy' | 'medium' | 'hard'
  durationMins: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

/** Matches the question shape returned by GET /api/Exams/{id}/detail */
export interface QuestionDto {
  id: string
  examId: string
  number: number
  body: string           // → Question.question
  imageName: string | null
  option1: string
  option2: string
  option3: string
  option4: string
  option5: string | null
  correctOption: number  // 1-based → Question.correctAnswer (0-based)
  subject: string        // → Question.category
  topic: string
  subtopic: string
  difficulty: number
  hasVideo: boolean
  createdAt: string
}

/** Matches the shape returned by GET /api/Exams/{id}/detail */
export interface ExamDetailDto extends ExamDto {
  questions: QuestionDto[]
}

// ─── Local App Models ─────────────────────────────────────────────────────────

export interface Question {
  id: string
  number?: number        // question number within exam
  question: string       // mapped from QuestionDto.body
  options: string[]      // built from option1–option5 (non-null)
  correctAnswer: number  // 0-based (QuestionDto.correctOption - 1)
  explanation?: string
  category?: string      // mapped from QuestionDto.subject
  topic?: string
  subtopic?: string
  imageName?: string | null
  hasVideo?: boolean
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
  /** Full question list — embedded so Detailed Results works after localStorage rehydration */
  questions?: Question[]
}

export interface ExamHistory {
  results: ExamResult[]
  totalExamsTaken: number
  averageScore: number
}