import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'note/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/note-editor/note-editor.component').then(m => m.NoteEditorComponent)
  },
  {
    path: 'note/:id/flashcards',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/flashcards/flashcards.component').then(m => m.FlashcardsComponent)
  },
  {
    path: 'note/:id/quiz',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
