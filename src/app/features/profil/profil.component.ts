import { Component, Input, ChangeDetectorRef, inject} from '@angular/core';
import { User } from '../../shared/types/user.type';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [MatFormFieldModule, CommonModule, MatCardModule, MatStepperModule, FormsModule, ReactiveFormsModule, MatTooltipModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.css',
  providers: [UserService]
})
export class ProfilComponent {
  @Input() id?: string;
  userIdFromUrl: string | null = null;
  sameUser: boolean = false;
  editForm: boolean = false;
  normalForm: boolean = true;
  
  private _formBuilder = inject(FormBuilder);
  isLinear = false;


  /*private ApiService = inject (ApiService);
  private _snackBar = inject (MatSnackBar);
  private router = inject(Router);*/

  errorMessage: string | null = null;
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ){}

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', [Validators.required,  Validators.pattern('^[A-Za-z]+$')]],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\W_]+$')]],
  });
  /*thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', [Validators.required, Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[\\W_]).{6,}$')]],
  });*/
  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')]],
  });
  
  isFormValid() {
    return this.firstFormGroup.valid && this.secondFormGroup.valid && this.fourthFormGroup.valid;
  }

 
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

      this.firstFormGroup.patchValue({firstCtrl: this.user?.nickname || ''});
      this.secondFormGroup.patchValue({secondCtrl: this.user?.username || ''});
      this.fourthFormGroup.patchValue({fourthCtrl: this.user?.email || ''});

      this.cdRef.detectChanges();
    }catch(error){
      console.error('Error while loading User Data: ', error);
    }
  }

  emailCorrect(): Boolean{
    const mail = this.fourthFormGroup.get('fourthCtrl')?.value;
    return !!mail && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail);
  }

  changeData(){
    if(this.user){
      this.firstFormGroup.patchValue({firstCtrl: this.user.nickname});
      this.secondFormGroup.patchValue({secondCtrl: this.user.username});
      this.fourthFormGroup.patchValue({fourthCtrl: this.user.email});
    }
    this.normalForm = false;
    this.editForm = true;
  }
  async saveChanges(){
    const nickname = this.firstFormGroup.get('firstCtrl')?.value || '';
    const username = this.secondFormGroup.get('secondCtrl')?.value || '';
    const email = this.fourthFormGroup.get('fourthCtrl')?.value || '';

    try{
      const updatedUser = await this.userService.updateUser(localStorage.getItem('id') || '', nickname, username, email);

      this.firstFormGroup.patchValue({ firstCtrl: nickname });
      this.secondFormGroup.patchValue({ secondCtrl: username });
      this.fourthFormGroup.patchValue({ fourthCtrl: email });

      if(updatedUser){
        this.user = updatedUser;
      }

      this.editForm=false;
      this.normalForm=true;
      console.log("Profil erfolgreich aktualisiert.");
    } catch (error){
      console.error("Fehler beim Speichern der Änderungen:", error);
    }
  }
  
  discardChanges(){
    this.editForm = false;
    this.normalForm = true;
  }
}