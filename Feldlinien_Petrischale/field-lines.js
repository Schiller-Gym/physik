'use strict';

// Field lines are integral curves of E/|E|. Their spacing is a display choice.
const FieldLines = (() => {
  const geometry=typeof module!=='undefined'?require('./scene-geometry.js'):SceneGeometry;
  const inside = (x,y) => geometry.contains(x,y,5);
  function direction(sample, p, sign) {
    const e=sample(p.x,p.y);
    if(!e)return null;
    const m=Math.hypot(e.ex,e.ey);
    return m>1e-12 && Number.isFinite(m) ? {x:sign*e.ex/m,y:sign*e.ey/m} : null;
  }
  function step(sample,p,h,sign) {
    const k1=direction(sample,p,sign); if(!k1)return null;
    const k2=direction(sample,{x:p.x+h*k1.x/2,y:p.y+h*k1.y/2},sign);if(!k2)return null;
    const k3=direction(sample,{x:p.x+h*k2.x/2,y:p.y+h*k2.y/2},sign);if(!k3)return null;
    const k4=direction(sample,{x:p.x+h*k3.x,y:p.y+h*k3.y},sign);if(!k4)return null;
    return {x:p.x+h*(k1.x+2*k2.x+2*k3.x+k4.x)/6,y:p.y+h*(k1.y+2*k2.y+2*k3.y+k4.y)/6};
  }
  function trace(sample,seed,sign=1,bounds=inside) {
    if(!bounds(seed.x,seed.y)||!direction(sample,seed,sign))return [];
    const points=[seed];let p=seed;
    for(let i=0;i<1600;i++) {
      let next=step(sample,p,2,sign);
      // Approach the numerical conductor boundary without drawing through it.
      if(!next)next=step(sample,p,.5,sign);
      if(!next||!bounds(next.x,next.y)||!sample(next.x,next.y))break;
      points.push(next);p=next;
      if(points.length>30 && Math.hypot(p.x-seed.x,p.y-seed.y)<1)break;
    }
    return points;
  }
  function build(sample,gap=30,config={}) {
    const seeds=[];
    const axisY=config.axisY??495;
    const seedX=config.seedX??500;
    if(config.ringSeeds)for(let angle=0;angle<2*Math.PI;angle+=Math.PI/90)
      seeds.push({x:500+config.ringSeeds*Math.cos(angle),y:axisY+config.ringSeeds*Math.sin(angle)});
    // Symmetric central seeds cover the gap and its fringing field first.
    seeds.push({x:seedX,y:axisY});
    for(let offset=12;offset<380;offset+=12)seeds.push({x:seedX,y:axisY-offset},{x:seedX,y:axisY+offset});
    // Supplement the exterior field on both sides of the plates.
    for(let y=285;y<=705;y+=12)seeds.push({x:320,y},{x:680,y});
    // Cover exterior arcs as well, without encoding a second electrode geometry.
    if(config.areaSeeds)for(let dy=0;dy<=360;dy+=24)for(let dx=24;dx<=360;dx+=24)
      for(const sy of (dy?[1,-1]:[1]))for(const sx of [1,-1])seeds.push({x:500+sx*dx,y:axisY+sy*dy});
    const lines=[],occupied=new Map();
    const key=(x,y)=>`${x},${y}`;
    const tooClose=p=>{
      const cx=Math.floor(p.x/gap),cy=Math.floor(p.y/gap);
      for(let y=cy-1;y<=cy+1;y++)for(let x=cx-1;x<=cx+1;x++)
        for(const q of occupied.get(key(x,y))||[])if(Math.hypot(p.x-q.x,p.y-q.y)<gap)return true;
      return false;
    };
    for(const seed of seeds) {
      if(tooClose(seed))continue;
      const backward=trace(sample,seed,-1),forward=trace(sample,seed,1);
      const line=backward.reverse().concat(forward.slice(1));
      if(line.length<25||line.some(tooClose))continue;
      lines.push(line);
      for(const p of line){const k=key(Math.floor(p.x/gap),Math.floor(p.y/gap));if(!occupied.has(k))occupied.set(k,[]);occupied.get(k).push(p);}
    }
    return lines;
  }
  return {step,trace,build};
})();
if(typeof module!=='undefined')module.exports=FieldLines;
