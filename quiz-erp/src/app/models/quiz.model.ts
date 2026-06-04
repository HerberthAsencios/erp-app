export interface Opcion {
  letra: string;
  texto: string;
}

export interface Question {
  id: string;
  grupo: number;
  tema: string;
  temaSlug: string;
  enunciado: string;
  opciones: Opcion[];
  correcta: string;
  explicacion?: string;
}

export interface TemaInfo {
  slug: string;
  nombre: string;
  grupo: number;
  cantidad: number;
}

export interface QuizAnswer {
  questionId: string;
  selected: string;
  correct: boolean;
}

export interface QuizSession {
  temaSlug: string;
  temaNombre: string;
  answers: QuizAnswer[];
  startedAt: number;
  finishedAt?: number;
  elapsedSeconds: number;
}
