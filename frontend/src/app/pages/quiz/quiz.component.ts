import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { QuizQuestion } from '../../models/note.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    RouterLink, FormsModule,
    MatButtonModule, MatIconModule,
    MatRadioModule, MatProgressSpinnerModule, MatProgressBarModule
  ],
  template: `
    <div class="quiz-page">
      <div class="quiz-top-bar">
        <button class="back-btn" [routerLink]="['/note', noteId]">
          <mat-icon>arrow_back</mat-icon>
          <span>Back</span>
        </button>
        <h2>Quiz</h2>
      </div>

      @if (loading) {
        <div class="loading-state">
          <div class="loading-animation">
            <mat-spinner diameter="48"></mat-spinner>
          </div>
          <h3>Generating your quiz...</h3>
          <p>AI is creating questions from your notes</p>
        </div>
      } @else if (error) {
        <div class="error-state">
          <div class="error-circle">
            <mat-icon>error_outline</mat-icon>
          </div>
          <h3>{{ error }}</h3>
          <button class="primary-btn" (click)="loadQuiz()">
            <mat-icon>refresh</mat-icon> Try Again
          </button>
        </div>
      } @else if (showResults) {
        <div class="results-card">
          <div class="results-header">
            <div class="score-ring" [class.perfect]="score === questions.length"
                 [class.good]="score >= questions.length * 0.6 && score < questions.length"
                 [class.poor]="score < questions.length * 0.6">
              <span class="score-num">{{ score }}</span>
              <span class="score-den">/ {{ questions.length }}</span>
            </div>
            <h3>{{ getScoreMessage() }}</h3>
            <mat-progress-bar mode="determinate"
                              [value]="(score / questions.length) * 100">
            </mat-progress-bar>
          </div>

          <div class="review-list">
            @for (q of questions; track $index; let i = $index) {
              <div class="review-item"
                   [class.correct]="answers[i] === q.correctIndex"
                   [class.wrong]="answers[i] !== q.correctIndex">
                <div class="review-header">
                  <span class="review-num">Q{{ i + 1 }}</span>
                  @if (answers[i] === q.correctIndex) {
                    <mat-icon class="review-icon correct-icon">check_circle</mat-icon>
                  } @else {
                    <mat-icon class="review-icon wrong-icon">cancel</mat-icon>
                  }
                </div>
                <p class="review-question">{{ q.question }}</p>
                <p class="review-answer">
                  Your answer: <strong>{{ answers[i] !== undefined ? q.options[answers[i]!] : 'Not answered' }}</strong>
                  @if (answers[i] !== q.correctIndex) {
                    <br>Correct: <strong class="correct-text">{{ q.options[q.correctIndex] }}</strong>
                  }
                </p>
                <p class="review-explanation">{{ q.explanation }}</p>
              </div>
            }
          </div>

          <div class="results-actions">
            <button class="primary-btn" (click)="retake()">
              <mat-icon>refresh</mat-icon> Retake Quiz
            </button>
            <button class="secondary-btn" [routerLink]="['/note', noteId]">
              <mat-icon>arrow_back</mat-icon> Back to Note
            </button>
          </div>
        </div>
      } @else {
        <!-- Quiz in progress -->
        <div class="quiz-progress">
          <mat-progress-bar mode="determinate"
                            [value]="((currentQ + 1) / questions.length) * 100">
          </mat-progress-bar>
          <span class="progress-label">Question {{ currentQ + 1 }} of {{ questions.length }}</span>
        </div>

        <div class="question-card">
          <h3>{{ questions[currentQ].question }}</h3>
          <mat-radio-group [(ngModel)]="answers[currentQ]" class="options">
            @for (opt of questions[currentQ].options; track $index; let j = $index) {
              <label class="option" [class.selected]="answers[currentQ] === j">
                <mat-radio-button [value]="j">
                  <span class="option-text">{{ opt }}</span>
                </mat-radio-button>
              </label>
            }
          </mat-radio-group>

          <div class="question-actions">
            @if (currentQ > 0) {
              <button class="secondary-btn" (click)="currentQ = currentQ - 1">
                <mat-icon>chevron_left</mat-icon> Previous
              </button>
            }
            <span class="spacer"></span>
            @if (currentQ < questions.length - 1) {
              <button class="primary-btn" (click)="currentQ = currentQ + 1"
                      [class.disabled]="answers[currentQ] === undefined">
                Next <mat-icon>chevron_right</mat-icon>
              </button>
            } @else {
              <button class="submit-btn" (click)="submit()"
                      [class.disabled]="answers[currentQ] === undefined">
                <mat-icon>done_all</mat-icon> Submit Quiz
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quiz-page {
      max-width: 740px;
      margin: 0 auto;
      padding: 24px 32px;
    }
    .quiz-top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }
    .quiz-top-bar h2 {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin: 0;
      font-size: 1.3rem;
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

    .loading-state, .error-state {
      text-align: center;
      padding: 80px 16px;
    }
    .loading-state h3, .error-state h3 {
      font-family: 'Poppins', sans-serif;
      margin: 20px 0 4px;
    }
    .loading-state p, .error-state p {
      color: var(--text-secondary);
    }
    .loading-animation { margin-bottom: 8px; }
    .error-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #fff5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #e53e3e; }
    }

    .quiz-progress {
      margin-bottom: 28px;
    }
    .progress-label {
      display: block;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-top: 10px;
      font-weight: 500;
    }

    .question-card {
      background: white;
      border-radius: 24px;
      padding: 36px;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(108, 99, 255, 0.06);
      animation: fadeInUp 0.3s ease-out;
    }
    .question-card h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0 0 28px;
      line-height: 1.6;
      color: var(--text);
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .option {
      display: block;
      padding: 16px 20px;
      border: 2px solid #f3f4f6;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .option:hover { border-color: #d1d5db; background: #fafafa; }
    .option.selected {
      border-color: var(--primary);
      background: linear-gradient(135deg, #fafafe, #f5f3ff);
    }
    .option-text { font-size: 0.95rem; }

    .question-actions {
      display: flex;
      align-items: center;
      margin-top: 32px;
      gap: 12px;
    }
    .spacer { flex: 1; }

    .primary-btn, .secondary-btn, .submit-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
      font-family: 'Inter', sans-serif;
    }
    .primary-btn {
      background: var(--gradient);
      color: white;
      box-shadow: 0 4px 16px rgba(108, 99, 255, 0.25);
    }
    .primary-btn:hover { transform: translateY(-1px); }
    .primary-btn.disabled, .submit-btn.disabled { opacity: 0.4; pointer-events: none; }
    .secondary-btn {
      background: white;
      color: var(--text-secondary);
      border: 1px solid #e5e7eb;
    }
    .secondary-btn:hover { border-color: var(--primary); color: var(--primary); }
    .submit-btn {
      background: linear-gradient(135deg, #43e97b, #38f9d7);
      color: #1a1a2e;
      box-shadow: 0 4px 16px rgba(67, 233, 123, 0.3);
    }
    .submit-btn:hover { transform: translateY(-1px); }
    .submit-btn mat-icon, .primary-btn mat-icon, .secondary-btn mat-icon {
      font-size: 18px; width: 18px; height: 18px;
    }

    .results-card {
      background: white;
      border-radius: 24px;
      padding: 40px;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(108, 99, 255, 0.06);
      animation: fadeInUp 0.3s ease-out;
    }
    .results-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .score-ring {
      margin: 0 auto 16px;
    }
    .score-num {
      font-family: 'Poppins', sans-serif;
      font-size: 3.5rem;
      font-weight: 700;
      color: var(--primary);
    }
    .score-den {
      font-size: 1.5rem;
      color: var(--text-secondary);
    }
    .score-ring.perfect .score-num { color: #10b981; }
    .score-ring.poor .score-num { color: #e53e3e; }
    .results-header h3 {
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .review-list { margin: 24px 0; }
    .review-item {
      padding: 20px;
      border-radius: 16px;
      margin-bottom: 12px;
      border-left: 4px solid #e5e7eb;
    }
    .review-item.correct {
      border-left-color: #10b981;
      background: #f0fdf4;
    }
    .review-item.wrong {
      border-left-color: #e53e3e;
      background: #fef2f2;
    }
    .review-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .review-num {
      font-weight: 700;
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
    }
    .review-icon { font-size: 22px; width: 22px; height: 22px; }
    .correct-icon { color: #10b981; }
    .wrong-icon { color: #e53e3e; }
    .review-question {
      font-weight: 600;
      margin: 0 0 8px;
      line-height: 1.5;
    }
    .review-answer {
      font-size: 0.9rem;
      margin: 0 0 8px;
      color: var(--text-secondary);
    }
    .correct-text { color: #10b981; }
    .review-explanation {
      font-style: italic;
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin: 0;
    }

    .results-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      margin-top: 28px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class QuizComponent implements OnInit {
  noteId = '';
  questions: QuizQuestion[] = [];
  answers: (number | undefined)[] = [];
  currentQ = 0;
  showResults = false;
  score = 0;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private aiService: AiService
  ) {}

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id')!;
    this.loadQuiz();
  }

  loadQuiz(): void {
    this.loading = true;
    this.error = '';
    this.aiService.generateQuiz(this.noteId).subscribe({
      next: (res) => {
        this.questions = res.quiz;
        this.answers = new Array(this.questions.length).fill(undefined);
        this.currentQ = 0;
        this.showResults = false;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to generate quiz. Check your API key.';
      }
    });
  }

  submit(): void {
    this.score = this.questions.reduce((acc, q, i) =>
      acc + (this.answers[i] === q.correctIndex ? 1 : 0), 0);
    this.showResults = true;
  }

  retake(): void { this.loadQuiz(); }

  getScoreMessage(): string {
    const pct = (this.score / this.questions.length) * 100;
    if (pct === 100) return 'Perfect score! You nailed it!';
    if (pct >= 80) return 'Great job! You know this well.';
    if (pct >= 60) return 'Good effort! Review what you missed.';
    return 'Keep studying! Try again after reviewing.';
  }
}
