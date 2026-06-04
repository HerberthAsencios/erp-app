import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ResultsComponent } from './pages/results/results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quiz/:tema', component: QuizComponent },
  { path: 'resultados', component: ResultsComponent },
  { path: '**', redirectTo: '' },
];
