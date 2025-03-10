// dashboard.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

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
  imports: [CommonModule, HttpClientModule],
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    //TODO implement auth and use user id to fetch data
    // Make API calls to fetch data from all tables
    forkJoin({
      chats: this.http.get<Chat[]>('/api/chats'),
      checkins: this.http.get<Checkin[]>('/api/checkins'),
      works: this.http.get<Work[]>('/api/works'),
    }).subscribe((data) => {
      this.chats = [
        {
          id: 1,
          user_id: '12',
          role: 'user',
          message: 'hi hello',
          timestamp: '2025-03-06T12:34:56+05:30',
        },
      ];
      this.checkins = [{ id: 2, mood: 'lethargic', message_id: 1 }];
      this.works = [{ id: 2, type: 'lethargic', message_id: 1 }];

      this.processData();
      this.isLoading = false;
    });
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
