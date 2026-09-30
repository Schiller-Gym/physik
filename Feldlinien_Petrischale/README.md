# Elektrische Felder – interaktives Experiment

Version 0.8.4. Deutschsprachige Simulation eines Grieß-Rizinusöl-Experiments mit sieben Elektrodenanordnungen, beweglichem Streubereich und optionalen Feldlinien. Für den Physikunterricht und die Erprobung auf Tablets.

## Veröffentlichen

Die Anleitung steht in [GITHUB-PAGES.md](GITHUB-PAGES.md). index.html muss direkt im Hauptverzeichnis des GitHub-Repositories liegen. Die Schulhomepage verlinkt anschließend die von GitHub Pages ausgegebene Webadresse.

## Bedienung

1. Elektroden auswählen, Petrischale aufsetzen und Öl einfüllen.
2. Streukreis verschieben, Größe und Verteilung wählen, Körner einstreuen.
3. Spannung einschalten. Feldlinien und Feldpfeile bei Bedarf zuschalten.
4. Rotation, Translation und Strangbildung über die Bewegungsauswahl vergleichen.
5. Spannung ausschalten, um den Streubereich zu ändern, oder den Versuch mit „Neu beginnen“ zurücksetzen.

## Modellgrenzen

Qualitative zweidimensionale Simulation in der Elektrodenebene, ohne Höhe sowie Glas-/Öl-Grenzflächen. Keine quantitativ kalibrierte Vorhersage des realen Versuchs. Insbesondere ist das feldfreie Ringinnere im 2D-Modell nicht mit einer vollständigen Abschirmung oberhalb eines realen flachen Rings gleichzusetzen.

Details zum Modell, zur Zeitsteuerung und zum Aufbau des Programms: [MODELL.md](MODELL.md). Versionsgeschichte: [CHANGELOG.md](CHANGELOG.md).

## Lokal starten und prüfen

Mit installiertem Node.js im Repositoryordner:

```sh
node serve.cjs
```

Dann http://127.0.0.1:8765/ öffnen. Falls dieser Port bereits durch die Entwicklungsversion belegt ist, den bisherigen lokalen Server vorher beenden. Für GitHub Pages wird dieser Server nicht benötigt: Die Simulation läuft vollständig im Browser. Keine Paketinstallation erforderlich.

```sh
node --test tests/*.test.cjs
node build-electrode-assets.cjs --check
```

Nach Änderungen an SVG-Geometrien die eingebetteten Bilder erneuern:

```sh
node build-electrode-assets.cjs
```

Die Dateien in assets/elektroden bleiben die geometrischen Originale. tests enthält die automatischen Prüfungen. Die zusätzliche Seite elektroden-uebersicht.html zeigt alle Layouts.