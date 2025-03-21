import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfilComponent } from './features/profil/profil.component';
import { HomeComponent } from './features/home/home.component';
import { InfopageComponent } from './features/infopage/infopage.component';

export const routes: Routes = [
    {
        path: '',
        component: InfopageComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'profile/:id',
        component: ProfilComponent
    },
    {
        path: 'home/:id',
        component: HomeComponent
    }
];
