// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';
import { DiscordAuthService } from '../services/discord-auth.service';
import {
  UserButtonComponent,
  UserSettings,
} from '../user-button/user-button.component';

interface Chat {
  id: number;
  user_id: string;
  role: string;
  message: string;
  timestamp: string;
}

interface Checkin {
  id: number;
  mood: string;
  message_id: number;
}

interface Work {
  id: number;
  type: string;
  message_id: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, UserButtonComponent],
  templateUrl: './dashobard.component.html',
  styleUrls: ['./dashobard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chats: Chat[] = [];
  checkins: Checkin[] = [];
  works: Work[] = [];

  recentCheckins: any[] = [];
  moodDistribution: any = {};
  workTypeDistribution: any = {};

  isLoading = true;
  selectedPeriod = 'week';

  constructor(private http: HttpClient) {}
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
        const formattedUser = {
          displayName: user.global_name,
          email: user.email,
          uid: user.id,
        };
        this.user = formattedUser as Partial<User>;
        this.loadData();
      });
    } else {
      this.authService.user$.subscribe((user) => {
        this.user = user;
        if (user) {
          this.loadUserSettings();
          this.loadData();
        }
      });
    }
  }

  loadData(): void {
    this.isLoading = true;
    console.log(this.user, 'uu');

    // Make API calls to fetch data from all tables
    forkJoin({
      checkins: this.http
        .get<Checkin[]>(
          `${environment.API_ENDPOINT}/checkins/checkins-by-mood/${this.user?.uid}`
        )
        .pipe(
          catchError((error) => {
            console.error('Error fetching checkins:', error);
            return of([{ id: 2, mood: 'lethargic', message_id: 1 }]); // Fallback mock data
          })
        ),
      works: this.http
        .get<Work[]>(
          `${environment.API_ENDPOINT}/works/works-by-type/${this.user?.uid}`
        )
        .pipe(
          catchError((error) => {
            console.error('Error fetching works:', error);
            return of([{ id: 2, type: 'personal', message_id: 1 }]); // Fallback mock data
          })
        ),
    }).subscribe((data) => {
      this.checkins = data.checkins;
      this.works = data.works;

      this.processData();
      this.isLoading = false;
    });
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

  processData(): void {
    // Process recent checkins with their associated messages
    this.recentCheckins = this.checkins
      .map((checkin) => {
        const relatedChat = this.chats.find(
          (chat) => chat.id === checkin.message_id
        );
        return {
          ...checkin,
          message: relatedChat?.message || '',
          timestamp: relatedChat?.timestamp || '',
          user_id: relatedChat?.user_id || '',
        };
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    // Calculate mood distribution
    this.moodDistribution = {};
    this.checkins.forEach((checkin) => {
      this.moodDistribution[checkin.mood] =
        (this.moodDistribution[checkin.mood] || 0) + 1;
    });

    // Calculate work type distribution
    this.workTypeDistribution = {};
    this.works.forEach((work) => {
      this.workTypeDistribution[work.type] =
        (this.workTypeDistribution[work.type] || 0) + 1;
    });
  }

  changePeriod(period: string): void {
    this.selectedPeriod = period;
    this.loadData();
  }

  // Add these methods to the DashboardComponent class

  getKeyValuePairs(obj: any): { key: string; value: number }[] {
    return Object.keys(obj)
      .map((key) => ({
        key,
        value: obj[key],
      }))
      .sort((a, b) => b.value - a.value);
  }

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  getTotalCount(obj: any): number {
    return Object.values(obj).reduce(
      (sum: any, current: any) => sum + current,
      0
    ) as number;
  }
}
