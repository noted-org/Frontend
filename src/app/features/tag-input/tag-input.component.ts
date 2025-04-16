import {
  Component,
  inject,
  signal,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { NoteService } from '../../shared/services/note.service';
import { Note, UpdateNote } from '../../shared/types/note.type';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionPanel } from '@angular/material/expansion';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatExpansionPanel,
  ],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.css',
})
export class TagInputComponent implements OnInit {
  @Input() initialTags: { name: string; id: number }[] = [];
  @Input() allAvailableTags: { name: string; id: number }[] = [];
  @Output() tagAdded = new EventEmitter<{ name: string; id: number }>();
  @Output() tagRemoved = new EventEmitter<number>();

  @ViewChild('expansionPanel') expansionPanel!: MatExpansionPanel;
  @ViewChild('expansionPanelHeader') expansionPanelHeader!: MatExpansionPanel;

  private noteService = inject(NoteService);

  readonly panelOpenState = signal(false);

  tags: { name: string; id: number }[] = [];

  myControl = new FormControl('');
  filteredOptions!: Observable<{ name: string; id: number }[]>;

  displayFn(tag: { name: string; id: number } | null): string {
    return tag ? tag.name : '';
  }
  trackById = (index: number, tag: { id: number }) => tag.id;

  private _filter(value: string): { name: string; id: number }[] {
    const filterValue = value.toLowerCase();

    return this.allAvailableTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(filterValue) &&
        !this.tags.some((t) => t.name === tag.name)
    );
  }

  ngOnInit() {
    this.tags = [...this.initialTags];

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );

    if (this.allAvailableTags.length === 0) {
      this.noteService.getAllTags().subscribe((tags) => {
        this.allAvailableTags = tags;
        this.updateFilterOptions();
      });
    } else {
      this.updateFilterOptions();
    }
  }

  private updateFilterOptions() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTag = event.option.value;
    if (this.allAvailableTags.some((tag) => tag.id === selectedTag.id)) {
      this.addNewTag(selectedTag);
    }
  }

  addNewTag(tag?: string | { name: string; id: number }): void {
    if (!tag) return;

    if (typeof tag === 'string') {
      const newTagName = tag.trim();
      if (!newTagName) return;

      this.noteService.addTag(newTagName).subscribe({
        next: (response) => {
          this.tags.push(response);
          this.tagAdded.emit(response);
          this.myControl.setValue('');
          this.panelOpenState.set(false);
          this.expansionPanel.close();
        },
        error: (err) => console.error('Error creating new tag', err),
      });
    } else {
      // It's an existing tag from autocomplete
      if (!this.tags.find((t) => t.id === tag.id)) {
        this.tags.push(tag);
        this.tagAdded.emit(tag);
        this.myControl.setValue('');
        this.panelOpenState.set(false);
        this.expansionPanel.close();
      }
    }
  }

  removeTag(tagId: number): void {
    this.tags = this.tags.filter((t) => t.id !== tagId);
    this.tagRemoved.emit(tagId);
  }
}
