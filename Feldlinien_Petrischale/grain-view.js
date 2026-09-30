'use strict';

const GrainView = (() => {
  let particles=[],elements=[],frame=null,solution=null,reference=1,running=false;
  const clock=SimulationClock.create({timeScale:2});
  let mode='chains';
  const draw=(p,i)=>elements[i].setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${p.theta*180/Math.PI})`);
  function tick(time) {
    frame=null;
    if(!running)return;
    const steps=clock.advance(time,dt=>{
      GrainMotion.step(particles,solution.sample,dt,reference,{translation:mode!=='rotation',interactions:mode==='chains'});
    });
    if(steps)particles.forEach(draw);
    frame=requestAnimationFrame(tick);
  }
  function setRunning(enabled,field) {
    const next=Boolean(enabled&&field&&particles.length&&!document.hidden);
    if(field!==solution){solution=field;reference=field?.reference||1;}
    if(next===running)return;
    running=next;clock.reset();
    if(!running){if(frame!==null)cancelAnimationFrame(frame);frame=null;}
    else frame=requestAnimationFrame(tick);
  }
  function clear() {
    setRunning(false,null);particles=[];elements=[];
    document.getElementById('grain-layer').replaceChildren();
  }
  function create(region=null) {
    clear();particles=region?GrainModel.create(ScatterModel.count(region),Math.random,region):GrainModel.create();
    const fragment=document.createDocumentFragment();
    elements=particles.map(p=>{
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',-p.length/2);line.setAttribute('x2',p.length/2);
      line.setAttribute('y1','0');line.setAttribute('y2','0');
      line.setAttribute('stroke','#997a39');line.setAttribute('stroke-width',p.width);
      line.setAttribute('stroke-linecap','round');fragment.append(line);return line;
    });
    document.getElementById('grain-layer').append(fragment);
    particles.forEach(draw);
  }
  function setMode(value){mode=value;}
  return {create,clear,setRunning,setMode};
})();
