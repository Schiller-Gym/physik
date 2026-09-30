# Elektrodengeometrien

Die sieben SVG-Dateien enthalten die einzigen geometrischen Definitionen der Layouts. Namen, Hinweise und Zuordnungen stehen zentral in ../../electrodes.js. App und Referenzübersicht verwenden denselben Katalog. Die frühere layouts.json ist dadurch ersetzt.

Alle SVGs verwenden viewBox="0 0 1000 1000" und werden über die gesamte Experimentierfläche ausgerichtet. Elektrodengruppen heißen electrode-1, electrode-2 usw. Anschlüsse liegen separat in connections; ihre einzelnen Pfade heißen connection-1 usw. und verweisen mit data-connected-to auf die zugehörige Elektrode.

Die Elektroden und Anschlüsse liegen unter der Petrischale. Ihre Beiträge zum späteren Feld dürfen nicht pauschal ausgeschlossen werden. Die Geometrien sind schematisch, nicht maßstäblich vermessen. Zur Berechnung müssen auch Strichbreiten als Metallflächen berücksichtigt werden. Alle sieben Anordnungen verwenden den gemeinsamen zweidimensionalen Potentiallöser.

Anordnung 03: linke Zuleitung zum Innenring verläuft durch die linksseitige Außenringöffnung.

Anordnung 05: vom Nutzer bestätigt. Senkrechter Stab und schräger Ast bilden gemeinsam die innere Elektrode am oberen Anschluss. Der offene Außenring ist die getrennte Gegenelektrode am unteren Anschluss.

Anordnung 06: electrode-3 ist ein nicht angeschlossener Metallring (data-role="floating"). Sein Potential wird bei verschwindender Gesamtladung berechnet. Die äußeren Platten sind über connection-1 von links und connection-2 von rechts angeschlossen; der Ring hat keine Zuleitung.

Die Referenzübersicht zeigt die SVGs zur Formkontrolle auf dem ursprünglichen Ölbild. Die App verwendet dagegen die getrennten Schichten Elektroden, Glas, Öl und Körner.
