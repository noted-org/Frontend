import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteComponent } from '../note/note.component';
import { NoteService } from '../../shared/services/note.service';
import { UserService } from '../../shared/services/user.service';
import { CreateNote, Note } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { User } from '../../shared/types/user.type';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  providers: [NoteService, UserService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  notes: Note[] = [];
  private noteService = inject(NoteService);
  private userService = inject(UserService);

  constructor(private dialog: MatDialog) {}

  async ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.noteService
      .getAllNotes()
      .pipe(
        switchMap((fetchedNotes) => {
          if (!fetchedNotes) return of([]);

          return forkJoin(
            fetchedNotes.map((note) =>
              this.userService.getUserName(note.author).pipe(
                map((authorName) => ({ ...note, authorName })),
                catchError(() => of({ ...note, authorName: 'Unknown' }))
              )
            )
          );
        })
      )
      .subscribe({
        next: (notesWithAuthors) => {
          console.log(notesWithAuthors);
          this.notes = notesWithAuthors.map((note) => ({
            ...note,
            tags: note.tags || [],
          }));
        },
        error: (error) => {
          console.error('Error fetching notes:', error);
        },
      });
  }

  createNewNote() {
    const _popup = this.dialog.open(NoteDialogComponent, {
      restoreFocus: true,
      autoFocus: false,
      width: '80%',
      height: '62%',
      data: {
        title: 'Create New Note',
        content: 'Note content',
      },
    });
    _popup.afterClosed().subscribe((item) => {
      this.loadNotes();
    });
  }
}
