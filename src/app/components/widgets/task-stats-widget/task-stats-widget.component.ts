import { Component, ChangeDetectionStrategy, inject, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStore } from '../../../stores/dashboard.store';

interface TaskStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
}

@Component({
  selector: 'app-task-stats-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-stats-widget.component.html',
  styleUrls: ['./task-stats-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskStatsWidgetComponent implements OnInit, OnDestroy {
  private store = inject(DashboardStore);

  // Используем computed для автоматического обновления статистики при изменении данных
  stats = computed(() => {
    const projects = this.store.filteredProjects();
    
    const totalProjects = projects.length;
    const totalTasks = projects.reduce((sum, p) => sum + p.tasksTotal, 0);
    const completedTasks = projects.reduce((sum, p) => sum + p.tasksCompleted, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const onHoldProjects = projects.filter(p => p.status === 'on_hold').length;

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate,
      activeProjects,
      completedProjects,
      onHoldProjects
    };
  });

  lastUpdate = signal(new Date());
  nextUpdate = signal(new Date());
  isUpdating = signal(false);
  private updateInterval: any;

  ngOnInit() {
    // Обновляем время каждые 5 секунд для индикации
    this.updateInterval = setInterval(() => {
      this.isUpdating.set(true);
      
      // Имитация процесса обновления
      setTimeout(() => {
        this.lastUpdate.set(new Date());
        
        const nextUpdateTime = new Date();
        nextUpdateTime.setSeconds(nextUpdateTime.getSeconds() + 5);
        this.nextUpdate.set(nextUpdateTime);
        
        this.isUpdating.set(false);
      }, 500);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}