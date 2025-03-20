// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { catchError, forkJoin, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { ModalButtonComponent } from '../modal-button/modal-button.component';
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
  ],
  templateUrl: './dashobard.component.html',
  styleUrls: ['./dashobard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chats: Chat[] = [];
  checkins: Checkin[] = [];
  works: Work[] = [];

  recentCheckins: any[] = [];
  recentWorks: any[] = [];
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
     if (!this.selectedPeriod) return;

     const now = new Date();

     const startDate = new Date(); // Adjust this based on the period
     if (this.selectedPeriod === 'day') {
       startDate.setDate(now.getDate() - 1);
     } else if (this.selectedPeriod === 'week') {
       startDate.setDate(now.getDate() - 7);
     } else if (this.selectedPeriod === 'month') {
       startDate.setMonth(now.getMonth() - 1);
     }


     this.recentCheckins = this.checkins.filter((checkin) => {
       const checkinDate = new Date(checkin.timestamp!);
       return checkinDate >= startDate;
     });

     this.recentWorks = this.works.filter((work) => {
       const workDate = new Date(work.timestamp!);
       return workDate >= startDate;
     });

    // // Process recent checkins with their associated messages
    // this.recentCheckins = this.checkins
    //   .sort(
    //     (a, b) =>
    //       new Date(b.timestamp || '').getTime() -
    //       new Date(a.timestamp || '').getTime()
    //   )
    //   .slice(0, 10);

    // this.recentWorks = this.works
    //   .sort(
    //     (a, b) =>
    //       new Date(b.timestamp || '').getTime() -
    //       new Date(a.timestamp || '').getTime()
    //   )
    //   .slice(0, 10);

    // Calculate mood distribution
    this.moodDistribution = {};
    this.recentCheckins.forEach((checkin) => {
      this.moodDistribution[checkin.mood] =
        (this.moodDistribution[checkin.mood] || 0) + 1;
    });

    // Calculate work type distribution
    this.workTypeDistribution = {};
    this.recentWorks.forEach((work) => {
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
