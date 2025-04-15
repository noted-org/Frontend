import { Component, inject, signal, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
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

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatAutocompleteModule, MatChipsModule, MatExpansionModule, MatFormFieldModule, MatIconModule],
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.css'
})
export class TagInputComponent implements OnInit{
  @Input() initialTags: {name: string, id: number}[] = [];
  @Input() allAvailableTags: string[] = [];
  @Output() tagAdded = new EventEmitter<{name: string, id: number}>();
  @Output() tagRemoved = new EventEmitter<number>();


  @ViewChild('expansionPanel') expansionPanel!: ElementRef;
  @ViewChild('expansionPanelHeader') expansionPanelHeader!: ElementRef;
  
  private noteService = inject(NoteService);
  
  readonly panelOpenState = signal(false);

  tags: {name: string, id: number}[] = [];
  allTags: string[] = []; 
  newTagName = new FormControl('');
  options: string[] = this.allTags;


  myControl = new FormControl('');
  filteredOptions!: Observable<string[]>;


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allAvailableTags.filter(option => 
      option.toLowerCase().includes(filterValue) &&
      !this.tags.some(t => t.name === option)
    );  
  }

  ngOnInit() {
    this.tags = [...this.initialTags];

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
    
    if (this.allAvailableTags.length === 0) {
      this.noteService.getAllTags().subscribe(tags => {
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
      map(value => this._filter(value || ''))
    );
  }

  onTagSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedTag = event.option.value;
    if (this.allAvailableTags.includes(selectedTag)) {
      this.addNewTag(selectedTag);
    }
  }
  

  addNewTag(tagName?: string): void {
    const newTag = tagName || this.myControl.value?.trim();
    if (!newTag) return;

    this.noteService.addTag(newTag).subscribe({
      next: (response) => {
        this.tags.push(response);
        this.tagAdded.emit(response);
        this.myControl.setValue('');
      },
      error: (err) => console.error('Error creating new tag', err)
    });
  }

  removeTag(tagId: number): void {
    this.tags = this.tags.filter(t => t.id !== tagId);
    this.tagRemoved.emit(tagId);
  }
}
