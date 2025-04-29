import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-ai-request-dialog',
  standalone: true,
  imports: [],
  templateUrl: './ai-request-dialog.component.html',
  styleUrl: './ai-request-dialog.component.css'
})
export class AiRequestDialogComponent {
  
  constructor(public dialogRef: MatDialogRef<AiRequestDialogComponent>) {}



  generateSummary() {
    this.dialogRef.close('generate');
  }

  closeDialog(){
    this.dialogRef.close();
  }
}
