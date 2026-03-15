import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotesService } from '../../services/notes.service';
import { Flashcard } from '../../models/note.model';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="fc-page">
      <div class="fc-top-bar">
        <button class="back-btn" [routerLink]="['/note', noteId]">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Note</span>
        </button>
        <h2>Flashcards</h2>
        <span class="spacer"></span>
        <span class="counter">{{ currentIndex + 1 }} / {{ flashcards.length }}</span>
      </div>

      @if (loading) {
        <div class="center-spinner"><mat-spinner diameter="48"></mat-spinner></div>
      } @else if (flashcards.length === 0) {
        <div class="empty-state">
          <div class="empty-icon-circle">
            <mat-icon>style</mat-icon>
          </div>
          <h3>No flashcards yet</h3>
          <p>Go back to the note and generate flashcards first.</p>
          <button class="primary-btn" [routerLink]="['/note', noteId]">
            <mat-icon>arrow_back</mat-icon> Back to Note
          </button>
        </div>
      } @else {
        <!-- Progress dots -->
        <div class="progress-dots">
          @for (card of flashcards; track $index; let i = $index) {
            <div class="dot" [class.active]="i === currentIndex"
                 [class.done]="i < currentIndex" (click)="goTo(i)"></div>
          }
        </div>

        <div class="card-area" (click)="flip()">
          <div class="flashcard" [class.flipped]="flipped">
            <div class="card-face card-front">
              <div class="card-type">
                <mat-icon>help_outline</mat-icon> Question
              </div>
              <p class="card-text">{{ flashcards[currentIndex].question }}</p>
              <span class="flip-hint">
                <mat-icon>touch_app</mat-icon> Tap to reveal answer
              </span>
            </div>
            <div class="card-face card-back">
              <div class="card-type">
                <mat-icon>lightbulb</mat-icon> Answer
              </div>
              <p class="card-text">{{ flashcards[currentIndex].answer }}</p>
              <span class="flip-hint">
                <mat-icon>touch_app</mat-icon> Tap to see question
              </span>
            </div>
          </div>
        </div>

        <div class="controls">
          <button class="nav-btn" (click)="prev()" [disabled]="currentIndex === 0">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button class="nav-btn" (click)="next()" [disabled]="currentIndex === flashcards.length - 1">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .fc-page {
      max-width: 700px;
      margin: 0 auto;
      padding: 24px 32px;
    }
    .fc-top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    .fc-top-bar h2 {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin: 0;
      font-size: 1.3rem;
    }
    .spacer { flex: 1; }
    .counter {
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary);
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      padding: 6px 16px;
      border-radius: 20px;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 8px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .back-btn:hover { border-color: var(--primary); color: var(--primary); }
    .back-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .progress-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 32px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e5e7eb;
      cursor: pointer;
      transition: all 0.3s;
    }
    .dot.active {
      width: 32px;
      border-radius: 5px;
      background: var(--gradient);
    }
    .dot.done { background: var(--primary-light); }

    .card-area {
      perspective: 1000px;
      cursor: pointer;
      margin-bottom: 40px;
    }
    .flashcard {
      width: 100%;
      min-height: 340px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .flashcard.flipped { transform: rotateY(180deg); }
    .card-face {
      position: absolute;
      width: 100%;
      min-height: 340px;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      border-radius: 24px;
      text-align: center;
    }
    .card-front {
      background: var(--gradient);
      color: white;
      box-shadow: 0 12px 40px rgba(108, 99, 255, 0.3);
    }
    .card-back {
      background: white;
      color: var(--text);
      transform: rotateY(180deg);
      border: 2px solid rgba(108, 99, 255, 0.15);
      box-shadow: var(--shadow-lg);
    }
    .card-type {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.8;
      margin-bottom: 20px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .card-text {
      font-size: 1.25rem;
      line-height: 1.7;
      margin: 0 0 24px;
      font-weight: 500;
    }
    .flip-hint {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      opacity: 0.5;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .controls {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    .nav-btn {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid #e5e7eb;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;
      color: var(--text);
    }
    .nav-btn:hover:not(:disabled) {
      border-color: var(--primary);
      color: var(--primary);
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }
    .nav-btn:disabled { opacity: 0.3; cursor: default; }
    .nav-btn mat-icon { font-size: 28px; width: 28px; height: 28px; }

    .empty-state { text-align: center; padding: 80px 16px; }
    .empty-icon-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      mat-icon { font-size: 44px; width: 44px; height: 44px; color: var(--primary); }
    }
    .empty-state h3 { font-family: 'Poppins', sans-serif; margin: 0 0 8px; }
    .empty-state p { color: var(--text-secondary); margin: 0 0 28px; }
    .primary-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: var(--gradient);
      color: white;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }

    .center-spinner {
      display: flex;
      justify-content: center;
      padding: 80px;
    }
  `]
})
export class FlashcardsComponent implements OnInit {
  noteId = '';
  flashcards: Flashcard[] = [];
  currentIndex = 0;
  flipped = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService
  ) {}

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id')!;
    this.notesService.getNote(this.noteId).subscribe({
      next: (note) => { this.flashcards = note.flashcards || []; this.loading = false; },
      error: () => { this.router.navigate(['/dashboard']); }
    });
  }

  flip(): void { this.flipped = !this.flipped; }

  goTo(i: number): void {
    this.flipped = false;
    setTimeout(() => this.currentIndex = i, 150);
  }

  next(): void {
    if (this.currentIndex < this.flashcards.length - 1) {
      this.flipped = false;
      setTimeout(() => this.currentIndex++, 150);
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.flipped = false;
      setTimeout(() => this.currentIndex--, 150);
    }
  }
}
