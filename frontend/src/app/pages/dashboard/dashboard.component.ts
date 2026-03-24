import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe, SlicePipe } from '@angular/common';
import { NotesService } from '../../services/notes.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule, DatePipe, SlicePipe,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard">
      <!-- Hero section -->
      <div class="hero">
        <div class="hero-content">
          <h1>My Study Notes</h1>
          <p>Create, organize, and study smarter with AI</p>
        </div>
        <button class="create-btn" (click)="showCreateDialog = true">
          <mat-icon>add</mat-icon>
          <span>New Note</span>
        </button>
      </div>

      @if (loading) {
        <div class="center-spinner">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (notes.length === 0) {
        <div class="empty-state">
          <div class="empty-illustration">
            <mat-icon>note_add</mat-icon>
          </div>
          <h2>No notes yet</h2>
          <p>Create your first note and let AI supercharge your studying!</p>
          <button class="create-btn" (click)="showCreateDialog = true">
            <mat-icon>add</mat-icon>
            <span>Create Your First Note</span>
          </button>
        </div>
      } @else {
        <div class="notes-grid">
          @for (note of notes; track note._id; let i = $index) {
            <div class="note-card" (click)="openNote(note._id)"
                 [style.animation-delay]="i * 60 + 'ms'">
              <div class="card-accent" [style.background]="getGradient(i)"></div>
              <div class="card-body">
                <div class="card-header">
                  <h3>{{ note.title }}</h3>
                  <button mat-icon-button class="delete-btn" (click)="deleteNote(note._id, $event)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
                <p class="card-preview">{{ note.content | slice:0:120 }}{{ note.content.length > 120 ? '...' : '' }}</p>
                <div class="card-footer">
                  <span class="card-date">{{ note.createdAt | date:'MMM d, y' }}</span>
                  <div class="card-badges">
                    @if (note.summary) {
                      <span class="badge badge-ai">
                        <span class="badge-glyph" aria-hidden="true">✨</span>
                        <span>Summary</span>
                      </span>
                    }
                    @if (note.flashcards.length) {
                      <span class="badge badge-cards">
                        <mat-icon>style</mat-icon> {{ note.flashcards.length }}
                      </span>
                    }
                  </div>
                </div>
                @if (note.tags.length) {
                  <div class="card-tags">
                    @for (tag of note.tags | slice:0:3; track tag) {
                      <span class="tag">{{ tag }}</span>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Create Dialog -->
      @if (showCreateDialog) {
        <div class="overlay" (click)="showCreateDialog = false">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h2>Create New Note</h2>
              <button class="icon-close" type="button" aria-label="Close dialog" (click)="showCreateDialog = false">
                &times;
              </button>
            </div>
            <div class="dialog-body">
              <label class="field-label" for="note-title">Title</label>
              <input
                id="note-title"
                class="text-input"
                type="text"
                [(ngModel)]="newTitle"
                placeholder="e.g. Physics Chapter 3"
              >

              <label class="field-label" for="note-content">Content</label>
              <textarea
                id="note-content"
                class="text-input text-area"
                [(ngModel)]="newContent"
                rows="8"
                placeholder="Paste or type your study notes here..."
              ></textarea>

              <label class="field-label" for="note-tags">Tags (comma separated)</label>
              <input
                id="note-tags"
                class="text-input"
                type="text"
                [(ngModel)]="newTags"
                placeholder="e.g. physics, exam, chapter3"
              >
            </div>
            <div class="dialog-actions">
              <button class="btn-secondary" type="button" (click)="showCreateDialog = false">Cancel</button>
              <button class="create-btn small"
                      [class.disabled]="!newTitle.trim() || !newContent.trim() || creating"
                      (click)="createNote()">
                @if (creating) {
                  <mat-spinner diameter="18"></mat-spinner>
                } @else {
                  <span class="plus-glyph" aria-hidden="true">+</span>
                  <span>Create Note</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px;
    }

    .hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding: 32px 40px;
      background: white;
      border-radius: 20px;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(108, 99, 255, 0.06);
    }
    .hero h1 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero p {
      color: var(--text-secondary);
      margin: 4px 0 0;
      font-size: 0.95rem;
    }

    .create-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--gradient);
      color: white;
      border: none;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(108, 99, 255, 0.3);
    }
    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(108, 99, 255, 0.4);
    }
    .create-btn.small { padding: 10px 20px; font-size: 0.9rem; }
    .create-btn.small {
      min-width: 140px;
      justify-content: center;
    }
    .create-btn.disabled { opacity: 0.5; pointer-events: none; }
    .create-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .plus-glyph {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1;
    }

    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .note-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(108, 99, 255, 0.06);
      animation: fadeInUp 0.4s ease-out both;
    }
    .note-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-lg);
    }
    .card-accent {
      height: 6px;
      width: 100%;
    }
    .card-body { padding: 20px 24px 24px; }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .card-header h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0;
      color: var(--text);
      flex: 1;
      line-height: 1.4;
    }
    .delete-btn {
      opacity: 0;
      color: var(--text-secondary);
      transition: all 0.2s;
      margin: -8px -8px 0 0;
    }
    .note-card:hover .delete-btn { opacity: 1; }
    .delete-btn:hover { color: #e53e3e !important; }

    .card-preview {
      color: var(--text-secondary);
      font-size: 0.88rem;
      line-height: 1.6;
      margin: 12px 0 16px;
    }
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-date {
      font-size: 0.78rem;
      color: #9ca3af;
      font-weight: 500;
    }
    .card-badges {
      display: flex;
      gap: 6px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
      mat-icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .badge-glyph {
      font-size: 0.78rem;
      line-height: 1;
      display: inline-block;
      transform: translateY(-0.5px);
    }
    .badge-ai {
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      color: #6C63FF;
    }
    .badge-cards {
      background: linear-gradient(135deg, #fce7f3, #fce4ec);
      color: #ec4899;
    }
    .card-tags {
      display: flex;
      gap: 6px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .tag {
      background: #f3f4f6;
      color: var(--text-secondary);
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 80px 16px;
    }
    .empty-illustration {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      mat-icon { font-size: 52px; width: 52px; height: 52px; color: var(--primary); }
    }
    .empty-state h2 {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      margin: 0 0 8px;
    }
    .empty-state p {
      color: var(--text-secondary);
      margin: 0 0 32px;
    }

    .center-spinner {
      display: flex;
      justify-content: center;
      padding: 80px;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      padding: 16px;
      animation: fadeIn 0.2s ease-out;
    }
    .dialog {
      width: 100%;
      max-width: 620px;
      background: white;
      border-radius: 22px;
      box-shadow: 0 24px 56px rgba(15, 23, 42, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.12);
      animation: scaleIn 0.25s ease-out;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px 14px;
      border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    }
    .dialog-header h2 {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      font-size: 1.3rem;
      margin: 0;
      color: #121826;
    }
    .icon-close {
      width: 34px;
      height: 34px;
      border: none;
      border-radius: 50%;
      background: #f3f4f6;
      color: #374151;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
    }
    .icon-close:hover {
      background: #e5e7eb;
      transform: scale(1.05);
    }
    .dialog-body {
      padding: 20px 28px 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .field-label {
      font-size: 0.86rem;
      font-weight: 600;
      color: #374151;
      margin-top: 2px;
    }
    .text-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #d1d5db;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 0.95rem;
      font-family: 'Inter', sans-serif;
      color: #111827;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      resize: vertical;
    }
    .text-input:focus {
      outline: none;
      border-color: #6c63ff;
      box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.15);
    }
    .text-area {
      min-height: 160px;
      line-height: 1.6;
    }
    .dialog-actions {
      padding: 16px 28px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid rgba(15, 23, 42, 0.08);
    }
    .btn-secondary {
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
      border-radius: 12px;
      padding: 10px 16px;
      font-size: 0.92rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      border-color: #9ca3af;
      background: #f9fafb;
    }
    .full-width { width: 100%; }

    @media (max-width: 640px) {
      .dialog {
        max-width: 96vw;
        border-radius: 18px;
      }
      .dialog-header,
      .dialog-body,
      .dialog-actions {
        padding-left: 18px;
        padding-right: 18px;
      }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  notes: Note[] = [];
  loading = true;
  showCreateDialog = false;
  creating = false;
  newTitle = '';
  newContent = '';
  newTags = '';

  private gradients = [
    'linear-gradient(135deg, #6C63FF, #4158D0)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  ];

  constructor(private notesService: NotesService, private router: Router) {}

  ngOnInit(): void { this.loadNotes(); }

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  loadNotes(): void {
    this.loading = true;
    this.notesService.getNotes().subscribe({
      next: (notes) => { this.notes = notes; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  createNote(): void {
    if (!this.newTitle.trim() || !this.newContent.trim()) return;
    this.creating = true;
    const tags = this.newTags.split(',').map(t => t.trim()).filter(t => t);
    this.notesService.createNote({
      title: this.newTitle.trim(),
      content: this.newContent.trim(),
      tags
    }).subscribe({
      next: (note) => {
        this.creating = false;
        this.showCreateDialog = false;
        this.newTitle = '';
        this.newContent = '';
        this.newTags = '';
        this.router.navigate(['/note', note._id]);
      },
      error: () => { this.creating = false; }
    });
  }

  openNote(id: string): void { this.router.navigate(['/note', id]); }

  deleteNote(id: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this note?')) {
      this.notesService.deleteNote(id).subscribe({
        next: () => { this.notes = this.notes.filter(n => n._id !== id); }
      });
    }
  }
}
