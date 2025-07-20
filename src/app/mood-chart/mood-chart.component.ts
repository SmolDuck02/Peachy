import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

@Component({
  selector: 'app-mood-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mood-chart.component.html',
  styleUrls: ['./mood-chart.component.scss'],
})
export class MoodChartComponent implements AfterViewInit, OnChanges {
  @Input() chartData!: { title: string; labels: string[]; values: number[] };
  @ViewChild('moodChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chartInstance: Chart<'doughnut'> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.chartData && this.chartData.labels.length > 0) {
        this.renderChart();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData'] && changes['chartData'].currentValue) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      setTimeout(() => {
        this.renderChart();
      }, 0);
    }
  }

  renderChart() {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) {
      console.error('Chart canvas not found!');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get canvas rendering context!');
      return;
    }

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const doughnutChartConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      options: {
        maintainAspectRatio: false, 
        plugins: {
          title: {
            display: true,
            text: this.chartData.title,
            font: {
              size: 18,
            },
            color: '#2c3e50',
          },
          legend: {
            position: 'bottom',
            labels: {
              color: '#2c3e50',
            }
          }
        },
      },
      data: {
        labels: this.chartData.labels, // Use actual input data
        datasets: [
          {
            label: this.chartData.title,
            data: this.chartData.values,
            backgroundColor: [
              '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da', '#c5cae9', '#e8eaf6'
            ],
            borderWidth: 1,
          },
        ],
      },
    };

    this.chartInstance = new Chart<'doughnut'>(ctx, doughnutChartConfig);
  }
}
