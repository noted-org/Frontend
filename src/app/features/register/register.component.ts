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
  
  isFormValid() {
    return this.firstFormGroup.valid && this.secondFormGroup.valid && this.thirdFormGroup.valid;
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

  isLinear = false;

  async register(): Promise<void>{
    const name = this.firstFormGroup.get('firstCtrl')?.value;
    const username = this.secondFormGroup.get('secondCtrl')?.value;
    const password = this.thirdFormGroup.get('thirdCtrl')?.value;

    let newUser: CreateUser | undefined;

    if (name && username && password){
      newUser = {
        name,
        password,
        username,
      };
    }
    
    if(newUser){
      try{
        const savedUser = await this.UserService.createUser(newUser);
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
