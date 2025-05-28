import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Für ngModel
import { IonicModule, NavController, ToastController } from '@ionic/angular'; // NavController für Navigation, ToastController für Nachrichten
import { TaskService } from '../services/task.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Task } from '../models/task.interface'; // Importiere das Task-Interface

import { LeafletModule } from '@bluehalo/ngx-leaflet';
import  * as L from 'leaflet'; // Leaflet für Karten

import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, LeafletModule],// FormsModule hier hinzufügen!
 
})
export class Tab2Page {
  taskTitle: string = '';
  taskDescription: string | null = null; // Kann null sein, wenn optional

  // GEO-DATEN
  taskLatitude: number | null = null;
  taskLongitude: number | null = null;

  // Eigenschaften, um die aktuellen Kartenkoordinaten zu speichern
  currentMapCenterLatitude: number | null = null;
  currentMapCenterLongitude: number | null = null;

  pageTitle: string = 'Aufgabe erstellen'; // Titel der Seite
  isEditMode: boolean = false; // Flag für den Bearbeitungsmodus
  private taskToEditId: number | null = null; // ID des Tasks, falls im Bearbeitungsmodus

  map!: L.Map;
  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    ],
    zoom: 6,
    center: L.latLng(52.5362, 13.3400) // DFKI Labor Berlin
  };
  private marker: L.Marker | null = null;
  private defaultMapCenter = L.latLng(52.5362, 13.3400);
  private defaultMapZoom = 13;
  private taskMapZoom = 14;

    constructor(
      private taskService: TaskService,
      private navCtrl: NavController,
      private toastCtrl: ToastController,
      private router: Router, // Router für Navigation
      private geolocation: Geolocation
    ) {}

  // Statt ngOnInit ist ionViewWillEnter oft besser für Ionic-Seiten, feuert bei jedem Seitenaufruf nicht nur beim ersten Mal
  ionViewWillEnter() {
    // Rufe die aktuelle Geräteposition ab, sobald die Komponente initialisiert wird
    // this.getCurrentDeviceLocation().then(location => {
    //   if (location) {
    //     console.log('NGONINIT: Aktuelle Position des Geräts:', location);
    //     // Hier könnten Sie die Karte auf diese Position zentrieren oder die Felder aktualisieren
    //     // Das werden wir in der nächsten Aufgabe tun!
    //   } else {
    //     console.log('NGONINIT: Geräteposition konnte nicht abgerufen werden.');
    //   }
    // })
    console.log("Tab2Page: ionViewWillEnter aufgerufen.");
    this.initializeFormBasedOnNavigationState();
  }

  private async initializeFormBasedOnNavigationState() {
    // Statt router.getCurrentNavigation() verwenden wir window.history.state für bessere Robustheit
    const state = window.history.state;
    console.log("Tab2Page: window.history.state liefert:", state); // Wichtiges Log!

    if (state?.taskToEdit && typeof state.taskToEdit.id !== 'undefined') {
      // Bearbeitungsmodus
      const task = state.taskToEdit as Task;
      console.log("Tab2Page: Edit-Modus erkannt mit Task:", task);
      this.isEditMode = true;
      this.taskToEditId = task.id;
      this.taskTitle = task.title;
      this.taskDescription = task.description;
      this.taskLatitude = task.latitude ?? null;
      this.taskLongitude = task.longitude ?? null;
      this.pageTitle = 'Aufgabe bearbeiten';

       // Kartenzentrierung für den Bearbeitungsmodus: Koordinaten des Tasks verwenden
      this.currentMapCenterLatitude = this.taskLatitude;
      this.currentMapCenterLongitude = this.taskLongitude;
    } else {
        // Neu-Erstellen-Modus
        console.log("Tab2Page: Neu-Erstellen-Modus oder kein Task im State gefunden.");
        this.resetToCreateMode(); // Stellt sicher, dass alle Felder zurückgesetzt sind
        // Hier wird die Geräteposition für die neue Aufgabe abgerufen
        try {
          const deviceLocation = await this.getCurrentDeviceLocation(); // Ihre Methode aus Aufgabe 4
          if (deviceLocation) {
            this.currentMapCenterLatitude = deviceLocation.latitude;
            this.currentMapCenterLongitude = deviceLocation.longitude;
            console.log('Karte wird mit aktueller Geräteposition für neue Aufgabe initialisiert:', deviceLocation);
          } else {
            // Fallback auf Standardposition, wenn Geräteposition nicht verfügbar ist
            this.currentMapCenterLatitude = this.defaultMapCenter.lat;
            this.currentMapCenterLongitude = this.defaultMapCenter.lng;
            console.log('Geräteposition konnte nicht abgerufen werden. Karte wird mit Standardposition initialisiert.');
          }
        } catch (error) {
          console.error('Fehler beim Abrufen der Geräteposition für die Initialisierung:', error);
          // Fallback im Fehlerfall
          this.currentMapCenterLatitude = this.defaultMapCenter.lat;
          this.currentMapCenterLongitude = this.defaultMapCenter.lng;
        }
    }

    // Stellen Sie sicher, dass die Karte neu zentriert und der Marker aktualisiert werden,
    // nachdem alle Koordinaten (Task oder Geräteposition) gesetzt wurden.
    // Ein kleiner Timeout kann hier helfen, falls das DOM noch nicht ganz bereit ist.
    setTimeout(() => {
        this.configureMapBasedOnState(); // Aktualisiert mapOptions
        // Rufen Sie updateMapMarkerAndCenter HIER auf, nachdem configureMapBasedOnState()
        // die Optionen aktualisiert hat UND die Karte (map-Objekt) existiert.
        // Die 'onMapReady' wird sich auch darum kümmern, aber es ist gut, dies hier zu forcieren.
        if (this.map) { // Stellen Sie sicher, dass die Karte bereits instanziiert wurde
             this.updateMapMarkerAndCenter(true); 
        }
    }, 100);
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

  onMapReady(map: L.Map) {
    this.map = map;
    console.log("Tab2Page: Map Ready");
    // Es ist wichtig, invalidateSize aufzurufen, besonders wenn die Karte in einem
    // Container ist, der nicht sofort sichtbar ist (z.B. Tabs, Modals).
    setTimeout(() => {
      this.map.invalidateSize();
      this.updateMapMarkerAndCenter(false); // Setze initialen Marker und View
    }, 100);
  }

  onMapClick(event: L.LeafletMouseEvent) {
    if (!this.map) return;
    console.log("Tab2Page: Map Clicked", event.latlng);

    this.taskLatitude = parseFloat(event.latlng.lat.toFixed(6));
    this.taskLongitude = parseFloat(event.latlng.lng.toFixed(6));

    this.updateMapMarkerAndCenter(false); // Nur Marker aktualisieren, nicht zwingend zentrieren/zoomen
  }
  
  private configureMapBasedOnState() {
    // Standardwerte, die verwendet werden, wenn keine spezifischen Koordinaten gesetzt sind
    let centerLat = this.defaultMapCenter.lat;
    let centerLon = this.defaultMapCenter.lng;
    let zoom = this.defaultMapZoom;

    // Wenn spezifische Kartenmittelpunktkoordinaten gesetzt wurden (durch Bearbeitungsmodus oder Geräteposition)
    if (this.currentMapCenterLatitude !== null && this.currentMapCenterLongitude !== null) {
      centerLat = this.currentMapCenterLatitude;
      centerLon = this.currentMapCenterLongitude;
      // Der Zoom für die initiale Geräteposition oder Task-Position kann der taskMapZoom sein,
      // oder ein anderer spezifischer Zoom, je nach Wunsch.
      // Hier verwenden wir den defaultMapZoom für die initiale Ansicht,
      // und der taskMapZoom wird nur angewendet, wenn es eine geladene Task-Position ist.
      if (this.isEditMode) { // Wenn im Bearbeitungsmodus, verwende den Task-Zoom
        zoom = this.taskMapZoom;
      } else { // Wenn im Neu-Erstellen-Modus, könnte ein anderer Zoom passend sein, oder der default
        zoom = this.defaultMapZoom; // Oder ein spezifischerer Zoom für die Geräteposition
      }
    } else if (this.taskLatitude !== null && this.taskLongitude !== null) {
      // Fallback: Falls currentMapCenterX nicht gesetzt ist, aber taskLatitude/Longitude es sind (z.B. Bearbeitungsmodus)
      centerLat = this.taskLatitude;
      centerLon = this.taskLongitude;
      zoom = this.taskMapZoom;
    }
    
    this.mapOptions = { // Aktualisiere die Optionen für ngx-leaflet, falls die Karte neu initialisiert wird
        ...this.mapOptions, // Behalte bestehende Layer-Konfiguration
        center: L.latLng(centerLat, centerLon),
        zoom: zoom
    };

    // Wenn die Karte bereits existiert, aktualisiere ihre Ansicht direkt
    if (this.map) {
        this.updateMapMarkerAndCenter();
    }
  }

  private updateMapMarkerAndCenter(centerAndZoom: boolean = true) {
    if (!this.map) return;

    // Alten Marker entfernen
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    // Neuen Marker setzen, wenn Koordinaten vorhanden sind
    if (this.taskLatitude !== null && this.taskLongitude !== null) {
      const latLng = L.latLng(this.taskLatitude, this.taskLongitude);
      this.marker = L.marker(latLng).addTo(this.map);
      if (centerAndZoom) { // Nur zentrieren/zoomen, wenn explizit gewünscht
        this.map.setView(latLng, this.taskMapZoom);
      } else { // Nur Marker verschoben, Karte nicht zwingend neu zentrieren/zoomen
        // this.map.panTo(latLng); // Sanftes Verschieben
      }
    } else if (centerAndZoom && (this.currentMapCenterLatitude !== null && this.currentMapCenterLongitude !== null)) { // Keine Koordinaten, aber Karte soll auf Default zentriert werden
        const latLng = L.latLng(this.currentMapCenterLatitude, this.currentMapCenterLongitude);
        this.marker = L.marker(latLng).addTo(this.map);
        this.map.setView(this.defaultMapCenter, this.defaultMapZoom);
    }
  }

  async saveTask() {
    if (!this.taskTitle || this.taskTitle.trim() === '') {
      this.presentToast('Titel darf nicht leer sein.', 'warning');
      return;
    }

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

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

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

  /**
   * Ruft die aktuelle Geoposition des Geräts mit Cordova ab.
   * @returns Ein Promise, das ein Objekt mit Längen- und Breitengrad zurückgibt, oder null bei Fehler.
   */
  async getCurrentDeviceLocation(): Promise<{latitude: number, longitude: number } | null> {
    try {
      // Optionen für den Geolocation-Aufruf
      const options = {
        timeout: 1000, // Maximale Wartezeit in Millisekunden
        enableHighAccuracy: true // Versucht, eine genauere Position zu erhalten (kann länger dauern und mehr Batterie verbrauchen)
      };

      // Die aktuelle Position abrufen
      const position = await this.geolocation.getCurrentPosition(options);
      console.log('Aktuelle Geräteposition:', position); // Zum Debuggen in der Konsole anzeigen 
      
      // Breitengrad und Längengrad zurückgeben
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
        // Fehlerbehandlung, falls die Position nicht abgerufen werden kann (z.B. Berechtigung verweigert, Timeout)
        console.error('Fehler beim Abrufen der Geräteposition:', error);
        // Hier könnten Sie auch einen Alert oder Toast anzeigen, um den Benutzer zu informieren
        return null;
    }
  }
}
