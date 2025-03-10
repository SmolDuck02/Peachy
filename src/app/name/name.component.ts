// name.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  provideHttpClient,
} from '@angular/common/http';

@Component({
  selector: 'app-name',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="name-container">
      <h2>User Name</h2>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading name...</p>
      </div>

      <div *ngIf="error" class="error">
        <p>{{ error }}</p>
        <button (click)="fetchName()">Try Again</button>
      </div>

      <div *ngIf="!loading && !error" class="name-card">
        <div *ngIf="name" class="name-display">
          <p>
            Hello, <strong>{{ name }}</strong
            >!
          </p>
        </div>
        <button (click)="fetchName()" class="refresh-button">Refresh</button>
      </div>
    </div>
  `,
  styles: [
    `
      .name-container {
        font-family: Arial, sans-serif;
        max-width: 400px;
        margin: 20px auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background-color: white;
      }

      h2 {
        color: #333;
        margin-top: 0;
        margin-bottom: 20px;
        text-align: center;
      }

      .name-card {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .name-display {
        font-size: 18px;
        margin-bottom: 20px;
        text-align: center;
      }

      button {
        padding: 8px 16px;
        background-color: #3f51b5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      button:hover {
        background-color: #303f9f;
      }

      .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 20px 0;
      }

      .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid rgba(63, 81, 181, 0.2);
        border-top-color: #3f51b5;
        border-radius: 50%;
        animation: spin 1s ease-in-out infinite;
        margin-bottom: 10px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .error {
        color: #d32f2f;
        text-align: center;
        margin: 20px 0;
      }

      .error button {
        margin-top: 10px;
        background-color: #d32f2f;
      }

      .error button:hover {
        background-color: #b71c1c;
      }
    `,
  ],
})
export class NameComponent implements OnInit {
  name: string | null = null;
  loading = false;
  error: string | null = null;

  // Replace with your NestJS API URL
  private apiUrl = 'http://localhost:3000/api/name';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // this.fetchName();
  }

  fetchName(): void {
    this.loading = true;
    this.error = null;

    this.http.get<{ name: string }>(this.apiUrl).subscribe({
      next: (response) => {
        this.name = response.name;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching name:', err);
        this.error = 'Failed to load name. Please try again.';
        this.loading = false;
      },
    });
  }
}
