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
    CommonModule,
    MatIconModule
  ],
  providers: [UserService],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private _formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private UserService = inject(UserService);

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
  
  isFormValid() {
    return this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid && this.fourthFormGroup.valid;
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
        if(savedUser){
          // automatische _id Generierung?
          localStorage.setItem('id', (savedUser.id || 0).toString());

          //routing zu home einbauen
          this.router.navigate([`/home/${localStorage.getItem('id')}`]);

        }
      }catch(error){
        console.error("Error creating User");
      }
    }else{
      console.error("newUser not defined")
    }
  }

  toLogin(): void{
    this.router.navigate([`/login`]);
  }
}
