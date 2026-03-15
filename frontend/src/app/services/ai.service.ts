import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flashcard, QuizQuestion } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly API = 'http://localhost:5000/api/ai';

  constructor(private http: HttpClient) {}

  summarize(noteId: string): Observable<{ summary: string }> {
    return this.http.post<{ summary: string }>(`${this.API}/summarize/${noteId}`, {});
  }

  generateFlashcards(noteId: string): Observable<{ flashcards: Flashcard[] }> {
    return this.http.post<{ flashcards: Flashcard[] }>(`${this.API}/flashcards/${noteId}`, {});
  }

  askQuestion(noteId: string, question: string): Observable<{ answer: string }> {
    return this.http.post<{ answer: string }>(`${this.API}/ask/${noteId}`, { question });
  }

  generateQuiz(noteId: string): Observable<{ quiz: QuizQuestion[] }> {
    return this.http.post<{ quiz: QuizQuestion[] }>(`${this.API}/quiz/${noteId}`, {});
  }
}
