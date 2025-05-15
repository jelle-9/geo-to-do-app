import { Component } from '@angular/core';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.interface';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class Tab1Page {
  tasks: Task[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private taskService: TaskService) {}

  ionViewWillEnter() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading = true;
    this.errorMessage = null;
    console.log('Versuche, Taks zu laden...');

    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        console.log('Tasks erfolgreich geladen:', this.tasks);
      },
      error: (err) => {
        console.error('Fehler beim Laden der Tasks:', err); // Log bei Fehler
        this.errorMessage = 'Aufgaben konnten nicht geladen werden. Läuft das Backend? Ist CORS korrekt konfiguriert?';
        this.isLoading = false;
      },
      complete: () => {
        console.log('Laden der Tasks abgeschlossen (Observable complete).'); // Log bei Abschluss
      }
    })
  }
}
