import { CommonModule } from '@angular/common';
import { Component, HostBinding, inject, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { dialogAnimation } from '../../animation';
import { MatInputModule } from '@angular/material/input';
import { NoteService } from '../../shared/services/note.service';
import { User } from '../../shared/types/user.type';
import { UserService } from '../../shared/services/user.service';
import { CreateNote } from '../../shared/types/note.type';
import { HomeComponent } from '../home/home.component';
dialogAnimation;

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormField,
    FormsModule,
    MatButtonModule,
    MatLabel,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './note-dialog.component.html',
  styleUrl: './note-dialog.component.css',
  animations: [dialogAnimation],
  providers: [UserService],
})
export class NoteDialogComponent implements OnInit {
  inputData: any;
  closeMessage: string = 'Closed using directive';
  private _formBuilder = inject(FormBuilder);
  private NoteService = inject(NoteService);
  currentUser: User | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref: MatDialogRef<NoteDialogComponent>
  ) {}

  firstFormGroup = this._formBuilder.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    tags: [''],
  });

  @HostBinding('@dialogAnimation') animation = true;

  ngOnInit(): void {
    this.inputData = this.data;
  }

  onCancel(): void {
    this.ref.close('Closed using function');
  }

  saveNote() {
    // Check if form is valid
    if (this.firstFormGroup.invalid) {
      this.firstFormGroup.markAllAsTouched();
      return;
    }

    const currentUserId = localStorage.getItem('id');
    const currentUserPw = localStorage.getItem('pw');

    if (!currentUserId || !currentUserPw) {
      console.log('User information not found.');
      alert('User information not found');
      return;
    }

    // Create user object with required data
    const currentUser: User = {
      id: parseInt(currentUserId),
      nickname: 'defaultNickname', // Add default or get from storage
      password: currentUserPw,
      username: 'defaultUsername', // This should not be empty!
      email: 'default@email.com', // Add default or get from storage
    };

    const tagsInput = this.firstFormGroup.value.tags || '';
    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Prepare note data
    const noteData: CreateNote = {
      name: this.firstFormGroup.value.title!,
      author: currentUser.username, // This was empty before
      content: this.firstFormGroup.value.content!,
      tags: tags,
    };

    // Submit to service
    this.NoteService.createNote(noteData, currentUser).subscribe({
      next: (res) => {
        console.log('Note created:', res);
        this.ref.close(res); // Close dialog with response
      },
      error: (err) => {
        console.error('Error creating note:', err);
        alert('Failed to save note. Please check your data.');
      },
    });
  }
}
