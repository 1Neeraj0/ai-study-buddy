import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <div class="logo-circle">
            <mat-icon>auto_stories</mat-icon>
          </div>
          <h1>AI Study Buddy</h1>
          <p>Your intelligent study companion. Summarize notes, generate flashcards, take quizzes — all powered by AI.</p>
        </div>
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-wrapper">
          <h2>Welcome back</h2>
          <p class="subtitle">Sign in to continue studying</p>

          @if (error) {
            <div class="error-msg">
              <mat-icon>error_outline</mat-icon>
              {{ error }}
            </div>
          }

          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email address</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email"
                     required email placeholder="you&#64;example.com">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="hidePassword ? 'password' : 'text'"
                     name="password" [(ngModel)]="password" required minlength="6">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword = !hidePassword">
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit"
                    class="full-width submit-btn" [disabled]="loading || !loginForm.valid">
              @if (loading) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <p class="switch-link">
            Don't have an account?
            <a routerLink="/register">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }
    .auth-left {
      flex: 1;
      background: var(--gradient);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .auth-brand {
      text-align: center;
      color: white;
      position: relative;
      z-index: 2;
    }
    .auth-brand .logo-circle {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: white; }
    }
    .auth-brand h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 2.2rem;
      font-weight: 700;
      margin: 0 0 12px;
    }
    .auth-brand p {
      font-size: 1.05rem;
      opacity: 0.85;
      max-width: 360px;
      line-height: 1.6;
    }
    .floating-shapes { position: absolute; inset: 0; }
    .shape {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }
    .shape-1 { width: 300px; height: 300px; top: -80px; left: -80px; }
    .shape-2 { width: 200px; height: 200px; bottom: -60px; right: -40px; }
    .shape-3 { width: 120px; height: 120px; bottom: 30%; left: 10%; }

    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      background: white;
    }
    .auth-form-wrapper {
      width: 100%;
      max-width: 400px;
    }
    .auth-form-wrapper h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0 0 4px;
      color: var(--text);
    }
    .subtitle {
      color: var(--text-secondary);
      margin: 0 0 32px;
      font-size: 0.95rem;
    }
    .full-width { width: 100%; }
    .submit-btn {
      height: 52px;
      font-size: 1rem;
      margin-top: 8px;
      background: var(--gradient) !important;
      border-radius: 14px !important;
    }
    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff5f5;
      color: #e53e3e;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 0.9rem;
      border: 1px solid #fed7d7;
    }
    .switch-link {
      text-align: center;
      margin-top: 24px;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .switch-link a {
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
    }
    .switch-link a:hover { text-decoration: underline; }

    @media (max-width: 768px) {
      .auth-page { flex-direction: column; }
      .auth-left { padding: 32px; min-height: 200px; }
      .auth-brand h1 { font-size: 1.5rem; }
      .auth-brand p { display: none; }
      .auth-right { padding: 32px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      }
    });
  }
}
