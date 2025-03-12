import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  user,
  authState,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);

  user$ = user(this.auth);
  authState$ = authState(this.auth);

  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error during Google sign in', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during sign out', error);
      throw error;
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.authState$.pipe(map((user) => !!user));
  }
}
