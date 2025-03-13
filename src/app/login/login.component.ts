import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DiscordAuthService } from '../services/discord-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  constructor(private discordAuthService: DiscordAuthService) {}

  private authService = inject(AuthService);

  async login() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  loginWithDiscord(): void {
    this.discordAuthService.login();
  }
}
