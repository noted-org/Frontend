import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User } from '../../types/user.type';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.css'
})
export class UserDialogComponent {

  constructor(public dialogRef: MatDialogRef<UserDialogComponent>, 
      @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }
  ) {}

  closeDialog(){
    this.dialogRef.close();
  }

}
