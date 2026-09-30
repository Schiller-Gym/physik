# Upload und GitHub Pages

Dieser Ordner ist eine vorbereitete Kopie der Version 0.8.4. Es wurde noch nichts auf GitHub hochgeladen oder veröffentlicht.

## 1. Repository anlegen

Auf GitHub ein neues Repository anlegen, beispielsweise elektrische-felder. Für GitHub Pages mit GitHub Free ein öffentliches Repository wählen. Der Programmcode wird dadurch öffentlich lesbar. Kein zusätzliches README erzeugen, da hier bereits eines enthalten ist.

## 2. Inhalt hochladen

Im Repository „Add file“ → „Upload files“ öffnen (bei einem leeren Repository den Link zum Hochladen vorhandener Dateien nutzen).

Den INHALT dieses Ordners hineinziehen: sämtliche Dateien sowie die Ordner assets und tests. Nicht den übergeordneten Ordner „_GitHub Repository“ als Unterordner hochladen. Ordnerstruktur beibehalten; index.html, style.css und die JavaScript-Dateien müssen direkt auf der obersten Ebene liegen.

Auch .nojekyll und .gitignore mitnehmen. .nojekyll schaltet die Jekyll-Verarbeitung ab. Falls die leere Datei beim Browser-Upload nicht mitgenommen wird, im Repository über „Add file“ → „Create new file“ eine Datei namens .nojekyll mit einer Leerzeile anlegen.

Upload mit einer Beschreibung wie „Erste Veröffentlichung – Version 0.8.4“ auf dem Hauptzweig main speichern. Keine ZIP-Datei anstelle der entpackten Dateien hochladen.

## 3. Pages einschalten

Im Repository „Settings“ → „Pages“ öffnen:

- Source: „Deploy from a branch“
- Branch: main
- Folder: / (root)
- Save

Nach erfolgreicher Veröffentlichung erscheint dort der Website-Link, normalerweise https://BENUTZERNAME.github.io/elektrische-felder/ . Die erste Veröffentlichung kann einige Minuten dauern. Maßgeblich ist der tatsächlich angezeigte Link.

## 4. Auf dem iPad testen und verlinken

Den Pages-Link in Safari öffnen. Vorbereitung, Streukreis per Touch, Hoch-/Querformat, Feldlinien, 1200 Körner und Zurücksetzen prüfen. Danach genau diesen Link auf der Schulhomepage hinterlegen. Ein GitHub-Konto wird zum Aufrufen der veröffentlichten App nicht benötigt.

## 5. Spätere Änderungen

Dieser Uploadordner synchronisiert sich nicht automatisch mit dem übergeordneten Entwicklungsordner. Nach Änderungen eine neue geprüfte Uploadfassung erstellen bzw. die geänderten Dateien hier aktualisieren. Anschließend die Änderungen in dasselbe GitHub-Repository auf main hochladen. Pages veröffentlicht erneut unter derselben Adresse. Auf dem iPad nach einem Update neu laden und die Versionsnummer prüfen.

Backups, interne Entwürfe und persönliche Arbeitsdateien bleiben außerhalb dieses Ordners. Die automatischen Tests, Original-SVGs und Hilfsprogramme sind für die weitere Wartung enthalten; auf dem Pages-Server werden keine Node.js-Prozesse ausgeführt.

## Offizielle Dokumentation (geprüft am 27.09.2026)

- https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits