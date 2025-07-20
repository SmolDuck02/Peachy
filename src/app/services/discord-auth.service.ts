import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DiscordAuthService {
  private readonly DISCORD_API = 'https://discord.com/api';
  private readonly BACKEND_API = environment.API_ENDPOINT;
  private readonly REDIRECT_URI = `${environment.REDIRECT_URI}/auth/callback`;
  private readonly SCOPE = 'identify email guilds';

  private jwtHelper = new JwtHelperService();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private router: Router,
  ) {
    console.log('Running in browser!');
  }

  /**
   * Initiates the Discord OAuth flow
   */
  login(): void {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('Discord login can only be initiated in the browser');
      return;
    }
    console.log(this.REDIRECT_URI)
    const DISCORD_CLIENT_ID = "1347209912316461210";
    const url = `${this.DISCORD_API}/oauth2/authorize?client_id=${
      DISCORD_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      this.REDIRECT_URI
    )}&response_type=code&scope=${this.SCOPE}`;
      window.location.href = url;
  }

  /**
   * Exchanges authorization code for access token
   */
  /**
   * Exchanges authorization code for access token (calls NestJS backend)
   */
  getToken(code: string): Observable<any> {
    return this.http.post(`${this.BACKEND_API}/discord/token`, { code }).pipe(
      tap((res: any) => {
        localStorage.setItem('discord_token', res.access_token);
        localStorage.setItem('discord_refresh_token', res.refresh_token);
        localStorage.setItem(
          'discord_token_expiry',
          (Date.now() + res.expires_in * 1000).toString()
        );
      }),
      catchError((err) => {
        console.error('Error getting token:', err);
        return of(null);
      })
    );
  }


  /**
   * Gets user information from Discord using stored access token
   */
  getUserInfo(): Observable<any> {
    const token = this.getStoredToken();
    if (!token) return of(null);

    return this.http.get(`${this.DISCORD_API}/users/@me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * Logs the user out
   */
  // logout(): void {
  //     localStorage.removeItem('discord_token');
  //     localStorage.removeItem('discord_refresh_token');
  //     localStorage.removeItem('discord_token_expiry');
  //     this.router.navigate(['/login']);
  // }

  /**
   * Checks if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    const token = this.getStoredToken();
    if (!token) return false;

    const expiryStr = localStorage.getItem('discord_token_expiry');
    if (!expiryStr) return false;

    const expiry = parseInt(expiryStr, 10);
    return Date.now() < expiry;
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
