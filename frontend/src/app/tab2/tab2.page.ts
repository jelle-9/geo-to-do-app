import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Für ngModel
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // NavController für Navigation, ToastController für Nachrichten
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../models/task.interface'; // Importiere das Task-Interface

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // FormsModule hier hinzufügen!
})
export class Tab2Page {
  taskTitle: string = '';
  taskDescription: string | null = null; // Kann null sein, wenn optional

  // GEO-DATEN
  taskLatitude: number | null = null;
  taskLongitude: number | null = null;

  pageTitle: string = 'Aufgabe erstellen'; // Titel der Seite
  isEditMode: boolean = false; // Flag für den Bearbeitungsmodus
  private taskToEditId: number | null = null; // ID des Tasks, falls im Bearbeitungsmodus

  constructor(
    private taskService: TaskService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router // Router für Navigation
  ) {}

  // Statt ngOnInit ist ionViewWillEnter oft besser für Ionic-Seiten, feuert bei jedem Seitenaufruf nicht nur beim ersten Mal
  ionViewWillEnter() {
    console.log("Tab2Page: ionViewWillEnter aufgerufen.");
    this.initializeFormBasedOnNavigationState();
  }

  private initializeFormBasedOnNavigationState() {
    // Statt router.getCurrentNavigation() verwenden wir window.history.state für bessere Robustheit
    const state = window.history.state;
    console.log("Tab2Page: window.history.state liefert:", state); // Wichtiges Log!

    if (state?.taskToEdit) {
      const task = state.taskToEdit as Task;
      if (task && typeof task.id !== 'undefined') { // Zusätzliche Sicherheitsprüfung
        console.log("Tab2Page: Edit-Modus erkannt mit Task:", task);
        this.isEditMode = true;
        this.taskToEditId = task.id;
        this.taskTitle = task.title;
        this.taskDescription = task.description;
        this.taskLatitude = task.latitude ?? null;
        this.taskLongitude = task.longitude ?? null;
        this.pageTitle = 'Aufgabe bearbeiten';
      } else {
        console.log("Tab2Page: Task im State gefunden, aber ungültig oder ohne ID. Wechsle zu Neu-Erstellen.");
        this.resetToCreateMode();
      }
    } else {
      // Kein taskToEdit im aktuellen Navigations-State gefunden.
      // Es könnte auch sein, dass die Seite nicht über eine Navigation mit State erreicht wurde.
      console.log("Tab2Page: Kein 'taskToEdit' im State. Wechsle zu Neu-Erstellen.");
      this.resetToCreateMode();
    }
  }

  private resetToCreateMode() {
    this.isEditMode = false;
    this.taskToEditId = null;
    this.taskTitle = '';
    this.taskDescription = null;
    this.taskLatitude = null;
    this.taskLongitude = null;
    this.pageTitle = 'Neue Aufgabe erstellen';
  }

  async saveTask() {
    // ... (deine bestehende saveTask Logik ist hier gut)
    if (!this.taskTitle || this.taskTitle.trim() === '') {
      this.presentToast('Titel darf nicht leer sein.', 'warning');
      return;
    }

    if ((this.taskLatitude !== null && this.taskLongitude === null) || (this.taskLatitude === null && this.taskLongitude !== null)) {
      await this.presentToast('Wenn Latitude oder Longitude angegeben wird, muss auch das andere Feld ausgefüllt sein.', 'warning');
      return;
    }
    // ... (restliche Validierungen für Lat/Lon)

    const taskDataPayload: Partial<Task> = {
      title: this.taskTitle.trim(),
      description: this.taskDescription ? this.taskDescription.trim() : null
    };

    if (this.taskLatitude !== null && this.taskLongitude !== null) {
      taskDataPayload.latitude = this.taskLatitude;
      taskDataPayload.longitude = this.taskLongitude;
    }

    if (this.isEditMode && this.taskToEditId !== null) {
      this.taskService.updateTask(this.taskToEditId, taskDataPayload).subscribe({
        next: async (updatedTask) => {
          await this.presentToast('Aufgabe erfolgreich aktualisiert!', 'success');
          this.resetFormAndNavigateBack(true); // true für "kam aus Edit-Modus"
        },
        error: async (err) => {
          await this.presentToast('Fehler beim Aktualisieren der Aufgabe.', 'danger');
        }
      });
    } else {
      this.taskService.addTask(taskDataPayload as { title: string }).subscribe({
        next: async (newTask) => {
          await this.presentToast('Aufgabe erfolgreich erstellt!', 'success');
          this.resetFormAndNavigateBack(false); // false für "kam aus Neu-Modus"
        },
        error: async (err) => {
          await this.presentToast('Fehler beim Erstellen der Aufgabe.', 'danger');
        }
      });
    }
  }

  resetFormAndNavigateBack(wasEditMode: boolean) { // Parameter hinzugefügt
    // Das Zurücksetzen der Felder passiert jetzt in initializeFormBasedOnNavigationState
    // beim nächsten Aufruf von ionViewWillEnter, wenn kein State übergeben wird.
    // Hier nur die Navigation.
    this.navCtrl.navigateBack('/tabs/tab1', {
      queryParams: {
        refresh: new Date().getTime(),
        updatedTaskId: wasEditMode ? this.taskToEditId : null
      }
    });
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}
