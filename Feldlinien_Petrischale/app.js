'use strict';
const $ = id => document.getElementById(id);
for (const ellipse of document.querySelectorAll('[data-dish-boundary]')) {
  for (const [attribute,value] of Object.entries({cx:SceneGeometry.x,cy:SceneGeometry.y,rx:SceneGeometry.rx,ry:SceneGeometry.ry})) ellipse.setAttribute(attribute,value);
}
const state = { electrodes: false, dish: false, oil: false, grains: false };
const electrodeSelect = $('electrode-shape');
for (const layout of ELECTRODE_LAYOUTS) {
  electrodeSelect.add(new Option(String(layout.referenceImage).padStart(2, '0') + ' · ' + layout.title, layout.id));
}
electrodeSelect.value = DEFAULT_ELECTRODE_ID;
const selectedLayout = () => ELECTRODE_LAYOUTS.find(layout => layout.id === electrodeSelect.value);
function render() {
  $('glass-layer').setAttribute('display', state.dish ? 'inline' : 'none');
  $('oil-layer').setAttribute('display', state.oil ? 'inline' : 'none');
  $('dish-description').textContent = !state.electrodes ? 'Leere Experimentierfläche' : 'Versuchsaufbau in Draufsicht: ' + $('electrode-shape').selectedOptions[0].text + (state.dish ? ', Petrischale aufgesetzt' : ', ohne Petrischale') + (state.oil ? ', mit Rizinusöl' : '') + (state.grains ? ', mit zufällig verteilten Grießkörnern' : '');
  $('electrode-shape').disabled = state.dish;
  $('electrodes').disabled = state.electrodes;
  $('electrodes').textContent = state.electrodes ? 'Elektroden ausgewählt ✓' : 'Elektroden auswählen';
  $('place-dish').disabled = !state.electrodes || state.dish;
  $('place-dish').textContent = state.dish ? 'Petrischale aufgesetzt ✓' : 'Petrischale aufsetzen';
  $('oil').disabled = !state.dish || state.oil;
  $('oil').textContent = state.oil ? 'Öl eingefüllt ✓' : 'Öl einfüllen';
  $('grains').disabled = !state.oil || state.grains;
  $('grains').hidden = state.grains;
  $('grains').textContent = state.grains ? 'Grießkörner eingestreut ✓' : 'Grießkörner einstreuen';
  const active=state.oil?'grains':state.dish?'oil':'dish';
  const labels={dish:'Schale',oil:'Öl',grains:'Grieß'};
  for(const key of ['dish','oil','grains']){
    $('prepare-'+key).hidden=key!==active;
    const item=$('progress-'+key);
    item.textContent=labels[key]+(state[key]?' ✓':'');
    item.classList.toggle('done',state[key]);
    item.toggleAttribute('aria-current',key===active&&!state.grains);
    if(key===active&&!state.grains)item.setAttribute('aria-current','step');
  }
  $('preparation-step').textContent=state.grains?'Vorbereitet ✓':{dish:'Petrischale',oil:'Rizinusöl',grains:'Grießkörner'}[active];
  if (typeof updateFieldControls === 'function') updateFieldControls();
}
function drawElectrodes() {
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('href', ELECTRODE_IMAGES[selectedLayout().file]);
  image.setAttribute('width', '1000');
  image.setAttribute('height', '1000');
  $('electrode-layer').replaceChildren(image);
}
$('place-dish').addEventListener('click', () => { if (!state.electrodes || state.dish) return; state.dish = true; render(); $('oil').focus({preventScroll:true}); });
$('oil').addEventListener('click', () => { if (!state.dish || state.oil) return; state.oil = true; render(); $('scatter-radius').focus({preventScroll:true}); });
$('grains').addEventListener('click', () => { if (!state.oil || state.grains) return; state.grains = true; GrainView.create(ScatterView.selection()); render(); });
$('electrodes').addEventListener('click', () => { if (state.electrodes) return; state.electrodes = true; drawElectrodes(); render(); });
$('electrode-shape').addEventListener('change', () => { if (state.electrodes && !state.dish) drawElectrodes(); render(); });
$('reset').addEventListener('click', () => {
  state.dish = state.oil = state.grains = state.electrodes = false;
  GrainView.clear();
  $('electrode-layer').replaceChildren();
  electrodeSelect.value = DEFAULT_ELECTRODE_ID;
  ScatterView.reset();
  resetField();
  render();
});
render();
