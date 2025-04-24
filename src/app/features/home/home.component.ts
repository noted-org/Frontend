import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '../../shared/services/note.service';
import { UserService } from '../../shared/services/user.service';
import { Note } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { NoteDialogComponent } from '../note-dialog/note-dialog.component';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { User } from '../../shared/types/user.type';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
  ],
  providers: [NoteService, UserService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  notes: Note[] = [];
  private noteService = inject(NoteService);
  private userService = inject(UserService);

  private dialogRef: MatDialogRef<ConfirmationDialogComponent> | undefined;
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

  deleteNote(id: Number | undefined) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;

    this.dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      dialogConfig
    );
    this.dialogRef.componentInstance.title = 'Delete Note';
    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure you want to delete your note?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const currentUserId = localStorage.getItem('id');
        const currentUserPw = localStorage.getItem('pw');

        if (!currentUserId || !currentUserPw) {
          console.log('User information not found.');
          alert('User information not found');
          return;
        }

        if (typeof id === 'number' && !isNaN(id)) {
          console.log('True');
          this.noteService
            .deleteNote(parseInt(currentUserId), currentUserPw, id)
            .subscribe(() => {
              const index = this.notes.findIndex((el) => el.id == id);
              this.notes.splice(index, 1);
            });
        }
      }
      this.dialogRef = undefined;
    });
  }

  preventLoading(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
