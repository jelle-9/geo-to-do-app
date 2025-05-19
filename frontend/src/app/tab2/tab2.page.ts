import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Für ngModel
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // NavController für Navigation, ToastController für Nachrichten
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';

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

  constructor(
    private taskService: TaskService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async saveTask() {
    if (!this.taskTitle || this.taskTitle.trim() === '') {
      this.presentToast('Titel darf nicht leer sein.', 'warning');
      return;
    }

    const taskData = {
      title: this.taskTitle.trim(),
      description: this.taskDescription ? this.taskDescription.trim() : null
    };

    this.taskService.addTask(taskData).subscribe({
      next: async (newTask) => {
        console.log('Neue Aufgabe erfolgreich erstellt:', newTask);
        await this.presentToast('Aufgabe erfolgreich erstellt!', 'success');
        this.taskTitle = ''; // Formular zurücksetzen
        this.taskDescription = null;
        this.navCtrl.navigateBack('/tabs/tab1'); // Zurück zur Aufgabenliste
      },
      error: async (err) => {
        console.error('Fehler beim Erstellen der Aufgabe:', err);
        await this.presentToast('Fehler beim Erstellen der Aufgabe.', 'danger');
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
    toast.present();
  }
}