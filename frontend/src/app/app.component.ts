import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
// import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  trashOutline, 
  createOutline, 
  add,
  // hier alle Icons, die du in der App verwendet werden, 
  // auch die für die Tab-Bar, falls sie nicht automatisch geladen werden:
  flashOutline, // Beispiel für Tab1 (falls man flash-outline verwendet)
  appsOutline,  // Beispiel für Tab2
  sendOutline,  // Beispiel für Tab3
  ellipse, // Wird oft für Tab-Badges oder als Fallback genutzt
  square,  // Weiteres Beispiel
  triangle // Weiteres Beispiel
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonicModule],
})
export class AppComponent {
  constructor() {

    addIcons({
      // Der String-Schlüssel ist der Name, die im HTML <ion-icon name="..."> verwendet wird.
      'trash-outline': trashOutline,
      'create-outline': createOutline,
      'add': add,
      // Tab-Bar Icons:
      'flash-outline': flashOutline,
      'apps-outline': appsOutline,
      'send-outline': sendOutline,
      // Nötig für Ionic Tab Bar Fallbacks oder wenn Icons nicht explizit gesetzt sind
      'ellipse': ellipse,
      'square': square,
      'triangle': triangle
    });
  }
}
