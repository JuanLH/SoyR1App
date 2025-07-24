// ENURM Exam Data Types
export interface ENURMQuestion {
  PreguntaId: string; // GUID
  Convocatoria: string;
  Anualidad: number; // year
  Numero: number; // int
  ImagenNombre: string; // base64
  Dificultad: number; // int
  Enunciado: string;
  Opcion1: string;
  Opcion2: string;
  Opcion3: string;
  Opcion4: string;
  Opcion5: string;
  Comentario: string;
  Correcta: number; // int (1-5)
  Asignatura: string;
  Tema: string;
  Subtema: string;
  TieneVideo: boolean;
}

export interface ENURMExamData {
  questions: ENURMQuestion[];
  metadata?: {
    convocatoria: string;
    anualidad: number;
    asignatura: string;
  };
}