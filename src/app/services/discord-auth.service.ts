import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DiscordAuthService {
  private readonly DISCORD_API = 'https://discord.com/api';
  private readonly CLIENT_ID = '1347209912316461210';
  private readonly CLIENT_SECRET = '1pYxSw-lk1myYQeWIvPHvToHEbf_5QAm';
  private readonly REDIRECT_URI = 'http://localhost:4200/auth/callback';
  private readonly SCOPE = 'identify email guilds';

  private jwtHelper = new JwtHelperService();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
  ) {
    console.log(this.platformId);
    if (!isPlatformBrowser(this.platformId)) {
      console.log('hapinees');
      return;
    }

    console.log('Running in browser!');
  }

  /**
   * Initiates the Discord OAuth flow
   */
  login(): void {
    const url = `${this.DISCORD_API}/oauth2/authorize?client_id=${
      this.CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      this.REDIRECT_URI
    )}&response_type=code&scope=${this.SCOPE}`;
    window.location.href = url;
  }

  /**
   * Exchanges authorization code for access token
   */
  getToken(code: string): Observable<any> {
    const payload = new URLSearchParams();
    payload.append('client_id', this.CLIENT_ID);
    payload.append('client_secret', this.CLIENT_SECRET);
    payload.append('grant_type', 'authorization_code');
    payload.append('code', code);
    payload.append('redirect_uri', this.REDIRECT_URI);
    payload.append('scope', 'identify guilds email'); // Add this line with your actual scopes

    return this.http
      .post<any>(`${this.DISCORD_API}/oauth2/token`, payload.toString(), {
        // Remove .toString()
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Remove the Accept-Encoding header
        },
      })
      .pipe(
        catchError((error) => {
          console.error('Error getting token:', error);
          return of(null);
        })
      );
  }

  /**
   * Gets user information from Discord
   */
  getUserInfo(): Observable<any> {
    return this.http.get(`${this.DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${this.getStoredToken()}` },
    });
  }

  /**
   * Refreshes the access token using refresh token
   */
  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('discord_refresh_token');

    if (!refreshToken) {
      this.router.navigate(['/login']);
      return of(null);
    }

    const payload = new URLSearchParams();
    payload.append('client_id', this.CLIENT_ID);
    payload.append('client_secret', this.CLIENT_SECRET);
    payload.append('grant_type', 'refresh_token');
    payload.append('refresh_token', refreshToken);

    return this.http
      .post<any>(`${this.DISCORD_API}/oauth2/token`, payload.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('discord_token', response.access_token);
          localStorage.setItem('discord_refresh_token', response.refresh_token);
          localStorage.setItem(
            'discord_token_expiry',
            (Date.now() + response.expires_in * 1000).toString()
          );
        }),
        catchError((error) => {
          console.error('Error refreshing token:', error);
          
          return of(null);
        })
      );
  }

  /**
   * Logs the user out
   */
  

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      console.log('joyness');
      return false;
    }
    const token = this.getStoredToken();
    console.log(token);
    if (!token) return false;

    const expiryStr = localStorage.getItem('discord_token_expiry');
    if (!expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    if (Date.now() >= expiry) {
      // Token is expired, attempt to refresh
      this.refreshToken().subscribe();
      return false;
    }

    return true;
  }

  /**
   * Gets the stored token
   */
  private getStoredToken(): string | null {
    return isPlatformBrowser(this.platformId)
      ? localStorage.getItem('discord_token')
      : null;
  }
}
