import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
  HostListener,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule, MatIconButton} from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import {
  MatFormField,
  MatFormFieldModule,
  MatLabel,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../shared/services/note.service';
import {FormControl} from '@angular/forms';
import { Note, UpdateNote, CreateNote } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { catchError, map, Observable, of, switchMap, startWith } from 'rxjs';
import { User } from '../../shared/types/user.type';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  computed,
  model,
  signal,
} from '@angular/core';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { AsyncPipe } from '@angular/common';
import * as sha512 from 'crypto-js';
import { TagInputComponent } from '../tag-input/tag-input.component';
import { TextEditorComponent } from '../text-editor/text-editor.component'
import { MatDialog } from '@angular/material/dialog';
import { AiRequestDialogComponent } from '../ai-request-dialog/ai-request-dialog.component';
import { SummaryDialogComponent } from '../summary-dialog/summary-dialog.component';

@Component({
  selector: 'app-note',
  standalone: true,

  imports: [FormsModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, TagInputComponent, AsyncPipe, MatFormField, MatExpansionModule, MatLabel, CommonModule, RouterModule, MatChipsModule, MatIconModule, MatAutocompleteModule, TextEditorComponent, MatIconButton,],

  templateUrl: './note.component.html',
  styleUrl: './note.component.css',
  providers: [NoteService, UserService],
})
export class NoteComponent implements OnInit {
  @Input() id: number = 0;
  @ViewChild('noteInput') noteInput!: ElementRef;
  @ViewChild('noteInputHeader') noteInputHeader!: ElementRef;

  private noteService = inject(NoteService);
  private userService = inject(UserService);

  note: Note | undefined;
  isEditing: boolean = false;
  isEditingHeader: boolean = false;
  firstFormGroup: any;
  menuOpen: Boolean = false;
  userId = Number(localStorage.getItem('id')) || 0;
  userPw = localStorage.getItem('pw') || '';

  noteTags: { name: string, id: number }[] = [];
  allTags: { name: string, id: number }[] = [];


  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}


  ngAfterViewChecked() {
    if (this.isEditing && this.noteInput) {
      this.noteInput.nativeElement.focus();
    }
    if (this.isEditingHeader && this.noteInputHeader) {
      this.noteInputHeader.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.loadAllTags();

    if (this.id) {
      this.loadSingleNote().subscribe((note) => {
        this.note = note;
        this.noteTags = note?.tags || [];
        if (!note) {
          console.error('Note is undefined or null');
        }
      });
      this.loadNoteWithTags();
    } else {
      console.error('ID is not defined');
    }
  }


  onTagRemoved(tagId: number) {
    this.removeTagFromNote(tagId); //muss noch implementiert werden
    /* if (this.note) {
      this.note.tags = this.note.tags?.filter(tag => tag.id !== Number(tagId));
    }   */
  }

  loadAllTags() {
    this.noteService.getAllTags(this.userId, this.userPw).subscribe((tags) => {
      this.allTags = tags;
    });
  }


  onTagAdded(newTag: { name: string, id: number }) {

    this.addTagToNote(newTag.id);
    if (this.note) {
      this.note.tags?.push(newTag);
    }
  }

  loadNoteWithTags() {
    if (this.id) {
      this.noteService.getSingleNote(this.id).subscribe({
        next: (note) => {
          this.note = {
            ...this.note,
            ...note
          };
          this.noteTags = note.tags || [];
        },
        error: (err) => console.error('Error loading note', err),
      });
    }
  }

  private addTagToNote(tagId: number) {
    if (!this.note?.id) return;

    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw) return;



    this.noteService.addTagsToNote(currentUserId, currentUserPw, this.id, [tagId])

      .subscribe({
        next: (addedTag) => {
          if (addedTag) {
            this.noteTags.push(addedTag);
          } else {
            this.loadNoteWithTags();
          }
        },
        error: (err) => console.error('Error adding tag to note', err),
      });
  }

  //muss noch in NoteService implementiert werden, konnte ich aber noch nicht testen
  private removeTagFromNote(tagId: number) {
    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw || !this.id) return;

    this.noteService
      .removeTagFromNote(currentUserId, currentUserPw, this.id, tagId)
      .subscribe({
        next: () => {
          this.noteTags = this.noteTags.filter((t) => t.id !== tagId);
        },
        error: (err) => console.error('Error removing tag from note', err),
      });
  }


  loadSingleNote(): Observable<Note | undefined> {
    return this.noteService.getSingleNote(this.id).pipe(
      switchMap((note) => {
        return this.userService
          .getUserName(note.author)
          .pipe(map((authorName) => ({...note, authorName})));
      }),
      catchError((error) => {
        console.error('Error fetching note', error);
        return of(undefined);
      })
    );
  }

  startEditingHeader() {
    this.isEditingHeader = true;
  }

  stopEditingHeader() {
    this.isEditingHeader = false;
    this.saveNoteChanges();
  }

  startEditing() {
    this.isEditing = true;
  }

  stopEditing() {
      this.isEditing = false;
      this.saveNoteChanges(); // 0 ms reicht, um den Angular-Zyklus abzuwarten
  }

  saveNoteChanges() {
    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw) {
      console.log('User information not found.');
      this.snackBar.open('User information not found', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    const currentUser: User = {
      id: parseInt(currentUserId),
      nickname: 'defaultNickname',
      password: currentUserPw,
      username: 'defaultUsername',
      email: 'default@email.com',
    };

    // const tagsInput = this.firstFormGroup.value.tags || '';
    // const tags = tagsInput
    //   .split(',')
    //   .map((tag: string) => tag.trim())
    //   .filter((tag: string) => tag.length > 0);

    if (!this.id || !this.note) {
      console.error('Note ID or data is missing.');
      this.snackBar.open('Note ID or data is missing.', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    const noteData: UpdateNote = {
      id: this.id,
      name: this.note.name,
      content: this.note.content,
      author: this.note.author,
      tags: [],
    };

    this.noteService.updateNote(noteData, currentUser).subscribe({
      next: (res) => {
        console.log('Note updated:', res);
      },
      error: (err) => {
        console.error('Error updating note:', err);
        this.snackBar.open('Error updating note.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-warning']
        });
      },
    });
  }
  requestOfSummary(){
    const _popup = this.dialog.open(AiRequestDialogComponent, {
        restoreFocus: true,
        autoFocus: false,
        width: '100px',
        height: '300px',
        data: {
          title: 'Do you want an AI generated summary of your note?',
          content: 'This will use AI to summarize your note content and display it below',
        },
      });
    _popup.afterClosed().subscribe((item) => {
        if(item === 'generate'){
          this.generateSummary();
        }
        this.loadSingleNote();
    });
  }
  requestOfQuestions(){
    const _popup = this.dialog.open(AiRequestDialogComponent, {
      restoreFocus: true,
      autoFocus: false,
      width: '100px',
      height: '300px',
      data: {
        title: 'Do you want AI generated questions based on your note?',
        content: 'This will use AI to generate questions based on your note content and display it below',
      },
    });
    _popup.afterClosed().subscribe((item) => {
        if(item === 'generate'){
          this.generateQuestions();
        }
        this.loadSingleNote();
    });
  }

  openResponseDialog(summaryText: string, type: Boolean){
      if(!this.note){
      console.log('Note not found.');
      return;
    }
      const _popup = this.dialog.open(SummaryDialogComponent, {
        restoreFocus: true,
        autoFocus: false,
        width: '80%',
        data: {
          originalNote: this.note,
          summary: summaryText
        },
      });
    _popup.afterClosed().subscribe((action) => {
        if(action === 'replace'){
          this.note!.content = summaryText;
          this.saveNoteChanges();
        } else if (action === 'saveAsNew'){
          const newNote: Note = {
            ...(this.note as Note),
            id: undefined,
            content: summaryText
          };
          this.saveAsNewNote(newNote, type);
        } else{
          console.log('Verworfen')
        }
        this.loadSingleNote();
    });
  }

  async generateSummary() {
    if (!this.note?.id) {
      throw new Error('Note is undefined this should never happen here.');
    }
    const userId = localStorage.getItem('id');
    const userPw = localStorage.getItem('pw');

    if (!userId || !userPw) return;

    this.noteService.summarize(this.note.id, userId, userPw).subscribe({
      next: (summaryText: string) => {
        this.openResponseDialog(summaryText, true);
      },
      error: (err) => {
        console.error('Fehler beim Zusammenfassen:', err);
      },
    });
  }
  async generateQuestions() {
    if (!this.note?.id) {
      throw new Error('Note is undefined this should never happen here.');
    }
    const userId = localStorage.getItem('id');
    const userPw = localStorage.getItem('pw');

    if (!userId || !userPw) return;

    this.noteService.generateQuestions(this.note.id, userId, userPw).subscribe({
      next: (questionText: string) => {
        this.openResponseDialog(questionText, false);
      },
      error: (err) => {
        console.error('Fehler beim generieren der Fragen:', err);
      },
    });
  }
  saveAsNewNote(note: Note, summary: Boolean){
    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');
    let type: string;

    if (summary) {
      type = 'Summary';
    } else {
      type = 'Questions';
    }
  

    if (!currentUserId || !currentUserPw) {
      console.log('User information not found.');
      this.snackBar.open('User information not found.', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    const currentUser: User = {
      id: parseInt(currentUserId),
      nickname: 'defaultNickname',
      password: currentUserPw,
      username: 'defaultUsername',
      email: 'default@email.com',
    };

    if (!this.id || !this.note) {
      console.error('Note ID or data is missing.');
      this.snackBar.open('Note ID or data is missing.', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-warning']
      });
      return;
    }

    const noteData: CreateNote = {
      name: note.name + ' - ' + type,
      content: note.content,
      author: note.author,
      tags: note.tags ? note.tags.map(tag => tag.id) : [],
    };

    this.noteService.createNote(noteData, currentUser).subscribe({
      next: (res) => {
        console.log('New note saved:', res);
        this.snackBar.open('New note saved.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-success']
        });
      },
      error: (err) => {
        console.error('Error saving new note:', err);
        this.snackBar.open('Failed to save new note. Please check your data.', 'Close', {
          duration: 5000,
          panelClass: ['snackbar-warning']
        });
      },
    });
  }

  goBack() {
    if (!this.isEditing){
    window.history.back();}
    else{
      this.isEditing = false;
      this.saveNoteChanges();
    }
  }
}
