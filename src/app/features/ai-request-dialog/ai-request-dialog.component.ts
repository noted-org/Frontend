import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ai-request-dialog',
  standalone: true,
  imports: [],
  templateUrl: './ai-request-dialog.component.html',
  styleUrl: './ai-request-dialog.component.css'
})
export class AiRequestDialogComponent {
  
  constructor(public dialogRef: MatDialogRef<AiRequestDialogComponent>, 
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }
  ) {}



  generateSummary() {
    this.dialogRef.close('generate');
  }

  closeDialog(){
    this.dialogRef.close();
  }
}
