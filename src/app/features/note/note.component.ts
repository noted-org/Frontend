import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../shared/services/note.service';
import { Note, UpdateNote } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { User } from '../../shared/types/user.type';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
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

  ngAfterViewChecked() {
    if (this.isEditing && this.noteInput) {
      this.noteInput.nativeElement.focus();
    }
    if (this.isEditingHeader && this.noteInputHeader) {
      this.noteInputHeader.nativeElement.focus();
    }
  }

  ngOnInit() {
    if (this.id) {
      this.loadSingleNote().subscribe((note) => {
        this.note = note;
        if (!note) {
          console.error('Note is undefined or null');
        }
      });
    } else {
      console.error('ID is not defined');
    }
  }

  loadSingleNote(): Observable<Note | undefined> {
    return this.noteService.getSingleNote(this.id).pipe(
      switchMap((note) => {
        return this.userService
          .getUserName(note.author)
          .pipe(map((authorName) => ({ ...note, authorName })));
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
    this.saveNoteChanges();
  }

  saveNoteChanges() {
    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw) {
      console.log('User information not found.');
      alert('User information not found');
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
      alert('Note ID or data is missing.');
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
        alert('Failed to save note changes. Please check your data.');
      },
    });
  }
}
