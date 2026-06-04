import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [],
  templateUrl: './results.component.html',
  styleUrl: './results.component.css',
})
export class ResultsComponent implements OnInit {
  private readonly router = inject(Router);
  readonly quiz = inject(QuizService);

  ngOnInit(): void {
    if (this.quiz.answers().length === 0) {
      void this.router.navigate(['/']);
    }
  }

  get formattedTime(): string {
    const s = this.quiz.elapsedSeconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  getOptionText(questionId: string, letter: string): string {
    const q = this.quiz.getQuestionById(questionId);
    const opt = q?.opciones.find((o) => o.letra === letter);
    return opt ? `${opt.letra}) ${opt.texto}` : letter;
  }

  restartSameTema(): void {
    const slug = this.quiz.sessionTema()?.slug;
    if (slug) {
      this.quiz.startQuiz(slug);
      void this.router.navigate(['/quiz', slug]);
    }
  }

  goHome(): void {
    this.quiz.resetSession();
    void this.router.navigate(['/']);
  }
}
