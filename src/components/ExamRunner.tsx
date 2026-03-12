import React, { useState, useEffect } from 'react'
import { Exam, Question, ExamResult, QuestionDto, ExamDetailDto } from '../types/exam'
import { getExamDetail } from '../services/examService'
import { getCookie } from '../utils/cookies'
import ExamInterface from './ExamInterface'

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ExamRunnerProps {
    /** The exam ID to load — comes from ExamList via App.tsx */
    examId: string
    onExamComplete: (result: ExamResult) => void
    onExitExam: () => void
}

// ─── Adapter ───────────────────────────────────────────────────────────────────

/** Converts a QuestionDto (API/English fields) to the local Question model. */
function adaptQuestion(dto: QuestionDto): Question {
    const options: string[] = [dto.option1, dto.option2, dto.option3, dto.option4]
    if (dto.option5) options.push(dto.option5)

    return {
        id: dto.id,
        number: dto.number,
        question: dto.body,
        options,
        correctAnswer: dto.correctOption - 1, // API is 1-based; ExamInterface expects 0-based
        category: dto.subject,
        topic: dto.topic,
        subtopic: dto.subtopic,
        imageName: dto.imageName,
        hasVideo: dto.hasVideo,
    }
}

/** Converts an ExamDetailDto to the local Exam model. */
function adaptDetail(dto: ExamDetailDto): Exam {
    return {
        id: dto.id,
        title: dto.title,
        description: dto.description ?? '',
        duration: dto.durationMins,
        questions: dto.questions.map(adaptQuestion),
        category: dto.category ?? dto.subject ?? '',
        difficulty: dto.difficulty,
        totalQuestions: dto.questions.length,
    }
}

// ─── Component ─────────────────────────────────────────────────────────────────

const ExamRunner: React.FC<ExamRunnerProps> = ({ examId, onExamComplete, onExitExam }) => {
    const [exam, setExam] = useState<Exam | null>(null)
    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // ── Auth guard ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const token = getCookie('auth_token')
        if (!token) {
            window.location.href = '/'
            return
        }

        let cancelled = false

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const detail = await getExamDetail(examId)
                if (!cancelled) setExam(adaptDetail(detail))
            } catch (err: unknown) {
                if (cancelled) return

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const status = (err as any)?.response?.status
                if (status === 401) {
                    window.location.href = '/'
                    return
                }
                const msg =
                    err instanceof Error
                        ? err.message
                        : 'Failed to load exam. Please try again.'
                setError(msg)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => { cancelled = true }
    }, [examId])

    // ── Loading ──────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mb-5" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-1">Loading Exam…</h2>
                    <p className="text-gray-500">Fetching questions from the server</p>
                </div>
            </div>
        )
    }

    // ── Error ────────────────────────────────────────────────────────────────────
    if (error || !exam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Could not load exam</h2>
                    <p className="text-gray-500 mb-6">{error ?? 'Unknown error occurred.'}</p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => {
                                setError(null)
                                setLoading(true)
                                setExam(null)
                                // remount effect by toggling state; easiest is page reload scoped to exam
                                getExamDetail(examId)
                                    .then((d) => { setExam(adaptDetail(d)); setLoading(false) })
                                    .catch((e) => {
                                        setError(e instanceof Error ? e.message : 'Retry failed.')
                                        setLoading(false)
                                    })
                            }}
                            className="px-5 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={onExitExam}
                            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Back to Exams
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ── Success — delegate to ExamInterface ──────────────────────────────────────
    // Wrap onExamComplete to embed the questions array into the result so that
    // ExamResults' Detailed Results view can access them (including after retake).
    const handleExamComplete = (result: ExamResult) => {
        onExamComplete({ ...result, questions: exam.questions })
    }

    return (
        <ExamInterface
            exam={exam}
            onExamComplete={handleExamComplete}
            onExitExam={onExitExam}
        />
    )
}

export default ExamRunner
