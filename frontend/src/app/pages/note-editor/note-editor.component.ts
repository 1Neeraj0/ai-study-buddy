import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotesService } from '../../services/notes.service';
import { AiService } from '../../services/ai.service';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [
    FormsModule, RouterLink,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule,
    MatTabsModule, MatSnackBarModule, MatTooltipModule
  ],
  template: `
    <div class="editor-page">
      <!-- Top bar -->
      <div class="top-bar">
        <button class="back-btn" routerLink="/dashboard">
          <mat-icon>arrow_back</mat-icon>
          <span>Back</span>
        </button>
        <h2>{{ note?.title || 'Loading...' }}</h2>
        <span class="spacer"></span>
        <button class="save-btn" (click)="saveNote()" [disabled]="saving">
          @if (saving) {
            <mat-spinner diameter="18"></mat-spinner>
          } @else {
            <mat-icon>check</mat-icon>
            <span>Save</span>
          }
        </button>
      </div>

      @if (loading) {
        <div class="center-spinner"><mat-spinner diameter="48"></mat-spinner></div>
      } @else if (note) {
        <mat-tab-group animationDuration="200ms" class="editor-tabs">
          <!-- EDIT TAB -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label"><mat-icon>edit_note</mat-icon> Edit</div>
            </ng-template>
            <div class="tab-content">
              <div class="edit-section">
                <mat-form-field appearance="outline" class="full-width title-field">
                  <mat-label>Note Title</mat-label>
                  <input matInput [(ngModel)]="note.title" class="title-input">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Notes Content</mat-label>
                  <textarea matInput [(ngModel)]="note.content" rows="18"
                            placeholder="Type or paste your study notes here..."
                            class="content-input"></textarea>
                </mat-form-field>
              </div>
            </div>
          </mat-tab>

          <!-- AI SUMMARY TAB -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label"><mat-icon>auto_awesome</mat-icon> AI Summary</div>
            </ng-template>
            <div class="tab-content">
              <div class="ai-header">
                <div class="ai-header-text">
                  <h3>AI-Powered Summary</h3>
                  <p>Generate a concise summary of your notes with key takeaways</p>
                </div>
                <button class="ai-btn" (click)="summarize()" [disabled]="aiLoading">
                  @if (aiLoading) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <mat-icon>auto_awesome</mat-icon>
                    <span>Generate</span>
                  }
                </button>
              </div>
              @if (note.summary) {
                <div class="result-box">
                  <div class="result-icon-bar">
                    <mat-icon>auto_awesome</mat-icon>
                    <span>AI Summary</span>
                  </div>
                  <div class="result-content" [innerHTML]="formatText(note.summary)"></div>
                </div>
              } @else {
                <div class="empty-ai">
                  <div class="empty-ai-icon">
                    <mat-icon>auto_awesome</mat-icon>
                  </div>
                  <p>Click "Generate" to create an AI summary of your notes</p>
                </div>
              }
            </div>
          </mat-tab>

          <!-- AI Q&A TAB -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label"><mat-icon>forum</mat-icon> Ask AI</div>
            </ng-template>
            <div class="tab-content">
              <div class="ai-header">
                <div class="ai-header-text">
                  <h3>Ask Questions About Your Notes</h3>
                  <p>Get instant AI-powered answers based on your content</p>
                </div>
              </div>
              <div class="qa-input">
                <div class="qa-question-field">
                  <span class="qa-prefix" aria-hidden="true">?</span>
                  <input
                    type="text"
                    [(ngModel)]="question"
                    placeholder="Type your question..."
                    (keyup.enter)="askQuestion()"
                  >
                </div>
                <button class="ai-btn" (click)="askQuestion()"
                        [disabled]="aiLoading || !question.trim()">
                  @if (aiLoading) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <span class="send-glyph" aria-hidden="true">&#9658;</span>
                  }
                </button>
              </div>
              @if (answer) {
                <div class="result-box">
                  <div class="result-icon-bar">
                    <mat-icon>smart_toy</mat-icon>
                    <span>AI Answer</span>
                  </div>
                  <div class="result-content" [innerHTML]="formatText(answer)"></div>
                </div>
              }
            </div>
          </mat-tab>

          <!-- AI TOOLS TAB -->
          <mat-tab>
            <ng-template mat-tab-label>
              <div class="tab-label"><mat-icon>psychology</mat-icon> AI Tools</div>
            </ng-template>
            <div class="tab-content">
              <div class="ai-header">
                <div class="ai-header-text">
                  <h3>Study Tools</h3>
                  <p>AI-powered tools to help you study effectively</p>
                </div>
              </div>
              <div class="tools-grid">
                <div class="tool-card" (click)="generateFlashcards()">
                  <div class="tool-icon" style="background: linear-gradient(135deg, #6C63FF, #4158D0)">
                    <mat-icon>style</mat-icon>
                  </div>
                  <h4>Generate Flashcards</h4>
                  <p>Create study cards from your notes</p>
                  @if (note.flashcards.length) {
                    <span class="tool-badge">{{ note.flashcards.length }} cards ready</span>
                  }
                </div>

                <div class="tool-card" [routerLink]="['/note', note._id, 'flashcards']"
                     [class.disabled]="!note.flashcards.length">
                  <div class="tool-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c)">
                    <mat-icon>flip</mat-icon>
                  </div>
                  <h4>Study Flashcards</h4>
                  <p>Review and flip through your cards</p>
                </div>

                <div class="tool-card" [routerLink]="['/note', note._id, 'quiz']">
                  <div class="tool-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe)">
                    <mat-icon>quiz</mat-icon>
                  </div>
                  <h4>Take a Quiz</h4>
                  <p>Test your knowledge with AI questions</p>
                </div>
              </div>
              @if (aiLoading) {
                <div class="center-spinner"><mat-spinner diameter="40"></mat-spinner></div>
              }
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .editor-page {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 32px;
    }

    .top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }
    .top-bar h2 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0;
      color: var(--text);
    }
    .spacer { flex: 1; }

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
    .back-btn:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .back-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .save-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      background: var(--gradient);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(108, 99, 255, 0.3);
      font-family: 'Inter', sans-serif;
    }
    .save-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
    }
    .save-btn:disabled { opacity: 0.6; pointer-events: none; }
    .save-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .editor-tabs {
      background: white;
      border-radius: 20px;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(108, 99, 255, 0.06);
      overflow: hidden;
    }
    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      mat-icon { font-size: 20px; width: 20px; height: 20px; }
    }
    .tab-content { padding: 32px; }

    .edit-section { }
    .title-field input { font-size: 1.1rem; font-weight: 600; }
    .content-input {
      font-size: 0.95rem;
      line-height: 1.8;
    }
    .full-width { width: 100%; }

    .ai-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f3f4f6;
    }
    .ai-header-text h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0 0 4px;
    }
    .ai-header-text p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 0.88rem;
    }

    .ai-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: var(--gradient);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 4px 16px rgba(108, 99, 255, 0.25);
      white-space: nowrap;
      font-family: 'Inter', sans-serif;
    }
    .ai-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(108, 99, 255, 0.35);
    }
    .ai-btn:disabled { opacity: 0.6; pointer-events: none; }
    .ai-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .result-box {
      background: linear-gradient(135deg, #fafafe, #f5f3ff);
      border: 1px solid rgba(108, 99, 255, 0.12);
      border-radius: 16px;
      overflow: hidden;
      animation: fadeInUp 0.3s ease-out;
    }
    .result-icon-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      background: rgba(108, 99, 255, 0.05);
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--primary);
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .result-content {
      padding: 20px;
      line-height: 1.8;
      font-size: 0.93rem;
      color: var(--text);
    }

    .empty-ai {
      text-align: center;
      padding: 60px 16px;
    }
    .empty-ai-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--primary); }
    }
    .empty-ai p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .qa-input {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 24px;
    }
    .qa-question-field {
      flex: 1;
      position: relative;
    }
    .qa-prefix {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eef2ff;
      color: #4f46e5;
      font-size: 0.82rem;
      font-weight: 700;
      pointer-events: none;
    }
    .qa-question-field input {
      width: 100%;
      box-sizing: border-box;
      height: 56px;
      border: 1px solid #d1d5db;
      border-radius: 10px;
      padding: 0 16px 0 46px;
      font-size: 0.97rem;
      color: #111827;
      background: #fff;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .qa-question-field input:focus {
      outline: none;
      border-color: #6c63ff;
      box-shadow: 0 0 0 4px rgba(108, 99, 255, 0.15);
    }
    .qa-input .ai-btn {
      height: 56px;
      min-width: 56px;
      justify-content: center;
      padding: 0 18px;
      flex-shrink: 0;
    }
    .send-glyph {
      font-size: 1.05rem;
      line-height: 1;
      transform: translateX(1px);
      display: inline-block;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .tool-card {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 20px;
      padding: 28px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tool-card:hover {
      transform: translateY(-6px);
      box-shadow: var(--shadow-md);
      border-color: rgba(108, 99, 255, 0.15);
    }
    .tool-card.disabled {
      opacity: 0.45;
      pointer-events: none;
    }
    .tool-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }
    .tool-card h4 {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin: 0 0 4px;
      font-size: 1rem;
    }
    .tool-card p {
      color: var(--text-secondary);
      font-size: 0.82rem;
      margin: 0;
    }
    .tool-badge {
      display: inline-block;
      margin-top: 12px;
      background: linear-gradient(135deg, #ede9fe, #e0e7ff);
      color: var(--primary);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 600;
    }

    .center-spinner {
      display: flex;
      justify-content: center;
      padding: 40px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NoteEditorComponent implements OnInit {
  note: Note | null = null;
  loading = true;
  saving = false;
  aiLoading = false;
  question = '';
  answer = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notesService: NotesService,
    private aiService: AiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.notesService.getNote(id).subscribe({
      next: (note) => { this.note = note; this.loading = false; },
      error: () => {
        this.snackBar.open('Note not found', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  saveNote(): void {
    if (!this.note) return;
    this.saving = true;
    this.notesService.updateNote(this.note._id, {
      title: this.note.title,
      content: this.note.content,
      tags: this.note.tags
    }).subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open('Note saved!', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Failed to save', 'OK', { duration: 3000 });
      }
    });
  }

  summarize(): void {
    if (!this.note) return;
    this.aiLoading = true;
    this.aiService.summarize(this.note._id).subscribe({
      next: (res) => {
        this.note!.summary = res.summary;
        this.aiLoading = false;
        this.snackBar.open('Summary generated!', 'OK', { duration: 2000 });
      },
      error: (err) => {
        this.aiLoading = false;
        this.snackBar.open(err.error?.message || 'Failed to generate summary', 'OK', { duration: 3000 });
      }
    });
  }

  askQuestion(): void {
    if (!this.note || !this.question.trim()) return;
    this.aiLoading = true;
    this.answer = '';
    this.aiService.askQuestion(this.note._id, this.question).subscribe({
      next: (res) => { this.answer = res.answer; this.aiLoading = false; },
      error: (err) => {
        this.aiLoading = false;
        this.snackBar.open(err.error?.message || 'Failed to get answer', 'OK', { duration: 3000 });
      }
    });
  }

  generateFlashcards(): void {
    if (!this.note) return;
    this.aiLoading = true;
    this.aiService.generateFlashcards(this.note._id).subscribe({
      next: (res) => {
        this.note!.flashcards = res.flashcards;
        this.aiLoading = false;
        this.snackBar.open(`${res.flashcards.length} flashcards generated!`, 'OK', { duration: 2000 });
      },
      error: (err) => {
        this.aiLoading = false;
        this.snackBar.open(err.error?.message || 'Failed to generate flashcards', 'OK', { duration: 3000 });
      }
    });
  }

  formatText(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- /gm, '&bull; ');
  }
}
