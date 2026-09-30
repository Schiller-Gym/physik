'use strict';
// Reference sheet: the oil image is intentionally retained as a static comparison background.
for (const layout of ELECTRODE_LAYOUTS) {
  const card = document.createElement('article');
  const title = document.createElement('h2');
  title.textContent = String(layout.referenceImage).padStart(2, '0') + ' · ' + layout.title;
  const dish = document.createElement('div');
  dish.className = 'dish';
  for (const [src, alt] of [['assets/petrischale-mit-oel.png', 'Petrischale mit Öl'], [layout.file, layout.title]]) {
    const image = document.createElement('img');
    image.src = ELECTRODE_IMAGES[src] || src;
    image.alt = alt;
    dish.append(image);
  }
  const link = document.createElement('a');
  link.href = ELECTRODE_IMAGES[layout.file];
  link.download = layout.file.split('/').pop();
  link.textContent = 'SVG-Layout herunterladen';
  card.append(title, dish, link);
  if (layout.note) {
    const note = document.createElement('small');
    note.textContent = layout.note;
    card.append(note);
  }
  document.getElementById('layout-gallery').append(card);
}
