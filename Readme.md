
# lstsim-commander

lstsim-commander ist eine Erweiterung für das Spiel lstsim.de um eine realistische Steuerung der der Leitstelle zu simulieren.

Gedacht ist die Erweiterung um mit einem Gerät mit Touchscreen die Buttons wie Anruf annehmen, Alarmiern, etc. auszulösen.
![Screenshot der lstsim-commander Oberfläche (Version 0.0.1)](https://i.imgur.com/p3OfZE3.png)

## Installation
Um lstsim-commander zu installieren ist Node.js erforderlich.
lstsim-commander wird auf dem Hostrechner installiert, also auf dem Computer auf dem lstsim.de gespielt wird.

 1. Node.js auf dem Hostrechner [herunterladen](https://nodejs.org/en/download/) und installieren
 2. Dieses Repository herunterladen
 3. Kommandozeile im heruntergeladenenen Ordner öffnen
 4. Den Befehl "npm install" und danach "npm start" durchführen
 5. Einen Webbrowser auf dem Hostrechner öffnen, die Seite https://localhost:3000/install öffnen und der Anleitung zur Installation des Browserplugins folgen
 Das Browserplugin ist erforderlich um eine Verbindung zwischen lstsim.de und lstsim-commander herzustellen. Dadurch werden Anrufe im Commander visualisiert.
 
 6. Auf dem Commander-Gerät (Gerät welches mit Touchbildschirm als Leitstellenmonitor eingesetzt wird) den Webbrowser mit http://[IP_des_Hostrechners]:3000 ([Wie finde ich meine lokale IP-Adresse?](https://www.ionos.at/digitalguide/hosting/hosting-technik/ip-adresse-finden/#:~:text=Geben%20Sie%20den%20Befehl%20%E2%80%9Ecmd,Ihrer%20eigenen%20lokalen%20IP-Adresse.)) öffnen
 7. Die im Screenshot ersichtliche Weboberfläche sollte nun ersichtlich sein.

In der Commanderansicht ist ein Telefonhörer ersichtlich, ist dieser durchgestrichen ist keine Verbindung zum lstsim.de vorhanden, der Commander kann mit den Befehlen trotzdem verwendet werden, es ist aber kein Visualisierung der Anrufe möglich.

## Benachrichtigunen

lstsim-commander kann eine Benachrichtigung versenden, wenn ein Anruf länger als eine definierte Zeit wartet.

Die definierte Zeit ist in der Datei .env (wenn die Datei nicht vorhanden ist, die Datei .env.example kopieren und umbennen) mit der Variable *SEND_NOTIFCIATION_AFTER_SECONDS* eingestellt. Bei Änderungen in der .env Datei muss der lstsim-commander neugestartet werden, sprich Kommandozeile beenden (STRG+C) und erneut den Befehl zum Starten ausführen.

Zur Zeit gibt es folgende Möglichkeit Push-Benachrichtigungen zu Anrufen zu erhalten:
### Pushover
Um Benachrichtigungen via Pushover zu erhalten muss die Pushover-App am Handy installiert sein, ein Konto auf https://pushover.net vorhanden sein und eine Pushover-Application registriert werden.
In der Datei .env müssen die Variablen beginnend mit PUSHOVER_ befüllt werden.
*PUSHOVER_ENABLED* auf true setzen
*PUSHOVER_USER_KEY* mit dem Userkey befüllen, dieser ist nach Anmeldung auf https://pushover.net im grauen Feld "Your User Key" ersichtlich.
*PUSHOVER_API_TOKEN* mit dem Application API Token befüllen, [hier kann eine Application erstellt werden](https://pushover.net/apps/build).