import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note } from '../models/note.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly API = `${environment.apiUrl}/api/notes`;

  constructor(private http: HttpClient) {}

  getNotes(): Observable<Note[]> {
    return this.http.get<Note[]>(this.API);
  }

  getNote(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.API}/${id}`);
  }

  createNote(data: { title: string; content: string; tags?: string[] }): Observable<Note> {
    return this.http.post<Note>(this.API, data);
  }

  updateNote(id: string, data: { title: string; content: string; tags?: string[] }): Observable<Note> {
    return this.http.put<Note>(`${this.API}/${id}`, data);
  }

  deleteNote(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
