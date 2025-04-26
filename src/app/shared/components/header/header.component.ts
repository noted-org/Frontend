import { Component, inject } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { Router } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule, CommonModule, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);

  get loggedIn(): boolean {
    return !!localStorage.getItem('id');
  }

  goToHome(): void{
    if(this.loggedIn){
      this.userId = localStorage.getItem('id');
      console.log("clicked");
      this.router.navigate([`/home/${this.userId}`]);
    }
    else{
      this.router.navigate([``]);
    }
  }

  userId: String | null = null;
  goToProfile(): void{
    this.userId = localStorage.getItem('id');

    this.router.navigate([`/profile/${this.userId}`]);
  }
  goToLogin(): void{
    this.router.navigate([`/login`]);
  }
  goToRegister(): void{
    this.router.navigate([`/register`]);
  }

  logout(): void{
    localStorage.removeItem('id');
    localStorage.removeItem('pw');
    this.router.navigate([``]);
  }

}
