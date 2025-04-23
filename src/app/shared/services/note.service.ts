import { catchError, Observable, tap, throwError } from 'rxjs';
import { Note, CreateNote, UpdateNote } from '../types/note.type';
import { User } from '../types/user.type';
import {
  HttpHeaders,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly BASE_URL = 'http://localhost:3000';
  constructor(private http: HttpClient) {}

  post<T>(url: string, user: User, body?: object): Observable<T> {
    const headers = body
      ? new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.id} ${user.password}`,
        })
      : undefined;

    console.log('Request URL:', url);
    console.log('Request Headers:', headers);
    console.log('Request Body:', body);

    return this.http.post<T>(url, body, { headers });
  }

  get<T>(url: string): Observable<T> {
    console.log('Request URL:', url);

    return this.http.get<T>(url).pipe(
      tap((response) => console.log('Response:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('Request failed:', error);
        return throwError(() => error);
      })
    );
  }

  patch<T>(url: string, user: User, body?: object): Observable<T> {
    const headers = body
      ? new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.id} ${user.password}`,
        })
      : undefined;

    console.log('Request URL:', url);
    console.log('Request Body:', body);

    return this.http.patch<T>(url, body, { headers }).pipe(
      tap((response) => console.log('Response:', response)),
      catchError((error: HttpErrorResponse) => {
        console.error('PATCH request failed:', error);
        return throwError(() => error);
      })
    );
  }

  delete<T>(url: string, user: User, body?: object): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.id} ${user.password}`,
    });

    console.log('DELETE Request URL:', url);
    console.log('DELETE Request Headers:', user);
    console.log('DELETE Request Body:', body);

    return this.http.delete<T>(url, {
      headers,
      body,
    });
  }

  createNote(noteData: CreateNote, user: User): Observable<Note> {
    const payload = {
      ...noteData,
      tags: noteData.tags || [], // Ensure tags is always an array
    };
    return this.post<Note>(`${this.BASE_URL}/notes`, user, payload);
  }

  updateNote(note: UpdateNote, user: User): Observable<Note> {
    const payload = {
      ...note,
      tags: note.tags || [], // Ensure tags is always an array
    };
    return this.patch<Note>(`${this.BASE_URL}/notes/${note.id}`, user, payload);
  }

  addTag(tagName: string, userId: number, userPw: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId} ${userPw}`,
    });
    return this.http.post(
      `http://localhost:3000/tags`,
      { name: tagName },
      { headers }
    );
  }

  getAllTags(
    userId: number,
    userPw: string
  ): Observable<{ id: number; name: string }[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId} ${userPw}`,
    });
    return this.http.get<{ id: number; name: string }[]>(
      `http://localhost:3000/tags`,
      { headers }
    );
  }

  addTagsToNote(
    userid: string,
    userpw: string,
    noteId: number,
    tags: number[]
  ) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userid} ${userpw}`,
    });
    return this.http.post<{ id: number; name: string }>(
      `http://localhost:3000/notes/${noteId}/tags`,
      { tags: tags },
      { headers }
    );
  }
  removeTagFromNote(
    userId: string,
    password: string,
    noteId: number,
    tagId: number
  ): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userId} ${password}`,
    });

    return this.http.delete<void>(
      `${this.BASE_URL}/notes/${noteId}/tags/${tagId}`,
      {
        headers,
      }
    );
  }

  getAllNotes(): Observable<Note[]> {
    return this.get<Note[]>(`http://localhost:3000/notes/`);
  }

  getNotesByTag(tag: string): Observable<Note[]> {
    return this.get<Note[]>(
      `${this.BASE_URL}/notes?tag=${encodeURIComponent(tag)}`
    );
  }

  getSingleNote(noteId: number): Observable<Note> {
    console.log(noteId);
    return this.get<Note>(`${this.BASE_URL}/notes/${noteId}`);
  }

  deleteNote(
    userId: number,
    password: string,
    noteId: number
  ): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/notes/${noteId}`, {
      id: userId,
      password: password,
      nickname: '',
      username: '',
      email: '',
    });
  }
}
