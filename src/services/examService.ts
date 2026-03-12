import api from './api'
import { ExamDto, ExamDetailDto } from '../types/exam'

/**
 * Fetches the list of published exams from the backend.
 * The axios instance in api.ts automatically attaches the JWT from the
 * `auth_token` cookie and redirects on 401.
 */
export async function fetchExams(): Promise<ExamDto[]> {
    const response = await api.get<ExamDto[]>('/api/Exams', {
        params: { publishedOnly: true },
    })
    return response.data
}

/**
 * Fetches full exam detail (metadata + questions list) for a given exam.
 * Endpoint: GET /api/Exams/{examId}/detail
 */
export async function getExamDetail(examId: string): Promise<ExamDetailDto> {
    const response = await api.get<ExamDetailDto>(`/api/Exams/${examId}/detail`)
    return response.data
}
