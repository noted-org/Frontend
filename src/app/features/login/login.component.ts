import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { UserService } from '../../shared/services/user.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LoginUser } from '../../shared/types/user.type';
import * as sha512 from 'crypto-js';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatCardModule, 
    MatButtonModule,
    MatIcon,
    MatStepperModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [UserService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true; // Steuert die Sichtbarkeit des Passworts
  private router = inject (Router);
  
  constructor(
    private fb: FormBuilder,
    private UserService: UserService, // Angenommen, du hast einen AuthService
    private snackBar: MatSnackBar
  ) {
    // Initialisiere das Login-Formular
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  async login(): Promise<void>{
    const loginData = this.loginForm.value;
    if(loginData.username && loginData.password){
      try{
        let loginUser: LoginUser | undefined;
        const uname = loginData.username;
        const upass = loginData.password;
        loginUser = {
          username: uname,
          password: sha512.SHA512(upass).toString(),
        };
        console.log(loginUser);
        
        const savedUser = await this.UserService.loginUser(loginUser);
        if(savedUser && savedUser.id){
          localStorage.setItem('id', (savedUser?.id).toString());
          localStorage.setItem('pw', loginUser.password);

          this.router.navigate([`/home/${localStorage.getItem('id')}`]);
        }else{
          console.error("Error login in.");
        }
      }catch(error){
        if (error instanceof Response && error.status === 403) {
          this.snackBar.open('Wrong credentials. Please check your input for typos.', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }else{
          this.snackBar.open('There was an Error login in. Please check the fields and try again.', 'Close', {
            duration: 5000,
            panelClass: ['snackbar-warning']
          });
        }
      }

    }else{
      alert("Gebe deine Anmeldedaten ein.");
    }
  }
  toRegister(): void{
    this.router.navigate([`/register`]);
  }
}
