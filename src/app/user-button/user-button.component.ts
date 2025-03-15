import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { User } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { AuthService } from '../services/auth.service';
import { DiscordAuthService } from '../services/discord-auth.service';

export interface UserSettings {
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
}
@Component({
  selector: 'app-user-button',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './user-button.component.html',
  styleUrl: './user-button.component.scss',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px)',
          height: 0,
        }),
        animate(
          '200ms ease-out',
          style({
            opacity: 1,
            transform: 'translateY(0)',
            height: '*',
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({
            opacity: 0,
            transform: 'translateY(-10px)',
            height: 0,
          })
        ),
      ]),
    ]),
    trigger('settingsAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class UserButtonComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private discordAuthService = inject(DiscordAuthService);
  private platformId = inject(PLATFORM_ID);

  user: Partial<User> | null = null;
  isDropdownOpen = false;
  showSettings = false;

  userSettings: UserSettings = {
    emailNotifications: true,
    darkMode: false,
    language: 'en',
    timezone: 'UTC',
  };

  ngOnInit(): void {
    if (this.discordAuthService.isAuthenticated()) {
      this.discordAuthService.getUserInfo().subscribe((user) => {
        console.log('Authenticated user:', user);
        const formattedUser = {
          displayName: user.global_name,
          email: user.email,
          uid: user.id,
        };
        this.user = formattedUser as Partial<User>;
        // this.router.navigate(['/dashboard']);
      });
    } else {
      this.authService.user$.subscribe((user) => {
        this.user = user;
        if (user) {
          this.loadUserSettings();
        }
      });
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (!this.isDropdownOpen) {
      this.showSettings = false;
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.showSettings = false;
  }

  getUserInitials(): string {
    if (!this.user?.displayName) return '?';

    const names = this.user.displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }

  async login(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
    
    } catch (error: any) {
      console.error('Login failed', error);
    
    }
  }

  async logout(): Promise<void> {
    try {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('discord_token');
        localStorage.removeItem('discord_refresh_token');
        localStorage.removeItem('discord_token_expiry');
      }
      await this.authService.logout();
      this.isDropdownOpen = false;
   
    } catch (error: any) {
      console.error('Logout failed', error);
   
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
    this.isDropdownOpen = false;
  }

  navigateToProfile(): void {
    // Replace with your actual profile route when available
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
  }

  // User settings methods
  loadUserSettings(): void {
    // In a real app, load from a database or localStorage
    const savedSettings = localStorage.getItem(
      `user_settings_${this.user?.uid}`
    );
    if (savedSettings) {
      try {
        this.userSettings = JSON.parse(savedSettings);
      } catch (e) {
        console.error('Error parsing user settings', e);
      }
    }
  }

  saveSettings(): void {
    // In a real app, save to a database
    try {
      if (this.user?.uid) {
        localStorage.setItem(
          `user_settings_${this.user.uid}`,
          JSON.stringify(this.userSettings)
        );
      
      }
    } catch (e) {
      console.error('Error saving user settings', e);
     
    }
  }
}
