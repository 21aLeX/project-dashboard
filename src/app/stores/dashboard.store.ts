import { Injectable, signal, computed, inject } from '@angular/core';
import { Project, Widget, DashboardState, WidgetType, FilterSettings } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { StorageService } from '../services/storage.service';
import { interval, Subscription, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  private projectService = inject(ProjectService);
  private storageService = inject(StorageService);
  private autoRefreshSubscription?: Subscription;

  // State signals
  public projects = signal<Project[]>([]);
  public widgets = signal<Widget[]>([]);
  public filters = signal<FilterSettings>({
    searchQuery: '',
    statusFilter: 'all'
  });
  public lastDataUpdate = signal(new Date());

  // Computed values
  filteredProjects = computed(() => {
    const projects = this.projects();
    const filters = this.filters();
    
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase()
        .includes(filters.searchQuery.toLowerCase());
      const matchesStatus = filters.statusFilter === 'all' || 
                           project.status === filters.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  });

  isLoading = signal(false);

  constructor() {
    this.initializeStore();
    this.startAutoRefresh();
  }

  private async initializeStore(): Promise<void> {
    this.loadInitialState();
    await this.loadProjects();
  }

  // Actions
  async loadProjects(): Promise<void> {
    this.isLoading.set(true);
    try {
      this.projectService.getProjects().subscribe(projects => {
        this.projects.set(projects);
        this.lastDataUpdate.set(new Date());
        this.isLoading.set(false);
      });
    } catch (error) {
      console.error('Error loading projects:', error);
      this.isLoading.set(false);
    }
  }

  // Автоматическое обновление данных каждые 5 секунд
  private startAutoRefresh(): void {
    this.autoRefreshSubscription = interval(5000)
      .pipe(
        switchMap(() => this.projectService.getProjects())
      )
      .subscribe({
        next: (projects) => {
          this.projects.set(projects);
          this.lastDataUpdate.set(new Date());
          console.log('Данные автоматически обновлены');
        },
        error: (error) => console.error('Ошибка автообновления:', error)
      });
  }

  stopAutoRefresh(): void {
    this.autoRefreshSubscription?.unsubscribe();
  }

  updateFilters(filters: Partial<FilterSettings>): void {
    this.filters.update(current => ({ ...current, ...filters }));
    this.saveState();
  }

  addWidget(type: WidgetType): void {
    const newWidget: Widget = {
      id: this.generateId(),
      type,
      position: this.widgets().length,
      config: {}
    };

    this.widgets.update(widgets => [...widgets, newWidget]);
    this.saveState();
  }

  removeWidget(widgetId: string): void {
    this.widgets.update(widgets => widgets.filter(w => w.id !== widgetId));
    this.saveState();
  }

  updateWidgetPosition(previousIndex: number, currentIndex: number): void {
    const widgets = [...this.widgets()];
    const [movedWidget] = widgets.splice(previousIndex, 1);
    widgets.splice(currentIndex, 0, movedWidget);
    
    // Update positions
    const updatedWidgets = widgets.map((widget, index) => ({
      ...widget,
      position: index
    }));

    this.widgets.set(updatedWidgets);
    this.saveState();
  }

  // State persistence
  private saveState(): void {
    const state: DashboardState = {
      widgets: this.widgets(),
      filters: this.filters(),
      layout: { columns: 3, gap: 16 }
    };
    this.storageService.saveState(state);
  }

  private loadInitialState(): void {
    const savedState = this.storageService.loadState();
    if (savedState) {
      this.widgets.set(savedState.widgets || this.initializeDefaultWidgets());
      this.filters.set(savedState.filters || this.filters());
    } else {
      this.widgets.set(this.initializeDefaultWidgets());
    }
  }

  private initializeDefaultWidgets(): Widget[] {
    return [
      {
        id: this.generateId(),
        type: WidgetType.TASK_STATS,
        position: 0,
        config: {}
      },
      {
        id: this.generateId(),
        type: WidgetType.PROGRESS_BAR,
        position: 1,
        config: {}
      },
      {
        id: this.generateId(),
        type: WidgetType.TIMELINE,
        position: 2,
        config: {}
      }
    ];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  ngOnDestroy() {
    this.stopAutoRefresh();
  }
}