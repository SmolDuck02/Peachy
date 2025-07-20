// src/app/services/keep-alive.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class KeepAliveService {
  constructor(private http: HttpClient) {}

  /**
   * Pings the backend to keep the session alive
   */
  pingBackend() {
    this.http.get(`${environment.API_ENDPOINT}/ping`).subscribe({
      next: (res) => console.log('Backend pinged:', res),
      error: (err) => console.error('Backend ping failed:', err),
    });
  }
}