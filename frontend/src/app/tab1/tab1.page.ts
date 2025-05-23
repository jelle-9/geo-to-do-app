import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';

import { TaskService } from '../services/task.service';
import { Task } from '../models/task.interface';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AlertController, ModalController, NavController } from '@ionic/angular/standalone';

import * as L from 'leaflet';
//import { mapToCanDeactivate } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true,
})
export class Tab1Page implements OnInit, AfterViewInit, OnDestroy {
  tasks: Task[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  private maps: Map<string, L.Map> = new Map();

  private defaultLatitude: number = 52.5200 ;
  private defaultLongitude: number = 13.4050 ;

  constructor(
    private taskService: TaskService,
    private alertCtrl: AlertController,

    private navCtrl: NavController
  ) {}

  ionViewWillEnter() {
    this.loadTasks();
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }

  // Map init fonktion
  private initMaps() {

    // Map erstmal entleeren, before neue 
    this.maps.forEach(mapInstance => {
      if (mapInstance) {
        mapInstance.remove();
      }
    });

    this.maps.clear();
      
      this.tasks.forEach(task => {

        const mapId = `map-${task.id}`;

        if(document.getElementById(mapId)) {

          const latitude = task.latitude ?? this.defaultLatitude;
          const longitude = task.longitude ?? this.defaultLongitude;

          const map = L.map(mapId).setView([latitude, longitude], 13);

          L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png', 
            {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
            .addTo(map);

          L.marker([latitude, longitude])
            .addTo(map);
            // .bindPopup(`<b>${task.title}</b><br>Emplacement fixe`).openPopup();
          this.maps.set(mapId, map);

          setTimeout(() => {
            map.invalidateSize();
          }, 100); 
        } else {
          console.warn(`Element with ID ${mapId} not found. Map not initialized for task ${task.id}.`);
        }
      });
  }

  ngOnDestroy(): void {
    
  }

  // Funktion zum Laden der Aufgaben
  loadTasks() {
    this.isLoading = true;
    this.errorMessage = null;
    console.log('Versuche, Taks zu laden...');

    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        console.log('Tasks erfolgreich geladen:', this.tasks);

        setTimeout(() => {
          this.initMaps();
        }, 0);
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

  // Funktion zum Löschen eines Tasks
  async onDeleteTask(taskId: number) {
    console.log(`Lösche Task mit ID: ${taskId}`);

    const alert = await this.alertCtrl.create({
      header: 'Löschen bestätigen',
      message: 'Möchtest du diese Aufgabe wirklich löschen?',
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
        {
          text: 'Löschen',
          handler: () => {
            this.taskService.deleteTask(taskId).subscribe({
              next: () => {
                console.log('Task erfolgreich vom Backend gelöscht');
                // Aktualisiere die lokale Liste, indem der gelöschte Task entfernt wird
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                // Optional: Erfolgs-Toast anzeigen
              },
              error: (err) => {
                console.error('Fehler beim Löschen des Tasks:', err);
                // Optional: Fehler-Toast anzeigen
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  // Funktion zum Bearbeiten eines Tasks
  async onEditTask(task: Task) {
    console.log('Bearbeite Task:', task);

    this.navCtrl.navigateForward('/tabs/tab2', {
      state: {
        taskToEdit: task // Übergebe den Task zur Bearbeitung
      }
    });
  }

  // Funktion zum Navigieren zur Seite zum Hinzufügen eines neuen Tasks
  navigateToAddTaskPage() {
    this.navCtrl.navigateForward('/tabs/tab2');
  }
}
