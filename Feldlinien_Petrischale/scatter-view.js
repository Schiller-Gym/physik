'use strict';
const ScatterView = (() => {
  const node=id=>document.getElementById(id),svg=node('experiment-scene');
  let region=ScatterModel.defaults(),editable=false,drag=null;
  function paint(){
    node('scatter-radius').value=region.radius;
    node('scatter-distribution').value=region.distribution;
    node('scatter-count').textContent=`${ScatterModel.count(region)} Körner`;
    node('scatter-radius').setAttribute('aria-valuetext',`${Math.round(region.radius/ScatterModel.maxRadius*100)} Prozent der maximalen Größe`);
    const circle=node('scatter-circle');
    circle.setAttribute('cx',region.x);circle.setAttribute('cy',region.y);circle.setAttribute('r',region.radius);
    circle.setAttribute('fill',region.distribution==='gaussian'?'url(#scatter-gradient)':'#126e7218');
    circle.setAttribute('aria-label',`Streukreis verschieben. ${ScatterModel.count(region)} Körner. Pfeiltasten bewegen, Umschalt plus Pfeiltaste für größere Schritte.`);
    node('scatter-center').setAttribute('transform',`translate(${region.x} ${region.y})`);
    node('scatter-label').setAttribute('x',region.x);node('scatter-label').setAttribute('y',region.y-region.radius-12);
  }
  function change(values){region=ScatterModel.constrain({...region,...values});paint();}
  function reset(){region=ScatterModel.defaults();drag=null;paint();}
  function update({oil,grains,powered,busy}){
    editable=oil&&!grains&&!powered&&!busy;
    if(!editable)drag=null;
    node('scatter-controls').hidden=!oil;
    node('scatter-radius').disabled=!editable;
    node('scatter-distribution').disabled=!editable;
    node('scatter-edit').hidden=!grains;
    node('scatter-edit').disabled=powered||busy;
    node('scatter-layer').setAttribute('display',oil&&!powered?'inline':'none');
    node('scatter-circle').setAttribute('tabindex',editable?'0':'-1');
    node('scatter-circle').setAttribute('aria-disabled',String(!editable));
    svg.classList.toggle('scatter-active',editable);
    paint();
  }
  function localPoint(event){
    const matrix=svg.getScreenCTM();if(!matrix)return null;
    const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
    return point.matrixTransform(matrix.inverse());
  }
  node('scatter-radius').addEventListener('input',()=>{if(editable)change({radius:Number(node('scatter-radius').value)});});
  node('scatter-distribution').addEventListener('change',()=>{if(editable)change({distribution:node('scatter-distribution').value});});
  svg.addEventListener('pointerdown',event=>{
    if(!editable||drag||event.button!==0)return;
    const p=localPoint(event);if(!p||!SceneGeometry.contains(p.x,p.y))return;
    event.preventDefault();
    const inside=Math.hypot(p.x-region.x,p.y-region.y)<=region.radius;
    drag={id:event.pointerId,dx:inside?p.x-region.x:0,dy:inside?p.y-region.y:0};
    svg.setPointerCapture(event.pointerId);
    if(!inside)change({x:p.x,y:p.y});
    node('scatter-circle').focus({preventScroll:true});
  });
  svg.addEventListener('pointermove',event=>{
    if(!editable||drag?.id!==event.pointerId)return;
    const p=localPoint(event);if(p)change({x:p.x-drag.dx,y:p.y-drag.dy});
  });
  function end(event){if(drag?.id!==event.pointerId)return;drag=null;if(svg.hasPointerCapture(event.pointerId))svg.releasePointerCapture(event.pointerId);}
  for(const name of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(name,end);
  node('scatter-circle').addEventListener('keydown',event=>{
    if(!editable)return;
    const direction={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if(!direction)return;
    event.preventDefault();const step=event.shiftKey?25:5;
    change({x:region.x+direction[0]*step,y:region.y+direction[1]*step});
  });
  return {update,reset,selection:()=>({...region})};
})();
