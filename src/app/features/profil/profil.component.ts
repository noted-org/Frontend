import { Component, Input, ChangeDetectorRef } from '@angular/core';
import { User } from '../../shared/types/user.type';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
  providers: [UserService]
})
export class ProfilComponent {
  @Input() id?: string;
  userIdFromUrl: string | null = null;
  sameUser: boolean = false;
  editForm: boolean = false;


  /*private ApiService = inject (ApiService);
  private _snackBar = inject (MatSnackBar);
  private router = inject(Router);*/

  errorMessage: string | null = null;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    //private dialog: MatDialog,
    private cdRef: ChangeDetectorRef
  ){}

 
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => { 
      this.userIdFromUrl = params.get('id');
      console.log('User ID aus der URL:', this.userIdFromUrl);
    });
    if(this.userIdFromUrl === localStorage.getItem('id')){
      this.sameUser = true;
    }
    if(this.userIdFromUrl){
      this.fetchUserById(this.userIdFromUrl);
    }
    console.log(this.userIdFromUrl);

    this.cdRef.detectChanges();
  } 

  private async fetchUserById(userId: string){
    const userIdAsNumber = parseInt(userId, 10);
    try{
      this.user = await this.userService.getUser(userIdAsNumber);
      console.log("User Daten: ", this.user);
    }catch(error){
      console.error('Error while loading User Data: ', error);
    }
  }

  changeData(){
    this.editForm = true;
  }
  saveChanges(nickname: string, email: string){
  
    const updatedUser = this.userService.updateUser(localStorage.getItem('id')||'', nickname, email).then(()=>{
      window.location.reload();
      this.editForm = false;
    });
    window.location.reload();
    console.log(updatedUser);
  }
  discardChanges(){
    this.editForm = false;
  }
}