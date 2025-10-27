export interface Project {
  id: number;
  name: string;
  tasksCompleted: number;
  tasksTotal: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number; 
}

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold'
}

export interface Widget {
  id: string;
  type: WidgetType;
  position: number;
  config: any;
}

export enum WidgetType {
  PROGRESS_BAR = 'progress-bar',
  TASK_STATS = 'task-stats',
  TIMELINE = 'timeline'
}

export interface DashboardState {
  widgets: Widget[];
  filters: FilterSettings;
  layout: LayoutSettings;
}

export interface FilterSettings {
  searchQuery: string;
  statusFilter: ProjectStatus | 'all';
}

export interface LayoutSettings {
  columns: number;
  gap: number;
}