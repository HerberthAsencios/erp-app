import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css',
})
export class QuizComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly quiz = inject(QuizService);

  readonly elapsedDisplay = signal('00:00');

  private timerId: ReturnType<typeof setInterval> | null = null;
  private elapsed = 0;

  async ngOnInit(): Promise<void> {
    await this.quiz.loadQuestions();
    const slug = this.route.snapshot.paramMap.get('tema');
    if (!slug) {
      void this.router.navigate(['/']);
      return;
    }

    const qs = this.quiz.getQuestionsByTema(slug);
    if (qs.length === 0) {
      void this.router.navigate(['/']);
      return;
    }

    this.quiz.startQuiz(slug);
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  get questionNumber(): number {
    return this.quiz.currentIndex() + 1;
  }

  get totalQuestions(): number {
    return this.quiz.sessionQuestions().length;
  }

  get currentQuestionId(): string {
    return this.quiz.currentQuestion()?.id ?? '';
  }

  onSelect(letter: string): void {
    this.quiz.selectAnswer(letter);
  }

  onNext(): void {
    if (!this.quiz.canGoNext()) return;

    if (this.quiz.isLastQuestion()) {
      this.quiz.finishQuiz();
      this.stopTimer();
      void this.router.navigate(['/resultados']);
      return;
    }

    this.quiz.nextQuestion();
  }

  onFinishEarly(): void {
    this.quiz.finishQuiz();
    this.stopTimer();
    void this.router.navigate(['/resultados']);
  }

  private startTimer(): void {
    this.elapsed = 0;
    this.elapsedDisplay.set('00:00');
    this.quiz.setElapsedSeconds(0);
    this.timerId = setInterval(() => {
      this.elapsed++;
      this.quiz.setElapsedSeconds(this.elapsed);
      const m = Math.floor(this.elapsed / 60);
      const s = this.elapsed % 60;
      this.elapsedDisplay.set(
        `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
