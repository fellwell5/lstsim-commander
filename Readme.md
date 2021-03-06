
# lstsim-commander

lstsim-commander ist eine Erweiterung für das Spiel lstsim.de um eine realistische Steuerung der Leitstelle zu simulieren.

Gedacht ist die Erweiterung um mit einem Gerät mit Touchscreen die Buttons wie Anruf annehmen, Alarmieren, etc. auszulösen.


Um lstsim-commander zu installieren ist Java erforderlich.
lstsim-commander wird auf dem Hostrechner ausgeführt, also auf dem Computer auf dem lstsim.de gespielt wird.

Die Tasten der Weboberfläche lösen ein virtuelles Keyboard-Event am Hostrechner aus, sprich wie wenn die Tastatur auf den Buchstaben drückt.
Daher muss der Fokus auch auf der Website von lstsim liegen und die Weboberfläche vom commander auf einem anderen Gerät geöffnet sein.

![Screenshot der lstsim-commander Oberfläche (Version 0.0.1)](https://i.imgur.com/p3OfZE3.png)

## Installation

1. Java auf dem Computer [herunterladen](https://www.java.com/) und installieren (wird benötigt für die Auslösung der Tastaturkürzel)
2. Neueste lstsim-commander Version von github [herunterladen](https://github.com/fellwell5/lstsim-commander/releases)
3. Die Datei lstsim-commander (version).exe ausführen
4. Beim ersten ausfürhen auf den Button "Browsererweiterung installieren" klicken
Das Browserplugin ist erforderlich um eine Verbindung zwischen lstsim.de und lstsim-commander herzustellen. Dadurch werden Anrufe im Commander visualisiert.
5. Auf dem Commander-Gerät (Gerät welches mit Touchbildschirm als Leitstellenmonitor eingesetzt wird) den Webbrowser mit http://[IP_des_Hostrechners]:3000 öffnen
Die Webadresse wird am Hostrechner angezeigt
6. Die im Screenshot ersichtliche Weboberfläche sollte nun ersichtlich sein.

In der Commanderansicht ist ein Telefonhörer ersichtlich, ist dieser durchgestrichen ist keine Verbindung zum lstsim.de vorhanden, der Commander kann mit den Befehlen trotzdem verwendet werden, es ist aber kein Visualisierung der Anrufe möglich.

## Installation mittels Source

Für erfahrene Anwender welche den Quellcode lieber direkt ausführen wollen oder weiterentwickeln, kann lstsim-commander auch über npm gestartet werden:

1. Java auf dem Computer [herunterladen](https://www.java.com/) und installieren (wird benötigt für die Auslösung der Tastaturkürzel)
2. Node.js auf dem Hostrechner [herunterladen](https://nodejs.org/en/download/) und installieren
3. Dieses Repository herunterladen
4. Kommandozeile im heruntergeladenenen Ordner öffnen
5. Den Befehl "npm install" und danach "npm start" durchführen
6. Beim ersten ausfürhen auf den Button "Browsererweiterung installieren" klicken
Das Browserplugin ist erforderlich um eine Verbindung zwischen lstsim.de und lstsim-commander herzustellen. Dadurch werden Anrufe im Commander visualisiert.

7. Auf dem Commander-Gerät (Gerät welches mit Touchbildschirm als Leitstellenmonitor eingesetzt wird) den Webbrowser mit http://[IP_des_Hostrechners]:3000 öffnen
Die Webadresse wird am Hostrechner angezeigt
8. Die im Screenshot ersichtliche Weboberfläche sollte nun ersichtlich sein.


## Benachrichtigungen

### In der gepacketen Release-Version ist zurzeit noch keine Konfiguration der Benachrichtigungen möglich

lstsim-commander kann eine Benachrichtigung versenden, wenn ein Anruf länger als eine definierte Zeit wartet.

Die definierte Zeit ist in der Datei .env (wenn die Datei nicht vorhanden ist, die Datei .env.example kopieren und umbennen) mit der Variable *SEND_NOTIFCIATION_AFTER_SECONDS* eingestellt. Bei Änderungen in der .env Datei muss der lstsim-commander neugestartet werden, sprich Kommandozeile beenden (STRG+C) und erneut den Befehl zum Starten ausführen.

Zur Zeit gibt es folgende Möglichkeit Push-Benachrichtigungen zu Anrufen zu erhalten:
### Pushover
Um Benachrichtigungen via Pushover zu erhalten muss die Pushover-App am Handy installiert sein, ein Konto auf https://pushover.net vorhanden sein und eine Pushover-Application registriert werden.
In der Datei .env müssen die Variablen beginnend mit PUSHOVER_ befüllt werden.
*PUSHOVER_ENABLED* auf true setzen
*PUSHOVER_USER_KEY* mit dem Userkey befüllen, dieser ist nach Anmeldung auf https://pushover.net im grauen Feld "Your User Key" ersichtlich.
*PUSHOVER_API_TOKEN* mit dem Application API Token befüllen, [hier kann eine Application erstellt werden](https://pushover.net/apps/build).
