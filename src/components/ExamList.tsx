import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ExamDto, Exam } from '../types/exam'
import { fetchExams } from '../services/examService'
import { getCookie } from '../utils/cookies'
import ExamCard from './ExamCard'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExamListProps {
  /** Called when the user clicks "Start" on an exam card */
  onStartExam: (exam: Exam) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const ExamList: React.FC<ExamListProps> = ({ onStartExam }) => {
  const { t } = useTranslation()
  // ── State ──────────────────────────────────────────────────────────────────
  const [exams, setExams] = useState<ExamDto[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearch] = useState('')

  // ── Auth guard ─────────────────────────────────────────────────────────────
  // If there is no token in the cookie, redirect to login.
  // (useNavigate requires react-router-dom; if the project doesn't use it yet
  //  we fall back to window.location — see comment below.)
  const token = getCookie('auth_token')

  useEffect(() => {
    if (!token) {
      // Fallback redirect — works without react-router-dom
      window.location.href = '/'
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchExams()
        if (!cancelled) setExams(data)
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : t('examList.errorTitle')
          setError(msg)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [token])

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return exams
    const q = searchTerm.toLowerCase().trim()
    return exams.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.category ?? '').toLowerCase().includes(q) ||
        (e.subject ?? '').toLowerCase().includes(q),
    )
  }, [exams, searchTerm])

  // ── Adapt ExamDto → Exam for the exam card / interface ────────────────────
  // ExamCard still expects the local Exam shape (with questions array, etc.).
  // We create a minimal adapter so ExamList can call onStartExam later.
  const adaptDto = (dto: ExamDto): Exam => ({
    id: dto.id,
    title: dto.title,
    description: dto.description ?? '',
    duration: dto.durationMins,
    questions: [],           // populated later when exam detail is fetched
    category: dto.category ?? dto.subject ?? '',
    difficulty: dto.difficulty,
    totalQuestions: 0,            // will be filled by the detail endpoint
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-1">{t('examList.loading')}</h2>
          <p className="text-gray-500">{t('examList.loadingDesc')}</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('examList.errorTitle')}</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {t('examList.retry')}
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('examList.title')}</h1>
        <p className="text-gray-600">{t('examList.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t('examList.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dto) => (
          <ExamCard
            key={dto.id}
            exam={adaptDto(dto)}
            onStartExam={onStartExam}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            {searchTerm.trim() ? '🔍' : '📚'}
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {searchTerm.trim() ? t('examList.noResultsTitle') : t('examList.noExamsTitle')}
          </h3>
          <p className="text-gray-500">
            {searchTerm.trim()
              ? t('examList.noResultsDesc')
              : t('examList.noExamsDesc')}
          </p>
          {searchTerm.trim() && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {t('examList.clearSearch')}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default ExamList