import { Injectable, signal } from '@angular/core';
import { delay, of, Observable } from 'rxjs';
import { Project, ProjectStatus } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private projects = signal<Project[]>(this.initializeProjects());

  getProjects(): Observable<Project[]> {
    // Имитация изменений в реальном времени - случайное обновление прогресса
    this.simulateRealTimeUpdates();
    
    const delayTime = Math.random() * 500 + 500;
    return of(this.projects()).pipe(delay(delayTime));
  }

  getProjectById(id: number): Observable<Project | undefined> {
    return of(this.projects().find(p => p.id === id)).pipe(delay(200));
  }

  /**
   * Имитация real-time изменений - случайное увеличение прогресса проектов
   */
  private simulateRealTimeUpdates(): void {
    const currentProjects = this.projects();
    const updatedProjects = currentProjects.map(project => {
      // Только активные проекты могут прогрессировать
      if (project.status !== ProjectStatus.ACTIVE || project.progress >= 100) {
        return project;
      }

      // 30% шанс на прогресс для каждого проекта
      if (Math.random() < 0.3) {
        const progressIncrease = Math.floor(Math.random() * 5) + 1; // 1-5%
        const newProgress = Math.min(project.progress + progressIncrease, 100);
        const tasksCompleted = Math.floor((newProgress / 100) * project.tasksTotal);
        
        // Автоматически завершаем проект при достижении 100%
        const newStatus = newProgress >= 100 ? ProjectStatus.COMPLETED : project.status;

        return {
          ...project,
          progress: newProgress,
          tasksCompleted,
          status: newStatus
        };
      }

      return project;
    });

    // Обновляем проекты только если есть изменения
    if (JSON.stringify(currentProjects) !== JSON.stringify(updatedProjects)) {
      this.projects.set(updatedProjects);
    }
  }

  private initializeProjects(): Project[] {
    const baseProjects = [
      {
        id: 1,
        name: "Проект A",
        tasksCompleted: 25,
        tasksTotal: 50,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        status: ProjectStatus.ACTIVE,
        progress: 50
      },
      {
        id: 2,
        name: "Проект B",
        tasksCompleted: 75,
        tasksTotal: 140,
        startDate: "2023-06-01",
        endDate: "2024-03-31",
        status: ProjectStatus.ACTIVE,
        progress: 54
      },
      {
        id: 3,
        name: "Проект C",
        tasksCompleted: 80,
        tasksTotal: 85,
        startDate: "2024-06-01",
        endDate: "2024-09-30",
        status: ProjectStatus.COMPLETED,
        progress: 94
      },
      {
        id: 4,
        name: "Проект D",
        tasksCompleted: 10,
        tasksTotal: 100,
        startDate: "2024-03-01",
        endDate: "2024-12-31",
        status: ProjectStatus.ON_HOLD,
        progress: 10
      }
    ];

    return baseProjects;
  }
}