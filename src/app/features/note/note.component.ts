import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../shared/services/note.service';
import { Note } from '../../shared/types/note.type';
import { RouterModule } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-note',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './note.component.html',
  styleUrl: './note.component.css',
  providers: [NoteService, UserService],
})
export class NoteComponent implements OnInit {
  @Input() id = 0;

  private noteService = inject(NoteService);
  private userService = inject(UserService);

  note: Note | undefined;
  isEditing: boolean = false;

  async ngOnInit() {
    this.note = await this.loadSingleNote();
  }

  async loadSingleNote() {
    try {
      const note = await this.noteService.getSingleNote(this.id);
      note.authorName = await this.userService.getUserName(note.author);
      return note;
    } catch (error) {
      console.error('Error fetching note', error);
      return;
    }
  }
}
