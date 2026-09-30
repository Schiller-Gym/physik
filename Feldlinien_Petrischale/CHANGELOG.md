## 0.8.4 – Anschlüsse für Anordnung 07

Linke Zuleitung zur Platte (x=35 bis 286) und rechte Zuleitung zum Spitzenkörper (x=709 bis 965), jeweils y=496 und im bestehenden Stil. Katalog und eingebettete SVGs aktualisiert. Beide Leitungen sind Teil der Feldberechnung; Spalt und Spitze unverändert. Prüfraster um Leitungen und Potentialzuordnung ergänzt. GitHub-Uploadordner auf denselben Stand gebracht.

## 0.8.3 – Zuleitungen für Anordnung 06

Linke Zuleitung von x=35 bis 226 und rechte von x=774 bis 965 auf y=496, im Stil der übrigen Anordnungen. Katalogzuordnung und eingebettete SVG-Daten aktualisiert. Zuleitungen sind Teil der jeweiligen Leiterfläche im Feldlöser; der Ring bleibt isoliert. Geometrieprüfung auf Potentialzuordnung und Ausschluss der Zuleitungen aus der freien Feldabfrage erweitert.

## 0.8.2 – Schritt 7f: Isolierter Metallring (27.09.2026)

Anordnung 06 freigegeben. Ein gemeinsames unbekanntes Ringpotential wird durch verschwindenden gesamten diskreten Fluss bestimmt. Keine Erdung und keine Aufteilung des Rings in positive/negative Hälften. Gemeinsamer Löser um genau einen isolierten Leiter erweitert; bisherige Geometrien und Kräfte unverändert. Referenzfeld im linken Spalt, numerische Restfeldschwelle für das abgeschirmte Innere. Neue Neutralitäts-, Symmetrie-, Verschiebungs-, Potentialoffset-, Feldlinien- und Bewegungsprüfung; alle 14 Prüfdateien bestanden. Damit sind alle sieben Anordnungen implementiert.
## 0.8.1 – Schritt 7e: Platte und Spitze (27.09.2026)

Anordnung 07 für Feld, Rotation, Translation und Strangbildung freigegeben. Referenzpunkt und zentrale Linienstartpunkte im Spalt zwischen Platte und Spitze. Trennlinie für die Potentialzuordnung außerhalb beider Leiter. Original-SVG und bestehende Physik unverändert. Eigene numerische Prüfung mit Raster-/Gebietsvergleich, Feldverstärkung vor der Spitze, Symmetrie, Linien und Kornbewegung; Controllerprüfung für Auswahl, Cache und Rückwechsel ergänzt. 06 bleibt offen.
## 0.8.0 – Kompaktes Interface für Tablets (27.09.2026)

Separate Elektrodenauswahl und eine wechselnde Vorbereitungskachel für Schale, Öl und Grieß. Rechte Übersicht und Erklärungstexte entfernt. Feld- und Bewegungssteuerung direkt unter der größeren Experimentierfläche. Abgeschlossene Vorbereitungsschritte als kompakte Fortschrittsanzeige; Streubereich weiterhin veränderbar. Responsive Anordnung, mindestens 44 px hohe Bedienelemente, Tastaturfokus beim Schrittwechsel. Veraltete DOM-Verweise und ungenutzte Variable entfernt; Physik und Geometrien unverändert. Ablaufprüfung auf die neue Vorbereitung erweitert. Sicherheitskopien vor/nach dem Umbau.
## 0.7.3 – Schritt 7d: Verzweigte Elektrode im offenen Ring

Anordnung 05 freigegeben. Gemeinsamer positiver Stab/Ast mit oberer Zuleitung, negativer Außenring mit unterem Anschluss; zusammenhängende SVG-Leiterzuordnung wie bei 03. Referenzfeld rechts neben dem Stab, da die Mitte auf Metall liegt. Potentialzeichen werden je Layout positioniert; für 05 oben/unten außerhalb der Schale. Eigene Feld-/Bewegungsprüfung und Controllerprüfung der Kontaktzeichen ergänzt. Kräfte, Zeitfaktor und Streumodell unverändert.

## 0.7.2 – Schritt 7c: Konzentrische Ringe

Anordnung 03 freigegeben: zusammenhängende SVG-Leiterflächen statt Links-/Rechts-Aufteilung; Innenring samt Zuleitung positiv, offener Außenring samt Anschluss negativ. Kontakt-/Zuordnungsfehler werden abgefangen. Gemeinsamer Referenzwert für Pfeile und Körnerbewegung; bei Ringen im Zwischenraum statt im feldarmen Zentrum. Engere Lösertoleranz und relative numerische Nullschwelle für 03. Zusätzliche radiale Linienstartpunkte. Tests für Zuordnung, Öffnung, Abschirmung, logarithmisches Ringpotential/1-r-Feld und Bewegung. Bestehende Geometrien und Kornkräfte unverändert.

## 0.7.1 – Schritt 7b: Kreiselektrode und Platte

Anordnung 04 für Feld, Feldlinien und gekoppelte Körnerbewegung freigegeben. Nutzt die vorhandene SVG-Rasterung, das 5er-Gitter und den gemeinsamen Potentiallöser ohne zusätzliche Produktionslogik. Eigene Prüfung des asymmetrischen Felds, der Auflösungs-/Gebietsabhängigkeit, Leitergrenzen, Linien und Kornbewegung; Controllerprüfung für Wechsel und Cache ergänzt. Anzeige der verfügbaren Anordnungen aktualisiert. Kräfte, Zeitfaktor, Streukreis und bisherige Geometrien unverändert.

## 0.7.0 – Schritt 7a: Zwei Kreiselektroden

Anordnung 01 für Feld, Feldlinien und Körnerbewegung freigegeben. Gemeinsamer Potentiallöser und Original-SVG-Rasterung; feineres 5er-Gitter für Kreise. Raster-/Potentialzuordnung aus der Bedienlogik ausgelagert, explizite Freigabe je Layout. Cache an Layout-ID gebunden, sodass beim Wechsel kein fremdes Feld wiederverwendet wird. Feldlinien um zusätzliche Außenbereichs-Startpunkte ergänzt. Vorbereitungshinweise und Versionsanzeige angepasst. Numerische Kreisprüfungen und Tests für Layoutwechsel/Abbruch ergänzt. Anordnung 02 sowie Kräfte, Zeitfaktor, Kornabmessungen und Streukreis unverändert; 03–07 noch nicht freigegeben.

## 0.6.5 – Kreisförmiges Einstreuen

Verschiebbarer Streukreis mit Größenregler, standardmäßig zur Mitte verdichteter Gauß-Verteilung und alternativ gleichmäßiger Flächenverteilung. Kornmenge proportional zur Kreisfläche: 31–1200, standardmäßig 276. Maus-, Pointer- und Tastaturbedienung; vollständiger Kreis bleibt im Öl. Änderungen nach dem Einstreuen über einen eigenen Button bei ausgeschalteter Spannung. Markierung bei Spannung an verborgen; keine zusätzliche Grenze für die Bewegung. Kräfte, Kornabmessungen und gemeinsamer Zeitfaktor unverändert. Separate Modell-/Darstellungsmodule, Verteilungs- und Ablaufprüfungen ergänzt.

## 0.6.4 – Gemeinsamer Zeitfaktor 2

Rotation und Translation verarbeiten gemeinsam die doppelte Simulationszeit. Integration weiter in Schritten von 1/60 s; keine Vergrößerung des Einzelzeitschritts oder Änderung der Kräfte. Pause/Neustart ohne Nachholsprung, begrenztes Aufholen nach langen Unterbrechungen. Abstandsprüfung mit quadrierten Distanzen spart Wurzelberechnungen bei unveränderter Kontaktbedingung. Anzeige Tempo 2× im Fußbereich.

## 0.6.3 – 1200 Körner

Standardanzahl auf 1200 erhöht. Länge, Breite, Kräfte und Zeitsteuerung unverändert; eine Beschleunigung ist noch nicht umgesetzt.

## 0.6.2 – Mehr und kürzere Körner

760 statt 380 Körner; Länge 5–8 statt 8–13 Zeichnungseinheiten, Breite weiterhin 2,5. Kontaktabstände folgen automatisch den tatsächlichen Abmessungen. Qualitative Paarwechselwirkung auf ein Viertel reduziert, Reichweite 48 statt 64, Abschwächung ab 36 statt 48; maximale Verschiebungsgeschwindigkeit 8 statt 12. Feldgradient-Drift und Rotation bleiben ansonsten unverändert. Keine materialphysikalische Neukalibrierung. Standardanzeige der Feldlinien bleibt aus.

## 0.6.1 – Feldanzeige zunächst ausgeblendet

Feldlinien beim ersten Start und nach Neu beginnen standardmäßig aus. Spannung einschalten startet die Körnerbewegung ohne Feldlinien oder Feldpfeile. Anzeige optional über die Checkboxen. Eine bewusst gewählte Anzeige bleibt beim Aus-/Einschalten der Spannung erhalten. Kornanzahl, Abmessungen und Bewegungsmodell unverändert.

## 0.6.0 – Schritt 6 abgeschlossen

- Drei Vergleichsmodi: Rotation; zusätzlich Translation im Feldgradienten; zusätzlich lokale Dipol-Wechselwirkungen für kurze Stränge.
- Gemeinsame Simulationsuhr, konservative Kornkontakte, Schalenbegrenzung und Schutz vor ungültigen Feldbereichen.
- Räumliche Nachbarsuche; Physik, Darstellung und Steuerung getrennt. Zentrale Schalen-Geometrie und entfernte ungenutzte CSS-Regeln.
- Körner neu verteilen ersetzt den bisherigen reinen Winkel-Neustart und erhält Spannung und Modus.
- Neue Prüfungen für Zeitsteuerung, Bewegung, Kontakte, Bildpaket und Ablaufsteuerung. backup.ps1 erzeugt und überprüft Meilensteinarchive.
- Modellgrenzen sichtbar erläutert. Felder bleiben auf Anordnung 02 beschränkt.

## 0.5.2 – Grundlage für Schritt 6

Gemeinsame Simulationsuhr (60 Teilschritte/s), vollständige Zeitverarbeitung bei 5–120 Bildern/s; begrenztes Aufholen nach langen Unterbrechungen. Gemeinsame Schalen-Geometrie; ungenutzte CSS-Regeln entfernt. Animation kennt den globalen Feldzustand nicht mehr. Zusätzliche Tests für Bildfehler, Abbruch, Neustart, Pausieren und Mehrfachstart. Noch keine Translation.

## 0.5.1 – Ladefehler der Elektroden behoben

- Bestätigter Fehler: SVG-Bild konnte nicht dekodiert werden; deshalb fehlten Elektroden und die Feldberechnung konnte die Rotation nicht starten. Beim anschließenden Verbindungstest war der lokale Server nicht erreichbar. Nach dessen Neustart funktionierte bereits 0.5.0; die genaue Ursache des ursprünglichen fehlgeschlagenen Bildabrufs ist nicht mehr rekonstruierbar.
- Anzeige, Galerie und Feldraster verwenden nun eingebettete SVG-Bilddaten mit explizitem Bildtyp, ohne separaten SVG-Abruf. Die Original-SVGs bleiben die bearbeitbare Quelle; ein kleines Generierungsskript erzeugt das gemeinsame Bildpaket.
- Rotationsmodell unverändert; kein eigenständiger Fehler der Rotationsformel festgestellt.

# Änderungen

## 0.5.0 – Roadmap-Schritt 5

- Feste SVG-Kornformen durch Datenobjekte mit drehbarer Stäbchendarstellung ersetzt.
- Gedämpfte feldabhängige Rotation, unabhängig von der Feldlinienanzeige.
- Größere sichtbare Stäbchen und Mindestabstand beim Einstreuen.
- Ausrichtung neu starten, Stopp bei Spannung aus, Animation bei verborgenem Tab pausiert.
- Modellgrenze über Metallflächen ausdrücklich erklärt.
- Numerische Tests und Browserprüfung bestanden.

## 0.4.0 – Roadmap-Schritt 4

- Feldlinien aus dem bestehenden Potentialfeld mittels RK4, mit Richtungspfeilen.
- Unabhängige Schalter für Linien und lokale Feldpfeile; drei Dichtestufen.
- Keine Neuberechnung des Potentialfelds beim Ändern der Liniendichte.
- Rücksetzen entfernt Linien und stellt die mittlere Dichte wieder her.
- Potentialkennzeichnungen an den äußeren Kontaktenden bleiben erhalten.
- Numerische Linienprüfungen und Browser-Funktionstests bestanden.

## 0.3.0 – Roadmap-Schritt 3

- Erster numerischer 2D-Potentiallöser für parallele Platten einschließlich Zuleitungen.
- Spannungsschalter, Polaritätsanzeige und unabhängig einblendbare Feldpfeile.
- Andere Elektrodenanordnungen bleiben ohne aktivierbare Feldberechnung.
- Rücksetzen verwirft laufende Berechnungen und blendet Feld sowie Polarität aus.
- Modellgrenzen in der Oberfläche und Dokumentation erläutert.
- Nutzerbestätigung für Anordnung 05 übernommen.
- Lokaler Startserver, reproduzierbare numerische Tests, Prüfprotokoll und Versionskennung ergänzt.
- Erste vollständige versionierte Projektsicherung; bisherige Schritte waren nicht separat versioniert.
