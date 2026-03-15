import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterLink, AsyncPipe],
  template: `
    <nav class="navbar">
      <a routerLink="/dashboard" class="brand">
        <div class="logo-circle">
          <mat-icon>auto_stories</mat-icon>
        </div>
        <span class="brand-text">AI Study Buddy</span>
      </a>
      <span class="spacer"></span>
      @if (auth.currentUser$ | async; as user) {
        <div class="user-section">
          <div class="avatar">{{ user.name.charAt(0).toUpperCase() }}</div>
          <span class="user-name">{{ user.name }}</span>
          <button mat-icon-button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      padding: 12px 32px;
      background: white;
      border-bottom: 1px solid rgba(108, 99, 255, 0.08);
      box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
      position: sticky;
      top: 0;
      z-index: 1000;
      backdrop-filter: blur(10px);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: inherit;
    }
    .logo-circle {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      mat-icon { font-size: 22px; width: 22px; height: 22px; }
    }
    .brand-text {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.2rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .spacer { flex: 1; }
    .user-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-soft);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .user-name {
      font-weight: 500;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    .logout-btn {
      color: var(--text-secondary);
      transition: color 0.2s;
    }
    .logout-btn:hover { color: var(--accent); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
