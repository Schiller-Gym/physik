# Elektrische Felder – Version 0.8.4

Roadmap-Schritt 7f: Alle sieben Elektrodenanordnungen, mit Rotation, Translation und qualitativer Strangbildung.

## Kompaktes Interface

Version 0.8.4 bündelt Schale, Öl und Grieß in einer wechselnden Vorbereitungskachel. Die Elektrodenauswahl bleibt separat. Feld- und Bewegungssteuerung liegen unter der Schale; Erklärungstexte und die rechte Übersichtsspalte entfallen. Physik, Geometrien und Zeitsteuerung bleiben unverändert. Die Darstellung passt sich Tablet-Hoch-/Querformat und schmalen Bildschirmen an.

## Start und Bedienung

Im Projektordner mit installiertem Node.js: `node serve.cjs`. Anschließend http://127.0.0.1:8765/ öffnen. Der Server ist nur lokal erreichbar, keine zusätzlichen Pakete erforderlich. Für GitHub Pages genügt der gesamte Projektinhalt ohne Backups; noch nicht veröffentlicht. Die Elektrodenbilder sind direkt in electrode-assets.js eingebunden. Der Browser-Test erfolgt über HTTP; ein direkter Datei-Start ist nicht verifiziert.

1. Elektroden auswählen, Petrischale aufsetzen, Öl einfüllen. Streukreis auf dem Öl verschieben, Größe und Verteilung wählen, dann Körner einstreuen.
2. Bei allen sieben Anordnungen Spannung einschalten.
3. Bewegung vergleichen: **Nur Rotation**, **Rotation und Verschiebung**, **Rotation, Verschiebung und Stränge**.
4. Feldlinien und Pfeile sind standardmäßig ausgeblendet; bei eingeschalteter Spannung über die Checkboxen ein-/ausblenden. Sie steuern keine Kornbewegung.
5. **Neu verteilen** setzt Positionen und Winkel zufällig neu. Spannung und Bewegungsmodus bleiben erhalten.
6. Spannung aus hält die Körner an. **Neu beginnen** setzt den gesamten Aufbau zurück, einschließlich Bewegungsmodus.

Alle Anordnungen besitzen jetzt eine Feldsimulation. Kurze Stränge entwickeln sich allmählich; es gibt keine vorgegebenen Kornbahnen und keine Garantie für durchgehende Stränge zwischen den Elektroden.

## Streubereich

Den Kreis mit Maus oder Touch verschieben oder auf eine andere Stelle im Öl tippen. Bei Tastaturbedienung den Kreis fokussieren und Pfeiltasten verwenden; mit Umschalt sind die Schritte größer. Die gesamte Kreisfläche bleibt innerhalb des Öls. Der Größenregler passt auch die Kornmenge proportional zur Kreisfläche an: 31–1200 Körner, standardmäßig 276. So werden nicht 1200 Körner in eine kleine Fläche gedrängt.

Standard ist **Zur Mitte dichter**: eine am Kreisrand begrenzte zweidimensionale Gauß-Verteilung, mit Standardabweichung gleich dem halben nutzbaren Kreisradius. **Gleichmäßig** verwendet eine konstante Flächendichte. Beide Varianten sind zufällig; notwendige Kornabstände flachen die zentrale Verdichtung ab. Die Gauß-Verteilung ist eine plausible Anschauung für gezieltes Einstreuen, keine experimentell bestimmte Verteilung.

Der Kreis bestimmt ausschließlich die Anfangspositionen. Später können Körner ihn verlassen. Bei eingeschalteter Spannung ist die Markierung verborgen. Zum Ändern Spannung ausschalten und **Streubereich ändern** wählen: Die bisherigen Körner werden entfernt und können anschließend neu eingestreut werden. **Neu verteilen** verwendet dagegen unmittelbar den bestehenden Streubereich. **Neu beginnen** setzt auch den Streukreis zurück.

## Modell und Grenzen

- 2D-Laplace-Gleichung, konstante Permittivität, Elektrodenpotentiale +0,5 und -0,5. Das Potential wird aus der gerasterten Original-SVG berechnet, inklusive Zuleitungen.
- SOR: Anordnung 02 auf 301 × 301 Punkten mit Abstand 10; Anordnung 01, 03, 04 und 05 auf 601 × 601 Punkten mit Abstand 5, um die Kreisränder feiner abzubilden. Gebiet x=-1000…2000, y=-1005…1995 (02) bzw. -1004…1996 (01, 03, 04 und 05); ferner Rand auf Potential null. Diskrete Residuumgrenze 1e-7. E=-grad(Potential), bilineare Abfrage außerhalb der Leiter.
- Die Anordnungen 01, 02 und 04 bestehen aus räumlich getrennten linken und rechten Leitern. field-geometry.js ordnet die aus SVG-Alpha gerasterten Flächen anhand der Trennlinie x=500 dem positiven/negativen Potential zu. Bei 03 werden zusammenhängende Leiterflächen im SVG-Raster über je einen hinterlegten Startpunkt zugeordnet (8er-Nachbarschaft). Innenring und Zuleitung sind positiv, Außenring und sein Anschluss negativ. Fehlende, verbundene oder nicht zugeordnete Leiter führen zu einer Fehlermeldung. Der isolierte Leiter in 06 nutzt die unten beschriebene Neutralitätsbedingung.
- Eine gespeicherte Lösung wird ausschließlich für dieselbe Layout-ID wiederverwendet. Ein Wechsel der Geometrie erzwingt eine Neuberechnung; Zurücksetzen bricht laufende Berechnungen ab.
- Berechnung in der Elektrodenebene, ohne Höhe, Glas-/Öl-Grenzflächen. Nicht das reale dreidimensionale Feld oberhalb der Elektroden. Fehlende Feldwerte sind keine Aussage über feldfreies Öl.
- Je nach Streukreis 31–1200 Stäbchen mit Längen von 5–8 Zeichnungseinheiten (Breite weiterhin 2,5) mit eigenen Positionen, Winkeln, Abmessungen und Mobilitäten. Die Schalen-Geometrie wird zentral beschrieben.
- Rotation: überdämpftes induziertes Dipolmodell mit Kopf-Schwanz-Symmetrie; vorhandene exakte Winkelintegration bei lokal konstantem Feld bleibt erhalten.
- Translation: qualitative positive Dielektrophorese, Geschwindigkeit proportional zu grad(|E/E_ref|²), normiertes Feld betragsmäßig auf 2 begrenzt. E_ref wird für 01, 02 und 04 in der Schalenmitte bestimmt, für 03 im Ringzwischenraum bei (500,246). Gradient mit Abstand 5, bei fehlendem Nachbarwert einseitig. Driftfaktor 90 in Zeichnungseinheiten.
- Strangbildung: zusätzliche lokale Dipol-Paarkräfte. Anisotrope Polarisation p=0,25e+0,75(u·e)u; Kraft auf Korn a proportional zu [(5(p_a·n)(p_b·n)-p_a·p_b)n-(p_b·n)p_a-(p_a·n)p_b]/r⁴. Das andere Korn erhält die entgegengesetzte Kraft. Vorfaktor 225000, Mindestabstand in der Kraftformel 8; Reichweite 48, sanftes Abschwächen ab 36 Zeichnungseinheiten. Diese Parameter sind Anschauungswerte, keine gemessenen Materialdaten.
- Das äußere Feld bleibt unverändert. Keine selbstkonsistente Rückwirkung aller Körner auf das Feld und kein zusätzliches Nachbar-Drehmoment. Der aktuelle Ansatz ist eine qualitative Näherung, kein quantitatives Grieß-Rizinusöl-Modell.
- Geschwindigkeit auf 8 Zeichnungseinheiten/s begrenzt. Eine räumliche Nachbarsuche vermeidet die Auswertung sämtlicher Teilchenpaare.
- Kontaktmodell: konservative kreisförmige Schutzhüllen um die ganzen Stäbchen verhindern Überlagerungen auch bei Rotation. Seitlich ist der Abstand größer als bei einem exakten Stabkontakt. Blockierte Bewegung wird komponentenweise bzw. mit verkürztem Schritt versucht; geringe Abhängigkeit von der Bearbeitungsreihenfolge ist möglich.
- Ganze Körner bleiben in der Schale. Bewegte Kornmittelpunkte betreten keine Bereiche ohne gültige Feldabfrage. Dort anfänglich liegende Körner bleiben unbewegt. Diese numerische Grenze ist keine reale Metallwand unter der Schale.
- Keine Brownsche Bewegung, Strömung, Sedimentation oder Bewegung nach dem Abschalten.

## Anordnung 07: Platte und Spitze

Zuleitungen von links zur Platte und von rechts zum gerundeten Spitzenkörper werden zusammen mit den Elektroden aus der SVG gerastert. Platte positiv, Spitzenkörper negativ; Leiterzuordnung links/rechts der Trennlinie x=380. Rasterweite 5, Achse y=496. Referenzfeld und zentrale Linienstartpunkte liegen bei x=375 im freien Spalt, weil die Schalenmitte innerhalb des Spitzenkörpers liegt. Sonst gelten derselbe Löser, dieselbe Zeitsteuerung und dieselben Kornkräfte. Das numerisch aufgelöste Spitzenfeld ist qualitativ; unmittelbar an der idealen scharfen Ecke hängt die Feldstärke stark von der Rasterweite ab und ist keine reale maximale Feldstärke.

## Anordnung 06: Isolierter Metallring

Seitliche Zuleitungen führen von den äußeren Kontakten bis zu den Platten und werden wie die Platten in der Feldberechnung berücksichtigt. Platten auf +0,5/-0,5, der Ring ist ein einzelner isolierter, insgesamt neutraler Leiter. Zusammenhängende SVG-Flächen werden über drei Startpunkte zugeordnet; null kennzeichnet das unbekannte Ringpotential. Bei jedem Löserschritt wird ein gemeinsames Ringpotential aus dem Mittel aller Nachbarpotentiale über die freien Gitterflächen berechnet. Dadurch verschwindet die Summe der diskreten auswärts gerichteten Flüsse. Der Ring ist nicht geerdet. Eine asymmetrische Gegenprobe prüft ein von null verschiedenes Potential.

Rasterweite 5, Residuumgrenze 1e-9; Referenzpunkt (300,496) im linken Spalt. Unter 0,1 % des Referenzfeldes werden numerische Restfelder für Darstellung und Bewegung unterdrückt. Das geschlossene Innere bleibt in dieser 2D-Näherung feldfrei. Das ist keine Aussage über die vollständige Abschirmung oberhalb eines realen flachen Rings. Kräfte, Kornmodell und Zeitsteuerung unverändert. Unterstützt ist genau ein isolierter Leiter.

Grundlage: [Floating Potential, COMSOL](https://doc.comsol.com/6.3/doc/com.comsol.help.semicond/semicond_ug_acdc.7.20.html).

## Zeitsteuerung

Gemeinsamer Zeitfaktor 2 für Rotation und Translation: Ziel sind zwei Simulationssekunden pro realer Sekunde. Die Simulationsschritte bleiben 1/60 s, das Feld wird für jeden Schritt an der aktuellen Kornposition abgefragt. Der Faktor wird zentral in grain-view.js mit SimulationClock.create({timeScale:2}) eingestellt. Bei 5–120 Bildern/s wird im Test dieselbe Zeit verarbeitet; die Darstellung erfolgt nur einmal je Bild. Nach einer Unterbrechung werden höchstens 0,25 reale Sekunden (bei Faktor 2: 0,5 Simulationssekunden bzw. 30 Schritte) aufgeholt, um lange Blockaden zu vermeiden. Verborgene Seiten pausieren und starten ohne Nachholsprung. Auf sehr langsamen Geräten ist weiterhin verlangsamte Simulation möglich.

## Code und Prüfungen

- scene-geometry.js: Schale und gemeinsame Randprüfung.
- scatter-model.js: Streukreis, Flächenmenge und Zufallsverteilungen; scatter-view.js: Bedienung und Markierung. tests/scatter.test.cjs prüft Verteilung, Abstände und Randbedingungen.
- simulation-clock.js: feste Simulationsschritte und Pausieren.
- grains.js: Erzeugung und Rotationsmodell; grain-motion.js: Drift, Nachbarwechselwirkung und Kontakte.
- grain-view.js: Teilchendarstellung und Animationsschleife, unabhängig vom globalen Feldzustand.
- app.js: Vorbereitung; field-view.js: Feldberechnung, Anzeige und Bedienung.
- field.js: gemeinsamer Potentiallöser; field-geometry.js: Rastergröße und Potentialzuordnung; field-lines.js: RK4-Linien und Abstandsfilter. Zusätzliche Startpunkte im Außenbereich der Anordnungen 01 und 04. Linien folgen dem Feld in beide Richtungen; kleine Lücken vor Metall sind durch die Gittermaske bedingt. Kein künstliches Ansetzen exakt auf der Oberfläche.
- electrodes.js: Layoutkatalog; electrode-assets.js: automatisch erzeugte SVG-Bilddaten.

Alle Prüfungen: `node --test tests/*.test.cjs`. Ablaufprüfungen nutzen eine kleine In-Memory-Oberfläche und kontrollierte asynchrone Abhängigkeiten. Sie ersetzen nicht den echten Browser-Test. Der analytische Feldtest nutzt eine angenäherte Prüfgeometrie; Browserprüfungen prüfen die tatsächlich gerasterten SVGs.

Nach SVG-Änderungen: `node build-electrode-assets.cjs`. Übereinstimmung prüfen: `node build-electrode-assets.cjs --check` (auch Bestandteil der Tests). Version und Änderungen stehen in VERSION, CHANGELOG.md und ROADMAP.md.

## Sicherheitskopien

ZIPs ausschließlich unter _Backups, ohne _Backups und .git im Archiv. Bestehende Archive werden nicht überschrieben. Für neue Sicherungen: `powershell -File backup.ps1 -Stage Schritt-6`. Das Skript prüft jeden archivierten Dateiinhalt mit SHA-256 gegen die Originaldatei und legt zusätzlich eine Prüfsummendatei an. Zur Wiederherstellung das gewünschte Archiv zunächst in einen separaten Ordner entpacken und dort prüfen. Die ursprünglichen Schritte 1 und 2 wurden nicht nachträglich rekonstruiert.

## Fachliche Orientierung

- [COMSOL: Dielectrophoretic Separation](https://www.comsol.com/blogs/dielectrophoretic-separation): Bewegung neutraler polarisierbarer Teilchen in inhomogenen Feldern.
- [University of Texas: Dipole-Dipole Interaction, Problem 3](https://web2.ph.utexas.edu/~vadim/Classes/2018f/sol07.pdf): vektorielle Dipol-Paarwechselwirkung.
- [Colloidal Analogues of Charged and Uncharged Polymer Chains](https://pmc.ncbi.nlm.nih.gov/articles/PMC3556699/): experimentelle feldinduzierte Kettenbildung. Die dortigen Materialien und Parameter werden nicht auf dieses Modell übertragen.

## Besonderheiten der Ringe (03)

Die Öffnung des Außenrings und beide Zuleitungen sind Teil der Berechnung. Der Innenring ist geschlossen; sein Inneres ist im idealisierten 2D-Modell praktisch feldfrei. Für 03 wird mit Residuumgrenze 1e-9 gerechnet. Feldbeträge unter 0,1 % des Referenzfeldes werden für Darstellung und Bewegung auf null gesetzt, damit numerische Restfelder keine künstliche Ausrichtung verursachen. Das ist eine numerische Schwelle und keine Materialeigenschaft. Feldlinien starten zusätzlich auf einem Kreis im Ringzwischenraum. Der Standard-Streukreis liegt überwiegend innerhalb des Innenrings: Zum Beobachten der Bewegung den Streubereich zwischen die Ringe verschieben oder vergrößern. Die Aussage über das Innere gilt für die Elektrodenebene; das reale Feld oberhalb des Rings kann abweichen.

## Sonderanordnung 05

Stab und schräger Ast sind einschließlich oberer Zuleitung ein positiver Leiter. Der offene Außenring mit unterem Anschluss ist negativ. Zusammenhängende SVG-Rasterflächen werden wie bei 03 getrennt zugeordnet. Die Feldreferenz liegt rechts neben dem Stab bei (650,496), da die Schalenmitte auf Metall liegt. Potentialzeichen stehen neben dem oberen und unteren Kontakt außerhalb der Schale. Das 5er-Gitter bleibt eine Näherung; insbesondere die Felder an den abgerundeten Enden sind auflösungsabhängig. Keine Änderung von Kornkräften oder Zeitfaktor.
