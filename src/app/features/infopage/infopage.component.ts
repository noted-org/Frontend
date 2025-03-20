import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-infopage',
  standalone: true,
  imports: [],
  templateUrl: './infopage.component.html',
  styleUrl: './infopage.component.css'
})
export class InfopageComponent {
  private router = inject(Router);
  toRegister(): void{
    this.router.navigate([`/register`]);
  }
}
