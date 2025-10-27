import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';

// Импортируем компоненты напрямую вместо lazy loading для простоты
import { ProgressBarWidgetComponent } from '../widgets/progress-bar-widget/progress-bar-widget.component';
import { TaskStatsWidgetComponent } from '../widgets/task-stats-widget/task-stats-widget.component';
import { TimelineWidgetComponent } from '../widgets/timeline-widget/timeline-widget.component';

import { DashboardStore } from '../../stores/dashboard.store';
import { WidgetType } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    CdkDropList, 
    CdkDrag,
    ProgressBarWidgetComponent,
    TaskStatsWidgetComponent,
    TimelineWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardComponent {
  private store = inject(DashboardStore);

  // State from store
  widgets = this.store.widgets;
  filters = this.store.filters;
  isLoading = this.store.isLoading;
  
  // Available widget types
  widgetTypes = [
    { type: WidgetType.PROGRESS_BAR, name: 'Прогресс', icon: '📊' },
    { type: WidgetType.TASK_STATS, name: 'Статистика', icon: '📈' },
    { type: WidgetType.TIMELINE, name: 'Таймлайн', icon: '⏰' }
  ];

  statusFilters = [
    { value: 'all', label: 'Все проекты' },
    { value: 'active', label: 'Активные' },
    { value: 'completed', label: 'Завершенные' },
    { value: 'on_hold', label: 'На паузе' }
  ];

  // Метод для получения заголовка виджета
  getWidgetTitle(widgetType: WidgetType): string {
    const widgetMap: { [key in WidgetType]: string } = {
      [WidgetType.PROGRESS_BAR]: 'Прогресс проектов',
      [WidgetType.TASK_STATS]: 'Статистика задач',
      [WidgetType.TIMELINE]: 'Таймлайн проектов'
    };
    return widgetMap[widgetType] || 'Виджет';
  }

  // Метод для получения компонента по типу
  getWidgetComponent(widgetType: WidgetType): any {
    const componentMap: { [key in WidgetType]: any } = {
      [WidgetType.PROGRESS_BAR]: ProgressBarWidgetComponent,
      [WidgetType.TASK_STATS]: TaskStatsWidgetComponent,
      [WidgetType.TIMELINE]: TimelineWidgetComponent
    };
    return componentMap[widgetType];
  }

  // Actions
  onSearchChange(query: string): void {
    this.store.updateFilters({ searchQuery: query });
  }

  onStatusChange(status: string): void {
    this.store.updateFilters({ statusFilter: status as any });
  }

  addWidget(widgetType: WidgetType): void {
    this.store.addWidget(widgetType);
  }

  removeWidget(widgetId: string): void {
    this.store.removeWidget(widgetId);
  }

  onWidgetDrop(event: CdkDragDrop<any[]>): void {
    if (event.previousIndex !== event.currentIndex) {
      this.store.updateWidgetPosition(event.previousIndex, event.currentIndex);
    }
  }
}