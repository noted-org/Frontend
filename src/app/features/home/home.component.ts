import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from '../note/note.component';
import { NoteService } from '../../shared/services/note.service';
import { UserService } from '../../shared/services/user.service';
import { CreateNote, Note } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { User } from '../../shared/types/user.type';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NoteComponent, CommonModule, RouterModule],
  providers: [NoteService, UserService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  notes: Note[] = [];
  private noteService = inject(NoteService);
  private userService = inject(UserService);
  private router = inject(Router);

  async ngOnInit() {
    this.loadNotes();
  }

  async loadNotes() {
    try {
      const fetchedNotes = await this.noteService.getAllNotes();
      if (fetchedNotes) {
        this.notes = fetchedNotes;
        this.notes.forEach(async (note) => {
          note.authorName = await this.userService.getUserName(note.author);
        });
      }
    } catch (error) {
      console.error('Error fetching notes');
    }
  }

  async createNewNote() {
    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw) {
      console.log('User information not found.');
      return;
    }

    const currentUser: User = {
      id: parseInt(currentUserId),
      nickname: '',
      password: currentUserPw,
      username: '',
      email: '',
    };

    if (currentUserId && currentUserPw) {
      const newNote: CreateNote = {
        name: 'New Note',
        content: '',
        author: currentUserId,
      };

      try {
        const createdNote = await this.noteService.createNote(
          newNote,
          currentUser
        );
        this.router.navigate(['/notes', createdNote.id]);
      } catch (error) {}
    } else {
      console.log('User information not found.');
    }
  }
}
