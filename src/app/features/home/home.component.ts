import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import {
  MatAutocomplete,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
    MatChipsModule,
    MatAutocompleteModule,
  ],
  providers: [NoteService, UserService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  allTags: { id: number; name: string }[] = [];
  selectedTags: { id: number; name: string }[] = [];

  tagCtrl = new FormControl('');
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filteredTagOptions!: Observable<{ id: number; name: string }[]>;

  private noteService = inject(NoteService);
  private userService = inject(UserService);

  private dialogRef: MatDialogRef<ConfirmationDialogComponent> | undefined;
  constructor(private dialog: MatDialog) {}

  private _currentUserId = parseInt(localStorage.getItem('id') || '0');
  private _currentUserPw = localStorage.getItem('pw') || '';

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChild('auto') autoComplete!: MatAutocomplete;

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
      this.selectedTags = [];
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

        this.filteredTagOptions = this.tagCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const filterValue =
              typeof value === 'string' ? value.toLowerCase() : '';
            return this.allTags.filter(
              (tag) =>
                tag.name.toLowerCase().includes(filterValue) &&
                !this.selectedTags.some((t) => t.id === tag.id)
            );
          })
        );
      });
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTag = event.option.value;
    if (!this.selectedTags.find((t) => t.id === selectedTag.id)) {
      this.selectedTags.push(selectedTag);
      this.filterNotes(); // aktualisiere die Notizen
    }
    this.tagCtrl.setValue('test');
    this.tagCtrl.markAsPristine();
    this.tagCtrl.markAsUntouched();

    if (this.tagInput) {
      this.tagInput.nativeElement.value = '';
    }

    // Filter nach dem Hinzufügen aktualisieren
    this.filteredTagOptions = this.tagCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        const filterValue =
          typeof value === 'string' ? value.toLowerCase() : '';
        return this.allTags.filter(
          (tag) =>
            tag.name.toLowerCase().includes(filterValue) &&
            !this.selectedTags.some((t) => t.id === tag.id)
        );
      })
    );
  }

  removeTag(tagToRemove: { id: number; name: string }): void {
    this.selectedTags = this.selectedTags.filter(
      (tag) => tag.id !== tagToRemove.id
    );
    this.filterNotes(); // aktualisiere die Notizen

    this.tagCtrl.setValue(this.tagCtrl.value ?? null);
    this.tagCtrl.markAsPristine();
    this.tagCtrl.markAsUntouched();
  }

  addTagFromInput(event: any): void {
    // Leere Funktion – blockiert manuelles Erstellen von neuen Tags
  }

  filterNotes() {
    if (this.selectedTags.length > 0) {
      const tagIds = this.selectedTags.map((t) => t.id);
      this.filteredNotes = this.notes.filter((note) =>
        tagIds.every((tagId) => note.tags?.some((tag) => tag.id === tagId))
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
