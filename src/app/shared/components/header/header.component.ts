import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private router = inject(Router);

  goToHome(): void{
    this.userId = localStorage.getItem('id');
    console.log("clicked");
    this.router.navigate([`/home/${this.userId}`]);
  }

  userId: String | null = null;
  goToProfile(): void{
    this.userId = localStorage.getItem('id');

    this.router.navigate([`/profile/${this.userId}`]).then(()=> {
      window.location.reload();
    });
  }

  logout(): void{
    localStorage.removeItem('id');
    this.router.navigate([`/login`]).then(()=> {
      window.location.reload();
    });
  }

}
