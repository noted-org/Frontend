import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Note } from '../../shared/types/note.type';

@Component({
  selector: 'app-summary-dialog',
  standalone: true,
  imports: [],
  templateUrl: './summary-dialog.component.html',
  styleUrl: './summary-dialog.component.css'
})
export class SummaryDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SummaryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { updatedNote: Note }
  ) {}

  replaceNote() {
    this.dialogRef.close('replace');
  }

  saveAsNew() {
    this.dialogRef.close('saveAsNew');
  }

  discard() {
    this.dialogRef.close('discard');
  }
}
