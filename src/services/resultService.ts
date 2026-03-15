import api from './api'
import { getCookie } from '../utils/cookies'
import { ExamSession, Question } from '../types/exam'

// ─── DTOs (mirror of the API's CreateResultDto / CreateResultAnswerDto) ────────

interface CreateResultPayload {
  userId: string
  examId: string
  startedAt: string
  completedAt: string
  timeSpentSecs: number
  totalQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  unanswered: number
  score: number
  percentage: number
  isCompleted: boolean
}

interface CreateAnswerPayload {
  questionId: string
  selectedAnswer: number | null  // 0-based (null when unanswered)
  isCorrect: boolean | null
  isMarkedForReview: boolean
  timeSpentSecs: number
}

interface ResultDto {
  id: string
}

// ─── JWT helper ────────────────────────────────────────────────────────────────

/**
 * Extracts the `sub` claim (userId) from the JWT stored in the auth_token cookie.
 * JWT payload is a standard Base64url-encoded JSON object — no library needed.
 */
function getUserIdFromToken(): string | null {
  const token = getCookie('auth_token')
  if (!token) return null

  try {
    const payloadBase64 = token.split('.')[1]
    // Base64url → Base64 → JSON
    const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    return payload.sub ?? null
  } catch {
    console.warn('[resultService] Could not decode JWT payload.')
    return null
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Persists an exam result and all per-question answers to the backend.
 *
 * Steps:
 *  1. POST /api/Results            → get back the server-assigned result id
 *  2. POST /api/Results/{id}/answers (one call per question, in parallel)
 *
 * Returns the server-assigned result id, or null if saving failed.
 */
export async function saveExamResult(
  session: ExamSession,
  questions: Question[],
  completedAt: Date,
  timeSpentSecs: number,
  correctAnswers: number,
  incorrectAnswers: number,
  unanswered: number,
  score: number,
  percentage: number,
): Promise<string | null> {
  const userId = getUserIdFromToken()
  if (!userId) {
    console.warn('[resultService] No userId available — result not saved.')
    return null
  }

  // 1. Create the result header
  const resultPayload: CreateResultPayload = {
    userId,
    examId: session.examId,
    startedAt: session.startTime.toISOString(),
    completedAt: completedAt.toISOString(),
    timeSpentSecs,
    totalQuestions: questions.length,
    correctAnswers,
    incorrectAnswers,
    unanswered,
    score,
    percentage,
    isCompleted: true,
  }

  const { data: created } = await api.post<ResultDto>('/api/Results', resultPayload)
  const resultId = created.id

  // 2. Save each answer in parallel
  const answerPayloads: CreateAnswerPayload[] = session.answers.map((answer, i) => {
    const correct =
      answer.selectedAnswer === null
        ? null
        : answer.selectedAnswer === questions[i].correctAnswer
    return {
      questionId: answer.questionId,
      selectedAnswer: answer.selectedAnswer,
      isCorrect: correct,
      isMarkedForReview: answer.isMarkedForReview,
      timeSpentSecs: answer.timeSpent,
    }
  })

  await Promise.all(
    answerPayloads.map(payload =>
      api.post(`/api/Results/${resultId}/answers`, payload)
    )
  )

  return resultId
}
