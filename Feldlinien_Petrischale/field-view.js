'use strict';

const fieldUI = { enabled:false, busy:false, solution:null, layoutId:null, revision:0, error:'' };
const svgNS = 'http://www.w3.org/2000/svg';
const supportsField = () => Boolean(selectedLayout().field);
function updateFieldControls() {
  const ready = state.grains && supportsField();
  ScatterView.update({oil:state.oil,grains:state.grains,powered:fieldUI.enabled,busy:fieldUI.busy});
  $('restart-rotation').disabled = !ready || fieldUI.busy;
  $('motion-mode').disabled = !ready || fieldUI.busy;
  GrainView.setMode($('motion-mode').value);
  GrainView.setRunning(fieldUI.enabled,fieldUI.solution);
  $('field-toggle').disabled = !ready || fieldUI.busy;
  $('field-toggle').textContent = fieldUI.busy ? 'Feld wird berechnet …' : fieldUI.enabled ? 'Spannung ausschalten' : 'Spannung einschalten';
  $('field-toggle').setAttribute('aria-pressed', String(fieldUI.enabled));
  $('show-arrows').disabled = !fieldUI.enabled;
  $('show-lines').disabled = !fieldUI.enabled;
  $('line-density').disabled = !fieldUI.enabled || !$('show-lines').checked;
  $('field-lines-layer').setAttribute('display', fieldUI.enabled && $('show-lines').checked ? 'inline' : 'none');
  $('field-status').textContent=fieldUI.error||(!supportsField()?'Feldsimulation für diese Anordnung noch nicht verfügbar.':'');
  $('field-status').hidden=!$('field-status').textContent;
  $('field-layer').setAttribute('display', fieldUI.enabled && $('show-arrows').checked ? 'inline' : 'none');
  $('polarity-layer').setAttribute('display', fieldUI.enabled ? 'inline' : 'none');
  const contacts=selectedLayout().field?.polarity||[[35,475],[965,475]];
  for(const [i,id] of ['polarity-positive','polarity-negative'].entries()){
    $(id).setAttribute('x',contacts[i][0]);$(id).setAttribute('y',contacts[i][1]);
  }
}
function resetField() {
  fieldUI.revision++;
  fieldUI.enabled=false; fieldUI.busy=false; fieldUI.error='';
  $('show-arrows').checked=false;
  $('show-lines').checked=false;
  $('line-density').value='28';
  $('motion-mode').value='chains';
  $('field-lines-layer').replaceChildren();
  // A single cached solution is reused only when its layout ID matches.
  $('field-layer').replaceChildren();
  updateFieldControls();
}
async function electrodeGrid(layout) {
  // Rasterize the actual SVG, including leads; no duplicate geometric definition.
  const {n,spacing,originX,originY}=FieldGeometry.dimensions(layout.field);
  const img = new Image();
  img.src = ELECTRODE_IMAGES[layout.file];
  await img.decode();
  const canvas = document.createElement('canvas'); canvas.width=n; canvas.height=n;
  const ctx=canvas.getContext('2d', {willReadFrequently:true});
  ctx.drawImage(img, -originX/spacing+0.5, -originY/spacing+0.5, 1000/spacing, 1000/spacing);
  const pixels=ctx.getImageData(0,0,n,n).data;
  return FieldGeometry.fromPixels(layout.field,pixels);
}
function drawFieldArrows(solution) {
  const fragment=document.createDocumentFragment();
  const reference=solution.reference;
  for(let y=145;y<=845;y+=50) for(let x=150;x<=850;x+=50) {
    if(!SceneGeometry.contains(x,y,27))continue;
    const vector=solution.sample(x,y);
    if(!vector)continue;
    const magnitude=Math.hypot(vector.ex,vector.ey);
    if(magnitude<reference*0.025)continue;
    const length=Math.min(34,Math.max(7,26*magnitude/reference));
    const dx=vector.ex/magnitude,dy=vector.ey/magnitude;
    // Omit arrows whose tips would enter a conductor.
    if(!solution.sample(x+dx*length/2,y+dy*length/2)||!solution.sample(x-dx*length/2,y-dy*length/2))continue;
    const group=document.createElementNS(svgNS,'g');
    group.setAttribute('transform',`translate(${x} ${y}) rotate(${Math.atan2(dy,dx)*180/Math.PI})`);
    const path=document.createElementNS(svgNS,'path');
    path.setAttribute('d',`M${-length/2} 0 H${length/2} M${length/2-5} -3.5 L${length/2} 0 L${length/2-5} 3.5`);
    group.append(path);fragment.append(group);
  }
  $('field-layer').replaceChildren(fragment);
}
$('field-toggle').addEventListener('click',async()=>{
  if(!state.grains || !supportsField() || fieldUI.busy)return;
  if(fieldUI.enabled){fieldUI.enabled=false;updateFieldControls();return;}
  const revision=++fieldUI.revision;
  const layout=selectedLayout();
  fieldUI.busy=true;fieldUI.error='';updateFieldControls();
  try {
    if(!fieldUI.solution || fieldUI.layoutId!==layout.id){
      const grid=await electrodeGrid(layout);
      if(revision!==fieldUI.revision)return;
      const solution=await ElectrostaticField.solve({...grid,tolerance:layout.field.tolerance||1e-7,pause:()=>new Promise(resolve=>setTimeout(resolve,0)),cancelled:()=>revision!==fieldUI.revision});
      if(!solution || revision!==fieldUI.revision)return;
      fieldUI.solution=FieldGeometry.prepareSolution(solution,layout.field);fieldUI.layoutId=layout.id;
    }
    if(revision!==fieldUI.revision)return;
    drawFieldArrows(fieldUI.solution);drawFieldLines(fieldUI.solution);fieldUI.enabled=true;
  } catch(error) {
    if(revision!==fieldUI.revision)return;
    fieldUI.error='Feld konnte nicht berechnet werden. '+error.message;
  } finally {
    if(revision===fieldUI.revision){fieldUI.busy=false;updateFieldControls();}
  }
});
function drawFieldLines(solution) {
  const fragment=document.createDocumentFragment();
  for(const line of FieldLines.build(solution.sample,Number($('line-density').value),selectedLayout().field)) {
    const path=document.createElementNS(svgNS,'path');
    path.setAttribute('d',line.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' '));
    fragment.append(path);
    const i=Math.floor(line.length/2),p=line[i],q=line[i+1];
    if(q){const angle=Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;
      const arrow=document.createElementNS(svgNS,'path');
      arrow.setAttribute('d','M-6 -4 L0 0 L-6 4');
      arrow.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle})`);
      fragment.append(arrow);
    }
  }
  $('field-lines-layer').replaceChildren(fragment);
}
$('show-lines').addEventListener('change',updateFieldControls);
$('line-density').addEventListener('change',()=>{if(fieldUI.enabled && fieldUI.solution)drawFieldLines(fieldUI.solution);});
$('show-arrows').addEventListener('change',updateFieldControls);
updateFieldControls();

document.addEventListener('visibilitychange',()=>GrainView.setRunning(fieldUI.enabled,fieldUI.solution));
$('motion-mode').addEventListener('change',updateFieldControls);
$('restart-rotation').addEventListener('click',()=>{if(state.grains&&!fieldUI.busy){GrainView.create(ScatterView.selection());updateFieldControls();}});

$('scatter-edit').addEventListener('click',()=>{if(!state.grains||fieldUI.enabled||fieldUI.busy)return;GrainView.clear();state.grains=false;render();});
