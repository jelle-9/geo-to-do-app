import { Component, OnInit } from '@angular/core';
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
export class Tab2Page implements OnInit {
  taskTitle: string = '';
  taskDescription: string | null = null; // Kann null sein, wenn optional

  pageTitle: string = 'Aufgabe erstellen'; // Titel der Seite
  isEditMode: boolean = false; // Flag für den Bearbeitungsmodus
  private taskToEditId: number | null = null; // ID des Tasks, falls im Bearbeitungsmodus

  constructor(
    private taskService: TaskService,
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private router: Router // Router für Navigation
  ) {
    // Daten aus dem Navigationszustand abrufen
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {taskToEdit: Task}; //Typsicherung

    if (state?.taskToEdit) {
      this.isEditMode = true;
      this.taskToEditId = state.taskToEdit.id;
      this.taskTitle = state.taskToEdit.title;
      this.taskDescription = state.taskToEdit.description;
      this.pageTitle = 'Aufgabe bearbeiten';
    }
  }

  ngOnInit(){
    
  }

  async saveTask() {
    if (!this.taskTitle || this.taskTitle.trim() === '') {
      this.presentToast('Titel darf nicht leer sein.', 'warning');
      return;
    }

    const taskData = {
      title: this.taskTitle.trim(),
      description: this.taskDescription ? this.taskDescription.trim() : null
    };

    if (this.isEditMode && this.taskToEditId !== null) {
      // Im Bearbeitungsmodus: updateTask aufrufen
      this.taskService.updateTask(this.taskToEditId, taskData).subscribe({
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
      this.taskService.addTask(taskData).subscribe({
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
    this.isEditMode = false;
    this.taskToEditId = null;
    this.pageTitle = 'Neue Aufgabe erstellen';
    this.navCtrl.navigateBack('/tabs/tab1');
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }
}