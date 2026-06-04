import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  readonly quiz = inject(QuizService);

  ngOnInit(): void {
    void this.quiz.loadQuestions();
  }
}
