import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/project.model';
import { DashboardStore } from '../../../stores/dashboard.store';

@Component({
  selector: 'app-progress-bar-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-bar-widget.component.html',
  styleUrls: ['./progress-bar-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarWidgetComponent {
  private store = inject(DashboardStore);
  
  projects = this.store.filteredProjects;

  isProjectDelayed(project: Project): boolean {
    const today = new Date();
    const endDate = new Date(project.endDate);
    const timeDiff = endDate.getTime() - today.getTime();
    const daysLeft = timeDiff / (1000 * 3600 * 24);
    
    return daysLeft < 30 && project.progress < 50;
  }
}