import { Note, CreateNote, UpdateNote } from '../types/note.type';
import { User } from '../types/user.type';
import * as sha512 from 'crypto-js';

export class NoteService {
  private readonly BASE_URL = 'http://localhost:3000';

  async post<T>(url: string, user: User, body?: object): Promise<T> {
    const options: RequestInit = { method: 'POST' };
    //console.log(body);
    if (body) {
      options.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.id} ${sha512
          .SHA512(user.password)
          .toString()}`,
      };
      options.body = JSON.stringify(body);
    }

    console.log('Request URL:', url);
    console.log('Request Options:', options);

    const response = await fetch(url, options);
    if (response.ok) {
      return response.json();
    }

    throw response;
  }

  async get<T>(url: string): Promise<T> {
    const options: RequestInit = { method: 'GET' };

    console.log('Request URL:', url);
    console.log('Request Options:', options);
    const response = await fetch(url, options);
    if (response.ok) {
      return response.json();
    }
    throw response;
  }

  async patch<T>(url: string, user: User, body?: object): Promise<T> {
    const options: RequestInit = { method: 'PATCH' };
    if (body) {
      options.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.id} ${sha512
          .SHA512(user.password)
          .toString()}`,
      };
      options.body = JSON.stringify(body);
    }

    console.log('Request URL:', url);
    console.log('Request Options', options);

    const response = await fetch(url, options);

    if (response.ok) {
      return response.json();
    } else if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    }

    throw response;
  }

  async createNote(note: CreateNote, user: User): Promise<Note> {
    return this.post<Note>(`${this.BASE_URL}/notes`, user, note);
  }
  async updateNote(note: UpdateNote, user: User): Promise<Note> {
    return this.patch<Note>(`${this.BASE_URL}/notes/${note.id}`, user, note);
  }
  async getAllNotes() {
    return this.get<Note[]>(`${this.BASE_URL}/notes/`);
  }
  async getSingleNote(noteId: Number) {
    console.log(noteId);
    return this.get<Note>(`${this.BASE_URL}/notes/${noteId}`);
  }
}
