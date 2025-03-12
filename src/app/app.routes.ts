import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashobard/dashobard.component').then(
        (c) => c.DashboardComponent
      ),
    canActivate: [AuthGuard],
  },
];