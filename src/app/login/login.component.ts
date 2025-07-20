import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { DiscordAuthService } from '../services/discord-auth.service';
import { KeepAliveService } from '../services/keep-alive.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  constructor(
    private discordAuthService: DiscordAuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  // private authService = inject(AuthService);
  private keepAliveService = inject(KeepAliveService);
  private particleElements: HTMLElement[] = [];

  
  ngAfterViewInit(): void {
    this.keepAliveService.pingBackend();

    if (isPlatformBrowser(this.platformId)) {
      // Ensure we only run this code in the browser
      setTimeout(() => {
        this.createParticles();
      }, 100); // Give DOM time to fully render
    }
  }

  ngOnDestroy(): void {
    // Clean up particles when component is destroyed
    this.particleElements.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
  }

  async login() {
    try {
      // await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  loginWithDiscord(): void {
    this.discordAuthService.login();
  }

  // Create floating particles
  createParticles(): void {
    const container = document.getElementById('particles');
    if (!container) return;

    container.innerHTML = ''; // Clear any existing particles
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      // Random positions
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 3 + 1;
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 5;

      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;

      container.appendChild(particle);
      this.particleElements.push(particle);
    }

    console.log('Particles created:', this.particleElements.length);
  }
}
