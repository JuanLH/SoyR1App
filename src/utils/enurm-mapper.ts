import { ENURMQuestion, ENURMExamData } from '../types/enurm'
import { Exam, Question } from '../types/exam'

/**
 * Maps ENURM difficulty level (1-5) to our app's difficulty system
 */
const mapDifficulty = (dificultad: number): 'easy' | 'medium' | 'hard' => {
  if (dificultad <= 2) return 'easy'
  if (dificultad <= 3) return 'medium'
  return 'hard'
}

/**
 * Converts a single ENURM question to our app's Question format
 */
export const mapENURMQuestion = (enurmQuestion: ENURMQuestion): Question => {
  // Build options array, filtering out empty options
  const options = [
    enurmQuestion.Opcion1,
    enurmQuestion.Opcion2,
    enurmQuestion.Opcion3,
    enurmQuestion.Opcion4,
    enurmQuestion.Opcion5
  ].filter(option => option && option.trim() !== '')

  // Convert ENURM's 1-based index to our 0-based index
  const correctAnswer = Math.max(0, enurmQuestion.Correcta - 1)

  // Build question text with image support
  let questionText = enurmQuestion.Enunciado
  if (enurmQuestion.ImagenNombre && enurmQuestion.ImagenNombre.trim() !== '') {
    questionText += `\n\n[Image: ${enurmQuestion.ImagenNombre}]`
  }

  return {
    id: enurmQuestion.PreguntaId,
    question: questionText,
    options: options,
    correctAnswer: correctAnswer,
    explanation: enurmQuestion.Comentario || undefined,
    category: `${enurmQuestion.Tema}${enurmQuestion.Subtema ? ` - ${enurmQuestion.Subtema}` : ''}`
  }
}

/**
 * Groups ENURM questions by subject and creates exams
 */
export const createExamsFromENURMData = (
  enurmData: ENURMQuestion[],
  options: {
    questionsPerExam?: number
    examDuration?: number // minutes
    groupBy?: 'asignatura' | 'tema' | 'convocatoria'
  } = {}
): Exam[] => {
  const {
    questionsPerExam = 50,
    examDuration = 90,
    groupBy = 'asignatura'
  } = options

  // Group questions by the specified criteria
  const groupedQuestions = enurmData.reduce((groups, question) => {
    let groupKey: string
    
    switch (groupBy) {
      case 'tema':
        groupKey = `${question.Asignatura} - ${question.Tema}`
        break
      case 'convocatoria':
        groupKey = `${question.Convocatoria}`
        break
      default: // 'asignatura'
        groupKey = question.Asignatura
        break
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(question)
    return groups
  }, {} as Record<string, ENURMQuestion[]>)

  // Create exams from grouped questions
  const exams: Exam[] = []

  Object.entries(groupedQuestions).forEach(([groupName, questions]) => {
    // Sort questions by number for consistent ordering
    const sortedQuestions = questions.sort((a, b) => a.Numero - b.Numero)
    
    // Split into chunks if there are too many questions
    const chunks = []
    for (let i = 0; i < sortedQuestions.length; i += questionsPerExam) {
      chunks.push(sortedQuestions.slice(i, i + questionsPerExam))
    }

    chunks.forEach((chunk, index) => {
      const mappedQuestions = chunk.map(mapENURMQuestion)
      
      // Calculate average difficulty
      const avgDifficulty = chunk.reduce((sum, q) => sum + q.Dificultad, 0) / chunk.length
      const difficulty = mapDifficulty(Math.round(avgDifficulty))

      // Get sample question for metadata
      const sampleQuestion = chunk[0]
      
      const examTitle = chunks.length > 1 
        ? `${groupName} - Part ${index + 1}`
        : groupName

      const exam: Exam = {
        id: `enurm-${groupName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${index + 1}`,
        title: examTitle,
        description: `ENURM exam for ${groupName}. ${chunk.length} questions covering ${sampleQuestion.Tema}${sampleQuestion.Subtema ? ` - ${sampleQuestion.Subtema}` : ''}.`,
        duration: examDuration,
        questions: mappedQuestions,
        category: sampleQuestion.Asignatura,
        difficulty: difficulty,
        totalQuestions: mappedQuestions.length
      }

      exams.push(exam)
    })
  })

  return exams
}

/**
 * Creates a single exam from ENURM questions with custom filtering
 */
export const createCustomENURMExam = (
  enurmData: ENURMQuestion[],
  filters: {
    asignatura?: string
    tema?: string
    subtema?: string
    convocatoria?: string
    anualidad?: number
    dificultad?: number[]
    limit?: number
  },
  examConfig: {
    title: string
    description?: string
    duration?: number
  }
): Exam => {
  // Filter questions based on criteria
  let filteredQuestions = enurmData.filter(question => {
    if (filters.asignatura && question.Asignatura !== filters.asignatura) return false
    if (filters.tema && question.Tema !== filters.tema) return false
    if (filters.subtema && question.Subtema !== filters.subtema) return false
    if (filters.convocatoria && question.Convocatoria !== filters.convocatoria) return false
    if (filters.anualidad && question.Anualidad !== filters.anualidad) return false
    if (filters.dificultad && !filters.dificultad.includes(question.Dificultad)) return false
    return true
  })

  // Limit number of questions if specified
  if (filters.limit && filteredQuestions.length > filters.limit) {
    filteredQuestions = filteredQuestions.slice(0, filters.limit)
  }

  // Map to our question format
  const mappedQuestions = filteredQuestions.map(mapENURMQuestion)

  // Calculate difficulty
  const avgDifficulty = filteredQuestions.reduce((sum, q) => sum + q.Dificultad, 0) / filteredQuestions.length
  const difficulty = mapDifficulty(Math.round(avgDifficulty))

  // Get category from first question
  const category = filteredQuestions[0]?.Asignatura || 'ENURM'

  return {
    id: `custom-enurm-${Date.now()}`,
    title: examConfig.title,
    description: examConfig.description || `Custom ENURM exam with ${mappedQuestions.length} questions.`,
    duration: examConfig.duration || 90,
    questions: mappedQuestions,
    category: category,
    difficulty: difficulty,
    totalQuestions: mappedQuestions.length
  }
}

/**
 * Utility function to get unique values for filtering
 */
export const getENURMFilterOptions = (enurmData: ENURMQuestion[]) => {
  return {
    asignaturas: [...new Set(enurmData.map(q => q.Asignatura))].sort(),
    temas: [...new Set(enurmData.map(q => q.Tema))].sort(),
    subtemas: [...new Set(enurmData.map(q => q.Subtema).filter(Boolean))].sort(),
    convocatorias: [...new Set(enurmData.map(q => q.Convocatoria))].sort(),
    anualidades: [...new Set(enurmData.map(q => q.Anualidad))].sort((a, b) => b - a),
    dificultades: [...new Set(enurmData.map(q => q.Dificultad))].sort()
  }
}