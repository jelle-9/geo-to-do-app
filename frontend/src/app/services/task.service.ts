import { Injectable } from '@angular/core'; // Macht diese Klasse als Service "injizierbar" (nutzbar in anderen Teilen der App).
import { HttpClient } from '@angular/common/http'; // Angulars Service, um HTTP-Anfragen zu senden.
import { Observable } from 'rxjs'; // Ein Kernkonzept von RxJS (Reactive Extensions for JavaScript), das von Angular verwendet wird, 
                                   // um asynchrone Datenströme (wie Antworten von API-Aufrufen) zu handhaben.
import {map} from 'rxjs/operators'; // Ein RxJS-Operator, um Daten innerhalb eines Observable-Streams zu transformieren.
import {Task} from '../models/task.interface'; // Das TypeScript-Interface, das die Struktur eines Task-Objekts definiert.

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:5000/api'; // Die Basis-URL für die API, die die Anwendung ansprechen wird.

  // Angulars Dependency Injection System stellt automatisch eine Instanz des HttpClient-Service bereit und
  // weist sie der privaten Eigenschaft http zu -> this.http (TypeScript).
  constructor(private http: HttpClient) { }
  
  /**
   * Ruft alle Tasks vom Backend ab.
   * @returns Ein Observable mit einem Array von Task-Objekten.
   */
  getTasks(): Observable<Task[]> {
    // Sendet eine HTTP GET-Anfrage an die URL `${this.apiUrl}/tasks`.
    // Das Backend (deine Flask-API) sollte ein Objekt zurückgeben, das so aussieht: { "tasks": [Task, Task, ...] }.
    // Der Typ-Parameter `<{ tasks: Task[] }>` teilt HttpClient mit, welche Struktur die JSON-Antwort hat.
    return this.http.get<{ tasks: Task[] }>(`${this.apiUrl}/tasks`)
      .pipe( // '.pipe()' erlaubt das Verketten von RxJS-Operatoren, um den Datenstrom zu bearbeiten.

        map(response => response.tasks) // Der 'map'-Operator transformiert den empfangenen Wert.
                                        // Er nimmt das gesamte Antwortobjekt und gibt nur das 'tasks'-Array zurück.
                                        // Komponenten, die diese Methode abonnieren, erhalten also direkt das Array von Tasks.
      );
  }

   /**
   * Ruft einen einzelnen Task anhand seiner ID vom Backend ab.
   * @param id Die ID des Tasks.
   * @returns Ein Observable mit dem Task-Objekt.
   */
  getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/${id}`);
  }

  /**
   * Sendet Daten für einen neuen Task an das Backend.
   * @param taskData Die Daten für den neuen Task (mindestens Titel, Beschreibung optional).
   * @returns Ein Observable mit dem vom Backend erstellten Task-Objekt (inkl. ID, Zeitstempel).
   */
  addTask(taskData: { title: string; description?: string | null }): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, taskData);
  }

  /**
   * Sendet aktualisierte Daten für einen bestehenden Task an das Backend.
   * @param id Die ID des zu aktualisierenden Tasks.
   * @param taskData Die Felder des Tasks, die aktualisiert werden sollen.
   * Partial<Task> bedeutet, dass nicht alle Felder von Task gesendet werden müssen.
   * @returns Ein Observable mit dem vom Backend aktualisierten Task-Objekt.
   */
  updateTask(id: number, taskData: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${id}`, taskData);
  }

  /**
   * Sendet eine Anfrage zum Löschen eines Tasks an das Backend.
   * @param id Die ID des zu löschenden Tasks.
   * @returns Ein Observable. Die Antwort des Backends kann variieren (oft leer oder eine Erfolgsmeldung).
   */
  deleteTask(id: number): Observable<any> { // 'any' oder 'void', wenn keine Antwort erwartet wird
    return this.http.delete<any>(`${this.apiUrl}/tasks/${id}`);
  }
}