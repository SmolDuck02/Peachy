// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ModalButtonComponent } from '../modal-button/modal-button.component';
import { MoodChartComponent } from '../mood-chart/mood-chart.component';
import { AuthService } from '../services/auth.service';
import { DiscordAuthService } from '../services/discord-auth.service';
import { KeepAliveService } from '../services/keep-alive.service';
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
  message?: string; // Add these if they're coming from the API
  timestamp?: string; // Add these if they're coming from the API
  user_id?: string;
}

interface Work {
  id: number;
  type: string;
  message_id: number;
  message?: string; // Add these if they're coming from the API
  timestamp?: string; // Add these if they're coming from the API
  user_id?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    UserButtonComponent,
    ModalButtonComponent,
    MoodChartComponent
  ],
  templateUrl: './dashobard.component.html',
  styleUrls: ['./dashobard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chats: Chat[] = [];
  allCheckins: Checkin[] = [];
  allWorks: Work[] = [];

  recentCheckins: any[] = [];
  recentWorks: any[] = [];
  moodDistribution!: {
    title: string;
    labels: string[];
    values: number[];
  };

  workTypeDistribution!: {
    title: string;
    labels: string[];
    values: number[];
  };

  isLoading = true;
  selectedPeriod = 'week';

  constructor(private http: HttpClient) {}
  private authService = inject(AuthService);
  private router = inject(Router);
  private discordAuthService = inject(DiscordAuthService);
  private keepAliveService = inject(KeepAliveService);
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
    this.keepAliveService.pingBackend();
    
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

    // Make API calls to fetch data from all tables
    forkJoin({
      allCheckins: this.http
        .get<Checkin[]>(
          `${environment.API_ENDPOINT}/checkins/checkins-by-mood/${this.user?.uid}`
        )
        .pipe(
          catchError((error) => {
            console.error('Error fetching checkins:', error);
            return of([{ id: 2, mood: 'lethargic', message_id: 1 }]); // Fallback mock data
          })
        ),
      allWorks: this.http
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
      this.allCheckins = data.allCheckins;
      this.allWorks = data.allWorks;
    
      this.filterDataByPeriod();
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

  mapToChartData(record: Record<string, number>, title: string): {
    title: string;
    labels: string[];
    values: number[];
  } {
    const labels = Object.keys(record);
    const values = Object.values(record);
    return { title, labels, values };
  }

  filterDataByPeriod() {
    const now = new Date();

    this.recentCheckins = this.allCheckins.filter((checkin) => {
      const checkinDate = new Date(checkin.timestamp || new Date());
      switch (this.selectedPeriod) {
        case 'day':
          return (
            checkinDate.toDateString() === now.toDateString()
          );
        case 'week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return checkinDate >= startOfWeek && checkinDate <= endOfWeek;
        }
        case 'month':
          return (
            checkinDate.getMonth() === now.getMonth() &&
            checkinDate.getFullYear() === now.getFullYear()
          );
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());

    this.recentWorks = this.allWorks.filter((work) => {
      const workDate = new Date(work.timestamp || new Date());
      switch (this.selectedPeriod) {
        case 'day':
          return workDate.toDateString() === now.toDateString();
        case 'week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return workDate >= startOfWeek && workDate <= endOfWeek;
        }
        case 'month':
          return (
            workDate.getMonth() === now.getMonth() &&
            workDate.getFullYear() === now.getFullYear()
          );
        case 'all':
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());

    this.moodDistribution = this.mapToChartData(
      this.calculateDistribution(this.recentCheckins, 'mood'),
      'Mood Distribution'
    );

    this.workTypeDistribution = this.mapToChartData(
      this.calculateDistribution(this.recentWorks, 'type'),
      'Work Type Distribution'
    );

  }
  
  calculateDistribution<T extends Record<string, any>>(data: T[], key: keyof T): Record<string, number> {
    const distribution: Record<string, number> = {};
    data.forEach((item) => {
      const k = item[key];
      if (k) {
        distribution[k] = (distribution[k] || 0) + 1;
      }
    });
    return distribution;
  }


  changePeriod(period: 'day' | 'week' | 'month' | 'all') {
    this.selectedPeriod = period;
    this.filterDataByPeriod();
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
