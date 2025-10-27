import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStore } from '../../../stores/dashboard.store';

@Component({
  selector: 'app-timeline-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './timeline-widget.component.html',
  styleUrls: ['./timeline-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineWidgetComponent {
  private store = inject(DashboardStore);
  
  projects = this.store.filteredProjects;

  recentProjects = () => 
    this.projects()
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, 5);

  calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}