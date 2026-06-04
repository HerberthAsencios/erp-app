import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Question,
  QuizAnswer,
  QuizSession,
  TemaInfo,
} from '../models/quiz.model';
import { temaToSlug } from '../utils/slug.util';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly http = inject(HttpClient);

  readonly allQuestions = signal<Question[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly sessionQuestions = signal<Question[]>([]);
  readonly currentIndex = signal(0);
  readonly answers = signal<QuizAnswer[]>([]);
  readonly sessionTema = signal<{ slug: string; nombre: string } | null>(null);
  readonly sessionStartedAt = signal<number | null>(null);
  readonly elapsedSeconds = signal(0);
  readonly quizFinished = signal(false);
  readonly selectedLetter = signal<string | null>(null);
  readonly showFeedback = signal(false);

  readonly temas = computed<TemaInfo[]>(() => {
    const map = new Map<string, TemaInfo>();
    for (const q of this.allQuestions()) {
      const slug = q.temaSlug;
      const existing = map.get(slug);
      if (existing) {
        existing.cantidad++;
      } else {
        map.set(slug, {
          slug,
          nombre: q.tema,
          grupo: q.grupo,
          cantidad: 1,
        });
      }
    }
    return [...map.values()].sort((a, b) => a.grupo - b.grupo || a.nombre.localeCompare(b.nombre));
  });

  readonly currentQuestion = computed(() => {
    const qs = this.sessionQuestions();
    const idx = this.currentIndex();
    return qs.length > 0 && idx < qs.length ? qs[idx] : null;
  });

  readonly progressPercent = computed(() => {
    const total = this.sessionQuestions().length;
    if (total === 0) return 0;
    return Math.round((this.currentIndex() / total) * 100);
  });

  readonly score = computed(() => {
    const a = this.answers();
    const correct = a.filter((x) => x.correct).length;
    return { correct, total: a.length };
  });

  readonly scorePercent = computed(() => {
    const { correct, total } = this.score();
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
  });

  async loadQuestions(): Promise<void> {
    if (this.allQuestions().length > 0) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const data = await firstValueFrom(
        this.http.get<Question[]>('/assets/data/questions.json')
      );
      const normalized = data.map((q) => ({
        ...q,
        temaSlug: q.temaSlug || temaToSlug(q.tema),
        correcta: q.correcta.toUpperCase(),
      }));
      this.allQuestions.set(normalized);
    } catch {
      this.loadError.set('No se pudieron cargar las preguntas.');
    } finally {
      this.loading.set(false);
    }
  }

  getQuestionsByTema(slug: string): Question[] {
    return this.allQuestions()
      .filter((q) => q.temaSlug === slug)
      .sort((a, b) => a.id.localeCompare(b.id, 'es', { numeric: true }));
  }

  getTemaNombre(slug: string): string {
    return this.temas().find((t) => t.slug === slug)?.nombre ?? slug;
  }

  startQuiz(temaSlug: string, shuffle = false): void {
    let qs = [...this.getQuestionsByTema(temaSlug)];
    if (qs.length === 0) return;

    if (shuffle) {
      qs = this.shuffleArray(qs);
    }

    this.sessionQuestions.set(qs);
    this.currentIndex.set(0);
    this.answers.set([]);
    this.sessionTema.set({
      slug: temaSlug,
      nombre: this.getTemaNombre(temaSlug),
    });
    this.sessionStartedAt.set(Date.now());
    this.elapsedSeconds.set(0);
    this.quizFinished.set(false);
    this.selectedLetter.set(null);
    this.showFeedback.set(false);
  }

  selectAnswer(letter: string): QuizAnswer | null {
    if (this.quizFinished()) return null;
    if (this.showFeedback()) return null;

    const question = this.currentQuestion();
    if (!question) return null;

    const already = this.answers().some((a) => a.questionId === question.id);
    if (already) return null;

    const selected = letter.toUpperCase();
    const correct = selected === question.correcta;
    const entry: QuizAnswer = {
      questionId: question.id,
      selected,
      correct,
    };
    this.answers.update((list) => [...list, entry]);
    this.selectedLetter.set(selected);
    this.showFeedback.set(true);
    return entry;
  }

  hasAnsweredCurrent(): boolean {
    const q = this.currentQuestion();
    if (!q) return false;
    return this.answers().some((a) => a.questionId === q.id);
  }

  getCurrentAnswer(): QuizAnswer | undefined {
    const q = this.currentQuestion();
    if (!q) return undefined;
    return this.answers().find((a) => a.questionId === q.id);
  }

  canGoNext(): boolean {
    return this.hasAnsweredCurrent();
  }

  isLastQuestion(): boolean {
    return this.currentIndex() >= this.sessionQuestions().length - 1;
  }

  nextQuestion(): boolean {
    if (!this.canGoNext()) return false;
    if (this.isLastQuestion()) {
      this.finishQuiz();
      return false;
    }
    this.selectedLetter.set(null);
    this.showFeedback.set(false);
    this.currentIndex.update((i) => i + 1);
    return true;
  }

  isOptionSelected(letter: string): boolean {
    const sel = this.selectedLetter();
    return sel !== null && sel === letter.toUpperCase();
  }

  isOptionCorrect(letter: string): boolean {
    const q = this.currentQuestion();
    return !!q && letter.toUpperCase() === q.correcta;
  }

  finishQuiz(): void {
    this.quizFinished.set(true);
  }

  setElapsedSeconds(seconds: number): void {
    this.elapsedSeconds.set(seconds);
  }

  buildSession(): QuizSession | null {
    const tema = this.sessionTema();
    const started = this.sessionStartedAt();
    if (!tema || started === null) return null;

    return {
      temaSlug: tema.slug,
      temaNombre: tema.nombre,
      answers: this.answers(),
      startedAt: started,
      finishedAt: Date.now(),
      elapsedSeconds: this.elapsedSeconds(),
    };
  }

  getQuestionById(id: string): Question | undefined {
    return this.sessionQuestions().find((q) => q.id === id);
  }

  resetSession(): void {
    this.sessionQuestions.set([]);
    this.currentIndex.set(0);
    this.answers.set([]);
    this.sessionTema.set(null);
    this.sessionStartedAt.set(null);
    this.elapsedSeconds.set(0);
    this.quizFinished.set(false);
    this.selectedLetter.set(null);
    this.showFeedback.set(false);
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
