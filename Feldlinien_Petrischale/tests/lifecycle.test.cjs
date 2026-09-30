// Controller integration with an in-memory DOM and controlled async dependencies.
// Real image decoding/rendering is checked separately in the browser.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const root=path.join(__dirname,'..');
class Element {
  constructor(){this.children=[];this.attrs={};this.events={};this.value='';this.checked=false;this.classList={toggle(){}};}
  focus(){}
  setAttribute(k,v){this.attrs[k]=String(v);}
  toggleAttribute(k,v){if(v)this.attrs[k]='';else delete this.attrs[k];}
  append(...items){for(const e of items)this.children.push(...(e.fragment?e.children:[e]));}
  replaceChildren(...items){this.children=[];this.append(...items);}
  add(option){this.children.push(option);}
  get selectedOptions(){return this.children.filter(x=>x.value===this.value);}
  querySelector(){return this.indicator??=new Element();}
  addEventListener(k,fn){(this.events[k]??=[]).push(fn);}
  async fire(k,event={}){for(const f of this.events[k]||[])await f(event);}
}
async function main(){
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const nodes=Object.fromEntries([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],new Element()]));
  nodes['motion-mode'].value='chains';nodes['show-lines'].checked=false;nodes['line-density'].value='28';
  const scene=nodes['experiment-scene'];let captured=null;
  scene.getScreenCTM=()=>({inverse:()=>({})});scene.createSVGPoint=()=>({x:0,y:0,matrixTransform(){return {x:this.x,y:this.y};}});
  scene.setPointerCapture=id=>{captured=id;};scene.hasPointerCapture=id=>captured===id;scene.releasePointerCapture=()=>{captured=null;};
  const doc=new Element();doc.hidden=false;doc.getElementById=id=>nodes[id];
  doc.querySelectorAll=()=>[];doc.createDocumentFragment=()=>Object.assign(new Element(),{fragment:true});
  doc.createElementNS=()=>new Element();
  doc.createElement=()=>({getContext:()=>({drawImage(){},getImageData(x,y,n){const data=new Uint8ClampedArray(n*n*4);const mid=(n-1)/2;if(nodes['electrode-shape'].value==='03-konzentrische-ringe'){data[(267*n+300)*4+3]=255;data[(300*n+366)*4+3]=255;}else if(nodes['electrode-shape'].value==='05-verzweigung-offener-ring'){data[(281*n+300)*4+3]=255;data[(366*n+300)*4+3]=255;}else if(nodes['electrode-shape'].value==='06-platten-mit-ring'){data[(300*n+248)*4+3]=255;data[(300*n+352)*4+3]=255;data[(272*n+300)*4+3]=255;}else if(nodes['electrode-shape'].value==='07-platte-spitze'){data[(mid*n+260)*4+3]=255;data[(mid*n+320)*4+3]=255;}else{data[(mid*n+mid-14)*4+3]=255;data[(mid*n+mid+14)*4+3]=255;}return {data};}})});
  let badImage=false,solveCount=0,release=null;const frames=new Map();let frameId=0;
  const context=vm.createContext({document:doc,console,setTimeout,Math,Uint8Array,Float64Array,
    Option:function(text,value){this.text=text;this.value=value;},
    Image:class {async decode(){assert(this.src.startsWith('data:image/svg+xml;base64,'));if(badImage)throw Error('test image failure');}},
    requestAnimationFrame:fn=>{frames.set(++frameId,fn);return frameId;},cancelAnimationFrame:id=>frames.delete(id)});
  for(const match of html.matchAll(/<script src="([^"]+)" defer>/g))vm.runInContext(fs.readFileSync(path.join(root,match[1]),'utf8'),context,{filename:match[1]});
  const field={sample:()=>({ex:1,ey:0})};
  context.testSolve=async()=>{solveCount++;return new Promise(resolve=>{release=()=>resolve(field);});};
  vm.runInContext('ElectrostaticField.solve=testSolve;FieldLines.build=()=>[];',context);
  const click=id=>nodes[id].fire('click');
  const value=expression=>vm.runInContext(expression,context);
  const expectedCount=value('ScatterModel.count(ScatterModel.defaults())');
  async function prepare(){
    assert.equal(nodes['prepare-dish'].hidden,false);assert.equal(nodes['prepare-oil'].hidden,true);assert.equal(nodes['prepare-grains'].hidden,true);
    await click('electrodes');await click('place-dish');
    assert.equal(nodes['prepare-dish'].hidden,true);assert.equal(nodes['prepare-oil'].hidden,false);
    await click('oil');assert.equal(nodes['prepare-oil'].hidden,true);assert.equal(nodes['prepare-grains'].hidden,false);
    await click('grains');assert.equal(nodes['preparation-step'].textContent,'Vorbereitet ✓');
  }
  await click('oil');assert.equal(value('state.oil'),false);
  await prepare();assert.equal(nodes['grain-layer'].children.length,expectedCount);
  assert.equal(nodes['scatter-radius'].disabled,true);
  await click('scatter-edit');assert.equal(nodes['grain-layer'].children.length,0);assert.equal(nodes['field-toggle'].disabled,true);
  const startRegion=value('ScatterView.selection()');
  await scene.fire('pointerdown',{button:0,pointerId:1,clientX:startRegion.x,clientY:startRegion.y,preventDefault(){}});
  await scene.fire('pointermove',{pointerId:1,clientX:startRegion.x+40,clientY:startRegion.y+20});
  await scene.fire('pointerup',{pointerId:1});
  assert.equal(value('ScatterView.selection().x'),startRegion.x+40);assert.equal(captured,null);
  const initialX=value('ScatterView.selection().x');
  await nodes['scatter-circle'].fire('keydown',{key:'ArrowRight',shiftKey:true,preventDefault(){}});
  assert.equal(value('ScatterView.selection().x'),initialX+25);
  nodes['scatter-radius'].value='120';await nodes['scatter-radius'].fire('input');
  nodes['scatter-distribution'].value='uniform';await nodes['scatter-distribution'].fire('change');
  assert.equal(value('ScatterView.selection().distribution'),'uniform');
  await click('grains');assert.equal(nodes['grain-layer'].children.length,123);
  value('ScatterView.reset()');await click('scatter-edit');await click('grains');
  badImage=true;await click('field-toggle');assert(value('fieldUI.error').includes('test image failure'));assert.equal(frames.size,0);
  badImage=false;
  const pending=click('field-toggle');await new Promise(setImmediate);
  assert(release);assert.equal(value('fieldUI.busy'),true);
  await click('field-toggle');assert.equal(solveCount,1); // Double start ignored.
  await click('reset');release();await pending;
  assert.equal(value('fieldUI.enabled'),false);assert.equal(value('fieldUI.solution'),null);assert.equal(frames.size,0);
  assert.equal(nodes['grain-layer'].children.length,0);
  await prepare();const start=click('field-toggle');await new Promise(setImmediate);release();await start;
  assert.equal(frames.size,1);assert.equal(value('fieldUI.enabled'),true);
  assert.equal(nodes['scatter-layer'].attrs.display,'none');assert.equal(nodes['scatter-edit'].disabled,true);
  await click('scatter-edit');assert.equal(value('state.grains'),true);
  assert.equal(nodes['field-lines-layer'].attrs.display,'none');
  assert.equal(nodes['field-layer'].attrs.display,'none');
  nodes['show-lines'].checked=true;await nodes['show-lines'].fire('change');
  assert.equal(nodes['field-lines-layer'].attrs.display,'inline');
  for(let i=0;i<8;i++){await click('field-toggle');assert.equal(frames.size,0);await click('field-toggle');assert.equal(frames.size,1);}
  assert.equal(solveCount,2); // Geometry cache reused.
  nodes['show-lines'].checked=false;await nodes['show-lines'].fire('change');assert.equal(frames.size,1);
  await click('restart-rotation');assert.equal(nodes['grain-layer'].children.length,expectedCount);assert.equal(frames.size,1);
  nodes['motion-mode'].value='rotation';await nodes['motion-mode'].fire('change');assert.equal(frames.size,1);
  doc.hidden=true;await doc.fire('visibilitychange');assert.equal(frames.size,0);
  doc.hidden=false;await doc.fire('visibilitychange');assert.equal(frames.size,1);
  await click('reset');assert.equal(frames.size,0);assert.equal(nodes['electrode-layer'].children.length,0);
  assert.equal(nodes['show-lines'].checked,false);assert.equal(nodes['show-arrows'].checked,false);
  nodes['electrode-shape'].value='01-zwei-kreise';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);
  const circles=click('field-toggle');await new Promise(setImmediate);release();await circles;
  assert.equal(solveCount,3);assert.equal(value('fieldUI.layoutId'),'01-zwei-kreise');assert.equal(frames.size,1);
  await click('field-toggle');await click('field-toggle');assert.equal(solveCount,3);
  await click('reset');await prepare();
  const backToPlates=click('field-toggle');await new Promise(setImmediate);release();await backToPlates;
  assert.equal(solveCount,4);assert.equal(value('fieldUI.layoutId'),'02-parallele-platten');
  await click('reset');
  nodes['electrode-shape'].value='01-zwei-kreise';await nodes['electrode-shape'].fire('change');await prepare();
  const cancelledCircle=click('field-toggle');await new Promise(setImmediate);await click('reset');release();await cancelledCircle;
  assert.equal(value('fieldUI.layoutId'),'02-parallele-platten');assert.equal(value('fieldUI.enabled'),false);
  nodes['electrode-shape'].value='04-kreis-platte';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);
  const countBefore04=solveCount,start04=click('field-toggle');await new Promise(setImmediate);release();await start04;
  assert.equal(solveCount,countBefore04+1);assert.equal(value('fieldUI.layoutId'),'04-kreis-platte');assert.equal(frames.size,1);
  await click('field-toggle');await click('field-toggle');assert.equal(solveCount,countBefore04+1);
  await click('reset');await prepare();
  const return02=click('field-toggle');await new Promise(setImmediate);release();await return02;
  assert.equal(solveCount,countBefore04+2);assert.equal(value('fieldUI.layoutId'),'02-parallele-platten');
  await click('reset');
  nodes['electrode-shape'].value='03-konzentrische-ringe';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);
  const ringStart=click('field-toggle');await new Promise(setImmediate);release();await ringStart;
  assert.equal(value('fieldUI.layoutId'),'03-konzentrische-ringe');assert.equal(frames.size,1);
  await click('reset');
  nodes['electrode-shape'].value='05-verzweigung-offener-ring';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);
  const branchStart=click('field-toggle');await new Promise(setImmediate);release();await branchStart;
  assert.equal(value('fieldUI.layoutId'),'05-verzweigung-offener-ring');assert.equal(frames.size,1);
  assert.equal(nodes['polarity-positive'].attrs.x,'535');assert.equal(nodes['polarity-negative'].attrs.y,'975');
  assert.equal(nodes['field-status'].hidden,true);
  const branchCount=solveCount;await click('field-toggle');await click('field-toggle');assert.equal(solveCount,branchCount);
  await click('reset');assert.equal(nodes['polarity-positive'].attrs.x,'35');assert.equal(nodes['polarity-negative'].attrs.y,'475');
  nodes['electrode-shape'].value='06-platten-mit-ring';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);const floatingStart=click('field-toggle');await new Promise(setImmediate);release();await floatingStart;assert.equal(value('fieldUI.layoutId'),'06-platten-mit-ring');assert.equal(frames.size,1);
  await click('reset');
  nodes['electrode-shape'].value='07-platte-spitze';await nodes['electrode-shape'].fire('change');await prepare();
  assert.equal(nodes['field-toggle'].disabled,false);
  const tipCount=solveCount,tipStart=click('field-toggle');await new Promise(setImmediate);release();await tipStart;
  assert.equal(value('fieldUI.layoutId'),'07-platte-spitze');assert.equal(frames.size,1);
  assert.equal(nodes['field-lines-layer'].attrs.display,'none');
  await click('field-toggle');await click('field-toggle');assert.equal(solveCount,tipCount+1);
  await click('reset');await prepare();
  const tipReturn=click('field-toggle');await new Promise(setImmediate);release();await tipReturn;
  assert.equal(value('fieldUI.layoutId'),'02-parallele-platten');assert.equal(solveCount,tipCount+2);
  console.log('PASS: preparation guards, image failure/retry, reset during solve, cached restart, no duplicate RAF, visibility pause, unsupported layout.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
