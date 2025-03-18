import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { of, switchMap, take } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { DiscordAuthService } from './services/discord-auth.service';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashobard/dashobard.component').then(
        (c) => c.DashboardComponent
      ),
    canMatch: [AuthGuard],
  },
  {
    path: 'login',

    canMatch: [
      () => {
        const authService = inject(AuthService);
        const discordAuthService = inject(DiscordAuthService);
        const router = inject(Router);
        if (!discordAuthService.isAuthenticated()) {
          return true;
        }
        router.navigateByUrl('/dashboard');
        return false;
        return authService.isLoggedIn().pipe(
          take(1),
          switchMap((isLoggedIn) => {
            if (isLoggedIn || discordAuthService.isAuthenticated()) {
              // Using navigateByUrl with replaceUrl to completely replace the current navigation
              router.navigateByUrl('/dashboard');
              return of(false);
            }
            return of(true);
          })
        );
      },
    ],
    loadComponent: () =>
      import('./login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./auth-callback/auth-callback.component').then(
        (c) => c.AuthCallbackComponent
      ),
  },

  { path: '**', redirectTo: '/dashboard' },
];
