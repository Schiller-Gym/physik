'use strict';
// Qualitative overdamped motion; drawing units and illustrative time, not SI calibration.
const GrainMotion = (() => {
  const geometry=typeof module!=='undefined'?require('./scene-geometry.js'):SceneGeometry;
  const grains=typeof module!=='undefined'?require('./grains.js'):GrainModel;
  const cutoff=48, maxSpeed=8;
  const radius=p=>(p.length+p.width)/2+.2;
  function vector(sample,x,y,reference) {
    const e=sample(x,y);
    if(!e||!Number.isFinite(e.ex)||!Number.isFinite(e.ey))return null;
    const norm=Math.hypot(e.ex,e.ey)/reference,scale=norm>2?2/norm:1;
    return {x:e.ex/reference*scale,y:e.ey/reference*scale};
  }
  function drift(sample,p,reference) {
    const energy=(x,y)=>{const e=vector(sample,x,y,reference);return e?e.x*e.x+e.y*e.y:null;};
    const center=energy(p.x,p.y);if(center===null)return {x:0,y:0};
    const h=5;
    const derivative=(a,b)=>a!==null&&b!==null?(b-a)/(2*h):b!==null?(b-center)/h:a!==null?(center-a)/h:0;
    return {x:90*derivative(energy(p.x-h,p.y),energy(p.x+h,p.y)),y:90*derivative(energy(p.x,p.y-h),energy(p.x,p.y+h))};
  }
  function polarization(p,e) {
    const x=Math.cos(p.theta),y=Math.sin(p.theta),projection=x*e.x+y*e.y;
    // A small transverse polarizability avoids permanent artificial zero dipoles.
    return {x:.25*e.x+.75*projection*x,y:.25*e.y+.75*projection*y};
  }
  function pairForce(a,b,pa,pb) {
    const dx=b.x-a.x,dy=b.y-a.y,r=Math.hypot(dx,dy);
    if(r<1e-8||r>=cutoff)return {x:0,y:0};
    const x=dx/r,y=dy/r,an=pa.x*x+pa.y*y,bn=pb.x*x+pb.y*y,dot=pa.x*pb.x+pa.y*pb.y;
    // Force on a; b receives its negative. End-to-end attraction, side-by-side repulsion.
    const taper=r<=36?1:((cutoff-r)/12)**2;
    // Shorter, denser grains: reduce pair coupling to avoid excessive close-range speeds.
    const scale=225000*taper/Math.max(r,8)**4;
    return {x:scale*((5*an*bn-dot)*x-bn*pa.x-an*pb.x),y:scale*((5*an*bn-dot)*y-bn*pa.y-an*pb.y)};
  }
  function spatialIndex(particles) {
    const cells=new Map(),key=(x,y)=>`${Math.floor(x/cutoff)},${Math.floor(y/cutoff)}`;
    function add(i){const p=particles[i],k=key(p.x,p.y);if(!cells.has(k))cells.set(k,new Set());cells.get(k).add(i);}
    particles.forEach((_,i)=>add(i));
    function nearby(x,y){const result=[],cx=Math.floor(x/cutoff),cy=Math.floor(y/cutoff);for(let j=cy-1;j<=cy+1;j++)for(let i=cx-1;i<=cx+1;i++)for(const index of cells.get(`${i},${j}`)||[])result.push(index);return result;}
    function move(i,x,y){const p=particles[i];cells.get(key(p.x,p.y)).delete(i);p.x=x;p.y=y;add(i);}
    return {nearby,move};
  }
  function step(particles,sample,dt,reference,{translation=true,interactions=false}={}) {
    if(!(dt>0)||dt>1/30||!(reference>0)||!Number.isFinite(reference))return;
    const fields=particles.map(p=>vector(sample,p.x,p.y,reference));
    particles.forEach((p,i)=>{if(fields[i])grains.rotate(p,sample(p.x,p.y),dt,reference);});
    if(!translation)return;
    const index=spatialIndex(particles);
    const velocities=particles.map((p,i)=>fields[i]?drift(sample,p,reference):{x:0,y:0});
    if(interactions){
      const dipoles=particles.map((p,i)=>fields[i]?polarization(p,fields[i]):null);
      particles.forEach((a,i)=>{
        if(!dipoles[i])return;
        for(const j of index.nearby(a.x,a.y)){
          if(j<=i||!dipoles[j])continue;
          const force=pairForce(a,particles[j],dipoles[i],dipoles[j]);
          velocities[i].x+=force.x;velocities[i].y+=force.y;
          velocities[j].x-=force.x;velocities[j].y-=force.y;
        }
      });
    }
    particles.forEach((p,i)=>{
      if(!fields[i])return; // Initially unsampled grains remain stationary, as in step 5.
      let vx=velocities[i].x*p.mobility,vy=velocities[i].y*p.mobility;
      const speed=Math.hypot(vx,vy);if(!Number.isFinite(speed)||speed<1e-10)return;
      if(speed>maxSpeed){vx*=maxSpeed/speed;vy*=maxSpeed/speed;}
      const dx=vx*dt,dy=vy*dt;
      const legal=(x,y)=>geometry.contains(x,y,radius(p))&&vector(sample,x,y,reference)!==null&&index.nearby(x,y).every(j=>{
        if(j===i)return true;
        const dx=x-particles[j].x,dy=y-particles[j].y,minimum=radius(p)+radius(particles[j]);
        return dx*dx+dy*dy>=minimum*minimum;
      });
      // Contact removes the blocked component instead of allowing penetration.
      // The field mask is a numerical validity boundary, not a physical metal wall.
      for(const [mx,my] of [[dx,dy],[dx,0],[0,dy],[dx/2,dy/2],[dx/4,dy/4]]){
        if(Math.hypot(mx,my)<1e-10)continue;
        if(legal(p.x+mx,p.y+my)){index.move(i,p.x+mx,p.y+my);break;}
      }
    });
  }
  return {step,drift,pairForce,radius};
})();
if(typeof module!=='undefined')module.exports=GrainMotion;
