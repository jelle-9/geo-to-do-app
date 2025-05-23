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
  ) {
    // // Daten aus dem Navigationszustand abrufen
    // const navigation = this.router.getCurrentNavigation();
    // const state = navigation?.extras.state as {taskToEdit: Task}; //Typsicherung

    // if (state?.taskToEdit) {
    //   this.isEditMode = true;
    //   this.taskToEditId = state.taskToEdit.id;
    //   this.taskTitle = state.taskToEdit.title;
    //   this.taskDescription = state.taskToEdit.description;
    //   this.pageTitle = 'Aufgabe bearbeiten';
    // }

    this.loadInitialDataFromState();
  }

  // ngOnInit(){
  //  Statt ngOnInit ist ionViewWillEnter oft besser für Ionic-Seiten, feuert bei jedem Seitenaufruf nicht nur beim ersten Mal
  // }

ionViewWillEnter() {
  this.loadInitialDataFromState();
}

private loadInitialDataFromState() {
    // Versuche, den 'taskToEdit' aus dem Navigations-State zu lesen
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { taskToEdit?: Task }; // Optionales taskToEdit

    if (state?.taskToEdit && typeof state.taskToEdit.id !== 'undefined') {
      const task = state.taskToEdit;
      console.log("Tab2Page: Edit-Modus erkannt mit Task:", task);
      this.isEditMode = true;
      this.taskToEditId = task.id;
      this.taskTitle = task.title;
      this.taskDescription = task.description;
      // === GEO-FELDER FÜLLEN (falls vorhanden) ===
      this.taskLatitude = task.latitude ?? null;
      this.taskLongitude = task.longitude ?? null;
      // === === ===
      this.pageTitle = 'Aufgabe bearbeiten';
    } else {
      console.log("Tab2Page: Neu-Erstellen-Modus oder kein Task im State gefunden.");
      // Es ist wichtig, hier explizit in den "Neu erstellen"-Modus zu wechseln und Felder zurückzusetzen,
      // falls die Seite vorher im Edit-Modus war und jetzt ohne State aufgerufen wird.
      this.isEditMode = false;
      this.taskToEditId = null;
      this.taskTitle = '';
      this.taskDescription = null;
      // === GEO-FELDER ZURÜCKSETZEN ===
      this.taskLatitude = null;
      this.taskLongitude = null;
      // === === ===
      this.pageTitle = 'Neue Aufgabe erstellen';
    }
  }

  async saveTask() {
    if (!this.taskTitle || this.taskTitle.trim() === '') {
      this.presentToast('Titel darf nicht leer sein.', 'warning');
      return;
    }

    // Optionale Validierung für Lat/Lon
    if ((this.taskLatitude !== null && this.taskLongitude === null) || (this.taskLatitude === null && this.taskLongitude !== null)) {
        await this.presentToast('Wenn Latitude oder Longitude angegeben wird, muss auch das andere Feld ausgefüllt sein.', 'warning');
        return;
    }
    if (this.taskLatitude !== null && (this.taskLatitude < -90 || this.taskLatitude > 90)) {
        await this.presentToast('Latitude muss zwischen -90 und 90 liegen.', 'warning');
        return;
    }
    if (this.taskLongitude !== null && (this.taskLongitude < -180 || this.taskLongitude > 180)) {
        await this.presentToast('Longitude muss zwischen -180 und 180 liegen.', 'warning');
        return;
    }

    // Wir verwenden Partial<Task> für den Payload, um flexibel zu sein.
    // Das Task-Interface sollte latitude? und longitude? optional definieren.
    const taskDataPayload: Partial<Task> = {
      title: this.taskTitle.trim(),
      description: this.taskDescription ? this.taskDescription.trim() : null
    };

    // === GEO-DATEN ZUM PAYLOAD HINZUFÜGEN (falls vorhanden und valide) ===
    if (this.taskLatitude !== null && this.taskLongitude !== null) {
      taskDataPayload.latitude = this.taskLatitude;
      taskDataPayload.longitude = this.taskLongitude;
    }
    // === === ===

    if (this.isEditMode && this.taskToEditId !== null) {
      // Im Bearbeitungsmodus: updateTask aufrufen
      this.taskService.updateTask(this.taskToEditId, taskDataPayload).subscribe({
        next: async (updatedTask) => {
          console.log('Aufgabe erfolgreich aktualisiert:', updatedTask);
          await this.presentToast('Aufgabe erfolgreich aktualisiert!', 'success');
          this.resetFormAndNavigateBack();
        },
        error: async (err) => {
          console.error('Fehler beim Aktualisieren der Aufgabe:', err);
          await this.presentToast('Fehler beim Aktualisieren der Aufgabe.', 'danger');
        }
      });
    } else {
      // Im Erstellungsmodus: addTask aufrufen
      this.taskService.addTask(taskDataPayload as {title: string}).subscribe({ // Type assertion für addTask
        next: async (newTask) => {
          console.log('Neue Aufgabe erfolgreich erstellt:', newTask);
          await this.presentToast('Aufgabe erfolgreich erstellt!', 'success');
          this.resetFormAndNavigateBack();
        },
        error: async (err) => {
          console.error('Fehler beim Erstellen der Aufgabe:', err);
          await this.presentToast('Fehler beim Erstellen der Aufgabe.', 'danger');
        }
      });
    }
  }

  resetFormAndNavigateBack() {
    this.taskTitle = '';
    this.taskDescription = null;
    // === GEO-FELDER AUCH HIER ZURÜCKSETZEN ===
    this.taskLatitude = null;
    this.taskLongitude = null;
    // === === ===
    this.isEditMode = false;
    this.taskToEditId = null;
    this.pageTitle = 'Neue Aufgabe erstellen'; // Wichtig für den nächsten Aufruf
    this.navCtrl.navigateBack('/tabs/tab1', { queryParams: { refresh: new Date().getTime() }});
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