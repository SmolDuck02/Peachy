import { inject } from '@angular/core';
import { Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
import { DiscordAuthService } from '../services/discord-auth.service';

export const AuthGuard = () => {
  // const authService = inject(AuthService);
  const router = inject(Router);
  const discordAuthService = inject(DiscordAuthService);

  if (discordAuthService.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
  // return authService.isLoggedIn().pipe(
  //   take(1),
  //   map((isLoggedIn) => {
  //     setTimeout(() => {
  //       if (isLoggedIn || discordAuthService.isAuthenticated()) {
  //         return true;
  //       }
  //       router.navigate(['/login']);
  //       return false;
  //       // } else {
  //       //   return false;
  //       // }
  //     }, 1000);
  //   })
  // );
};
