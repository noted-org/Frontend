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
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

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
    MatFormFieldModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [NoteService, UserService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  allTags: { id: number; name: string }[] = [];
  selectedTags: number[] = [];

  private noteService = inject(NoteService);
  private userService = inject(UserService);

  private dialogRef: MatDialogRef<ConfirmationDialogComponent> | undefined;
  constructor(private dialog: MatDialog) {}

  private _currentUserId = parseInt(localStorage.getItem('id') || '0');
  private _currentUserPw = localStorage.getItem('pw') || '';

  async ngOnInit() {
    this.loadNotes();
    this.loadAllTags();
  }

  trackByTagId(index: number, tag: { id: number; name: string }): number {
    return tag.id;
  }

  trackByNoteId(index: number, note: Note): number {
    return note.id!;
  }

  loadNotes() {
    if (!this._currentUserId) {
      console.log('User information not found.');
      alert('User information not found');
      return;
    }
    console.log(this._currentUserId);

    this.noteService
      .getAllNotes(this._currentUserId)
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
          this.filteredNotes = this.notes;
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
      this.loadAllTags();
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
        if (!this._currentUserId || !this._currentUserPw) {
          console.log('User information not found.');
          alert('User information not found');
          return;
        }

        if (typeof id === 'number' && !isNaN(id)) {
          console.log('True');
          this.noteService
            .deleteNote(this._currentUserId, this._currentUserPw, id)
            .subscribe(() => {
              const index = this.notes.findIndex((el) => el.id == id);
              this.notes.splice(index, 1);
            });
        }
      }
      this.dialogRef = undefined;
    });
  }

  loadAllTags() {
    this.noteService
      .getAllTags(this._currentUserId, this._currentUserPw)
      .subscribe((tags) => {
        this.allTags = tags;
      });
  }

  filterNotes() {
    if (this.selectedTags.length > 0) {
      this.filteredNotes = this.notes.filter((note) =>
        this.selectedTags.every((tagId) =>
          note.tags?.some((tag) => tag.id === tagId)
        )
      );
    } else {
      this.filteredNotes = this.notes;
    }
  }

  preventLoading(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }
}
