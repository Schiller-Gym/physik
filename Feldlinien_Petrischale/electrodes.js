'use strict';
// Shared catalog for the app and gallery. Geometry lives only in the referenced SVG files.
const ELECTRODE_LAYOUTS = [
  {
    "id": "01-zwei-kreise",
    "field": { "spacing": 5, "axisY": 496, "splitX": 500, "areaSeeds": true },
    "file": "assets/elektroden/01-zwei-kreise.svg",
    "title": "Zwei Kreiselektroden",
    "referenceImage": 1,
    "note": "",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [
      {
        "id": "connection-1",
        "electrode": "electrode-1"
      },
      {
        "id": "connection-2",
        "electrode": "electrode-2"
      }
    ]
  },
  {
    "id": "02-parallele-platten",
    "field": { "spacing": 10, "axisY": 495, "splitX": 500, "areaSeeds": false },
    "file": "assets/elektroden/02-parallele-platten.svg",
    "title": "Zwei parallele Platten",
    "referenceImage": 2,
    "note": "",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [
      {
        "id": "connection-1",
        "electrode": "electrode-1"
      },
      {
        "id": "connection-2",
        "electrode": "electrode-2"
      }
    ]
  },
  {
    "id": "03-konzentrische-ringe",
    "field": { "spacing": 5, "axisY": 496, "areaSeeds": true, "ringSeeds": 250, "referencePoint": [500,246], "relativeFloor": 0.001, "tolerance": 1e-9, "electrodeSeeds": [[500,329,0.5],[830,496,-0.5]] },
    "file": "assets/elektroden/03-konzentrische-ringe.svg",
    "title": "Konzentrische Ringe",
    "referenceImage": 3,
    "note": "Äußerer Ring mit nach links ausgerichteter Öffnung. Die waagerechte Zuleitung zum Innenring verläuft mittig durch diese Öffnung, ohne den Außenring zu berühren.",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [
      {
        "id": "connection-1",
        "electrode": "electrode-1"
      },
      {
        "id": "connection-2",
        "electrode": "electrode-2"
      }
    ]
  },
  {
    "id": "04-kreis-platte",
    "field": { "spacing": 5, "axisY": 496, "splitX": 500, "areaSeeds": true },
    "file": "assets/elektroden/04-kreis-platte.svg",
    "title": "Kreiselektrode und Platte",
    "referenceImage": 4,
    "note": "",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [
      {
        "id": "connection-1",
        "electrode": "electrode-1"
      },
      {
        "id": "connection-2",
        "electrode": "electrode-2"
      }
    ]
  },
  {
    "id": "05-verzweigung-offener-ring",
    "field": { "spacing": 5, "axisY": 496, "areaSeeds": true, "referencePoint": [650,496], "electrodeSeeds": [[500,400,0.5],[500,826,-0.5]], "polarity": [[535,45],[535,975]], "status": "Spannung an · Stab und Ast oben positiv, Außenring unten negativ." },
    "file": "assets/elektroden/05-verzweigung-offener-ring.svg",
    "title": "Verzweigte Elektrode im offenen Ring",
    "referenceImage": 5,
    "note": "Bestätigte Zuordnung: senkrechter Stab und schräger Ast bilden eine gemeinsame Elektrode am oberen Anschluss; der offene Außenring ist die getrennte Gegenelektrode am unteren Anschluss.",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [
      {
        "id": "connection-1",
        "electrode": "electrode-1"
      },
      {
        "id": "connection-2",
        "electrode": "electrode-2"
      }
    ]
  },
  {
    "id": "06-platten-mit-ring",
    "field": { "spacing": 5, "axisY": 496, "seedX": 300, "areaSeeds": true, "referencePoint": [300,496], "relativeFloor": 0.001, "tolerance": 1e-9, "electrodeSeeds": [[240,496,0.5],[760,496,-0.5],[500,354,null]] },
    "file": "assets/elektroden/06-platten-mit-ring.svg",
    "title": "Platten mit isoliertem Metallring",
    "referenceImage": 6,
    "note": "Mittlerer Ring ohne Anschluss; für die spätere Simulation als elektrisch isolierter Leiter mit zunächst verschwindender Gesamtladung behandeln.",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      },
      {
        "id": "electrode-3",
        "role": "floating"
      }
    ],
    "connections": [{"id":"connection-1","electrode":"electrode-1"},{"id":"connection-2","electrode":"electrode-2"}]
  },
  {
    "id": "07-platte-spitze",
    "field": { "spacing": 5, "axisY": 496, "splitX": 380, "seedX": 375, "referencePoint": [375,496], "areaSeeds": true },
    "file": "assets/elektroden/07-platte-spitze.svg",
    "title": "Platte und Spitze",
    "referenceImage": 7,
    "note": "Gerundeter Elektrodenkörper mit zur Platte gerichteter Spitze, nach Foto 7.",
    "electrodes": [
      {
        "id": "electrode-1",
        "role": "driven"
      },
      {
        "id": "electrode-2",
        "role": "driven"
      }
    ],
    "connections": [{"id":"connection-1","electrode":"electrode-1"},{"id":"connection-2","electrode":"electrode-2"}]
  }
];
const DEFAULT_ELECTRODE_ID = "02-parallele-platten";
