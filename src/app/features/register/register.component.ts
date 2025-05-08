import { Component, inject, NgModule, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateUser } from '../../shared/types/user.type';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../shared/services/user.service';
import * as sha512 from 'crypto-js';
import { MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UserDialogComponent } from '../../shared/components/user-dialog/user-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatCardModule, 
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSnackBarModule,
    CommonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  providers: [UserService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private UserService = inject(UserService);
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ){}
  hide = signal(true);
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', [Validators.required,  Validators.pattern('^[A-Za-z]+$')]],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\W_]+$')]],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[\\W_]).{6,}$')]],
  });
  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
  });
  fifthFormGroup = this._formBuilder.group({
    agbAccepted: [false, Validators.requiredTrue]
  });
  isNameValid(){
    return this.firstFormGroup.valid;
  }
  isUsernameValid(){
    return this.secondFormGroup.valid;
  }
  isEmailValid(){
    return this.fourthFormGroup.valid;
  }
  isPasswordValid(){
    return this.thirdFormGroup.valid;
  }
  
  isFormValid() {
    return this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid && this.fourthFormGroup.valid && this.fifthFormGroup.valid;
  }
  hasMinLength(): boolean {
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;
    return !!password && password.length >= 6;
  }

  
  hasLetter(): boolean {
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;
    return !!password && /[A-Za-z]/.test(password);
  }

  
  hasNumber(): boolean {
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;
    return !!password && /\d/.test(password);
  }

  
  hasSpecialChar(): boolean {
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;
    return !!password && /[\W_]/.test(password);
  }
  emailCorrect(): Boolean{
    const mail = this.fourthFormGroup.get('fourthCtrl')?.value;
    return !!mail && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail);
  }

  isLinear = false;

  async register(): Promise<void>{
    const nickname = this.firstFormGroup.get('firstCtrl')?.value;
    const username = this.secondFormGroup.get('secondCtrl')?.value;
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;
    const email = this.fourthFormGroup.get('fourthCtrl')?.value;
    const agb = ""

    let newUser: CreateUser | undefined;

    if (nickname && username && password && email){
      newUser = {
        nickname: nickname,
        password: sha512.SHA512(password).toString(),
        username: username,
        email: email,
      };
    }
    console.log(newUser);
    
    if(newUser){
      try{
        const savedUser = await this.UserService.createUser(newUser);
        if(savedUser && savedUser.id){
          // automatische _id Generierung?
          localStorage.setItem('id', (savedUser.id).toString());
          localStorage.setItem('pw', newUser.password);

          //routing zu home einbauen
          this.router.navigate([`/home/${localStorage.getItem('id')}`]);

        }
      }catch(error){
        if (error instanceof Response && error.status === 409) {
          this.snackBar.open('This username is already taken. Please choose a different Username.', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }else{
          this.snackBar.open('There was an Error creating a new User. Please check the fields and try again.', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }
      }
    }else{
      console.error("newUser not defined")
    }
  }

  toLogin(): void{
    this.router.navigate([`/login`]);
  }

  openAgb(){
    const agbHtml = `
    <strong>§1 Scope</strong><br>
    These Terms and Conditions apply to the use of the web application “Noted.” By using the app, you agree to be bound by these terms.<br><br>

    <strong>§2 Description of Service</strong><br>
    “Noted” is a web-based note-taking app that allows users to save, manage, and retrieve personal notes. There is no guarantee of continuous availability or specific features.<br><br>

    <strong>§3 Usage</strong><br>
    A registration is required to use the app. By saving notes, you consent to their processing within the scope of this application.<br><br>

    <strong>§4 Disclaimer of Liability</strong><br>
    The provider assumes no liability for data loss, technical issues, or any damages that may result from the use of this app. Usage is at your own risk.<br><br>

    <strong>§5 Privacy</strong><br>
    The app only stores the notes you input. No personal tracking or third-party sharing takes place. Your data is your own.<br><br>

    <strong>§6 Changes to the Terms</strong><br>
    The provider reserves the right to modify these Terms and Conditions at any time. Changes will be published on this page. Continued use of the app constitutes acceptance of the modified terms.<br><br>

    <strong>§7 Complete Transfer of Intellectual Property</strong><br>
    By clicking the "I Agree" button, the user enthusiastically and wholeheartedly agrees to transfer all present, past, and future intellectual property – including, but not limited to, patents, ideas for flying vehicles, groundbreaking toast spreads, and radically new ways of taking notes – to the creators of the “Noted” app.<br>`;

    const _popup = this.dialog.open(UserDialogComponent, {
      restoreFocus: true,
      autoFocus: false,
      width: '400px',
      height: '700px',
      data: {
        title: 'Terms & Conditions:',
        content: agbHtml,
      },
    });
  }
}
