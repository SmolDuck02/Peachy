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
import { Chart, registerables } from 'chart.js';

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
  private chartInstance: Chart | null = null; // Store Chart instance

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    Chart.register(...registerables);
  }

  ngAfterViewInit() {
    // Delay rendering until canvas is available
    setTimeout(() => {
      if (this.chartData) {
        this.renderChart();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['chartData'] && changes['chartData'].currentValue) {
      console.log('Updated chartData:', this.chartData);

      // Ensure chart updates when data changes
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

    // Destroy previous chart instance before creating a new one
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      options: {
        plugins: {
          title: {
            display: true,
            text: this.chartData.title, // ✅ Change this to your desired title
            font: {
              size: 18,
            },
            color: '#333', // Optional: Set text color
          },
        },
      },
      data: {
        labels: this.chartData.labels, // Use actual input data
        datasets: [
          {
            label: 'Work Type Distribution',
            data: this.chartData.values,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  }
}
