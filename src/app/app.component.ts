import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MoodChartComponent } from './mood-chart/mood-chart.component';
import { DashboardComponent } from './dashobard/dashobard.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, DashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent  {
  title = 'lesers';

  // moodChartData: { title: string; labels: string[]; values: number[] } = {
  //   title: 'Checkins by Mood Chart',
  //   labels: ['None'],
  //   values: [0],
  // };
  // workChartData: { title: string; labels: string[]; values: number[] } = {
  //   title: 'Works by Type Chart',
  //   labels: ['None'],
  //   values: [0],
  // };

  // constructor(private http: HttpClient) {}

  // ngOnInit() {
  //   this.http
  //     .get<any[]>(
  //       'http://localhost:3000/checkins/checkins-by-mood/913002328372699136'
  //     )
  //     .subscribe((response) => {
  //       if (response.length > 0) {
  //         console.log('API Response:', response);
  //         this.moodChartData = {
  //           title: this.moodChartData.title,
  //           labels: response.map((item) => item.type),
  //           values: response.map((item) => Number(item.work_count)),
  //         };
  //       }
  //     });

  //   this.http
  //     .get<any[]>(
  //       'http://localhost:3000/works/works-by-type/913002328372699136'
  //     )
  //     .subscribe((response) => {
  //       if (response.length > 0) {
  //         console.log('API Response:', response);
  //         this.workChartData = {
  //           title: this.workChartData.title,
  //           labels: response.map((item) => item.type),
  //           values: response.map((item) => Number(item.work_count)),
  //         };
  //       }
  //     });
  // }
}
