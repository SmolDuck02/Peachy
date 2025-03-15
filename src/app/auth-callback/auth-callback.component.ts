import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DiscordAuthService } from '../services/discord-auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `<div class="loading">Authenticating with Discord...</div>`,
  styles: [
    `
      .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-size: 18px;
      }
    `,
  ],
  imports: [CommonModule],
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: DiscordAuthService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code && isPlatformBrowser(this.platformId)) {
        console.log('Running on browser, fetching token...');
        this.authService.getToken(code).subscribe((response) => {
          console.log('Token received in browser:', response);
          localStorage.setItem('discord_token', response.access_token);
          localStorage.setItem('discord_refresh_token', response.refresh_token);
          localStorage.setItem(
            'discord_token_expiry',
            (Date.now() + response.expires_in * 1000).toString()
          );
          console.log(localStorage);
          this.router.navigate(['/dashboard']); // Redirect after login
        });
      }
    });
  }

  
}
