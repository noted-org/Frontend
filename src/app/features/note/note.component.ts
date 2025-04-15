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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../shared/services/note.service';
import {FormControl} from '@angular/forms';
import { Note, UpdateNote } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { catchError, map, Observable, of, switchMap, startWith } from 'rxjs';
import { User } from '../../shared/types/user.type';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ChangeDetectionStrategy, computed, model, signal} from '@angular/core';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {AsyncPipe} from '@angular/common';
import * as sha512 from 'crypto-js';


@Component({
  selector: 'app-note',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, AsyncPipe, MatFormField, MatExpansionModule, MatLabel, CommonModule, RouterModule, MatChipsModule, MatIconModule, MatAutocompleteModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.css',
  providers: [NoteService, UserService],
})
export class NoteComponent implements OnInit {
  @Input() id: number = 0;
  @ViewChild('noteInput') noteInput!: ElementRef;
  @ViewChild('noteInputHeader') noteInputHeader!: ElementRef;

  @ViewChild('expansionPanel') expansionPanel!: ElementRef;
  @ViewChild('expansionPanelHeader') expansionPanelHeader!: ElementRef;


  private noteService = inject(NoteService);
  private userService = inject(UserService);

  readonly panelOpenState = signal(false);

  note: Note | undefined;
  isEditing: boolean = false;
  isEditingHeader: boolean = false;
  firstFormGroup: any;
  menuOpen: Boolean = false;

  tags: {name: string, id: number}[] = [];
  allTags: string[] = []; 
  newTagName = new FormControl('');
  noteTags: {name: string, id: number}[] = [];

  myControl = new FormControl('');
  filteredOptions: Observable<string[]> = this.myControl.valueChanges.pipe(
    startWith(''),
    map(value => this._filter(value || ''))
  );


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngAfterViewChecked() {
    if (this.isEditing && this.noteInput) {
      this.noteInput.nativeElement.focus();
    }
    if (this.isEditingHeader && this.noteInputHeader) {
      this.noteInputHeader.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
    this.noteService.getAllTags().subscribe(tags => {
      this.allTags = tags;
      this.filteredOptions = this.myControl.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value || ''))
      );
    });
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
    if (this.note?.tags) {
      this.tags = this.note.tags;
    }
    this.loadNoteWithTags();
  }

  options: string[] = this.allTags;

  loadNoteWithTags() {
    if (this.id) {
      this.noteService.getSingleNote(this.id).subscribe({
        next: (note) => {
          this.note = note;
          this.noteTags = note.tags || [];
        },
        error: (err) => console.error('Error loading note', err)
      });
    }
    console.log("Tags: " + this.noteTags);
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTag = event.option.value;
    if (this.allTags.includes(selectedTag)) {
        // Tag already exists - add directly to note
        this.addTagToNote(selectedTag);
        this.myControl.setValue('');
    }
  }
  

  addNewTag(): void {
    const newTag = this.myControl.value?.trim();
    if (!newTag) return;

    this.noteService.addTag(newTag).subscribe({
      next: (response) => {
        // when successfully adding:
        this.tags.push({id: response.id, name: response.name});

        this.addTagToNote(response.id);
        this.myControl.setValue('');
      },
      error: (err) => console.error('Error creating new tag', err)
    });
  }

  private addTagToNote(tagId: number) {
    if (!this.note?.id) return;

    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if(!currentUserId || !currentUserPw){
      return;
    }

    this.noteService.addTagsToNote(currentUserId, currentUserPw, this.id, [tagId]).subscribe({
        next: () => {
          this.noteTags.push(this.tags.find(el => el.id == tagId) || {id: -1, name: "Error"});
        },
        error: (err) => console.error('Error adding tag to note', err)
    });
  }
  removeTag(tagId: number): void {
    this.noteTags = this.noteTags.filter(t => t.id !== tagId);
    this.tags = this.tags.filter(t => t.id !== tagId);
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
