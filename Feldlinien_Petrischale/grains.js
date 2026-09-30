'use strict';

// Overdamped induced-dipole model. Time scale is illustrative, not measured in oil.
const GrainModel = (() => {
  const geometry=typeof module!=='undefined'?require('./scene-geometry.js'):SceneGeometry;
  function create(count=1200, random=Math.random,region=null) {
    const scatter=typeof module!=='undefined'?require('./scatter-model.js'):ScatterModel;
    const particles=[];
    for(let attempt=0;particles.length<count && attempt<count*200;attempt++) {
      const a=random()*2*Math.PI,r=Math.sqrt(random())*geometry.seedRadius;
      const p={x:geometry.x+Math.cos(a)*r,y:geometry.y+Math.sin(a)*r,
        length:5+random()*3,width:2.5,theta:random()*Math.PI,mobility:.8+random()*.4};
      if(region){
        const point=scatter.point(region,(p.length+p.width)/2+.2,random);
        p.x=point.x;p.y=point.y;
        if(!geometry.contains(p.x,p.y,(p.length+p.width)/2+.2))continue;
      }
      // Keep room for rotation, without excluding electrodes beneath the glass.
      if(particles.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<(p.length+q.length+p.width+q.width)/2+.5))continue;
      particles.push(p);
    }
    return particles;
  }
  function rotate(p,field,dt,reference) {
    if(!field || !(dt>0) || !(reference>0))return false;
    const strength=Math.hypot(field.ex,field.ey);
    if(!Number.isFinite(strength)||strength<1e-12)return false;
    const phi=Math.atan2(field.ey,field.ex);
    // Head/tail symmetry: theta and theta+pi represent the same grain axis.
    const delta=.5*Math.atan2(Math.sin(2*(p.theta-phi)),Math.cos(2*(p.theta-phi)));
    if(Math.abs(delta)<1e-6 || Math.abs(Math.abs(delta)-Math.PI/2)<1e-12)return false;
    const rate=.65*p.mobility*Math.min((strength/reference)**2,4);
    // Exact update for d(delta)/dt = -rate*sin(2*delta) at fixed position/field.
    const next=Math.atan2(Math.sin(delta)*Math.exp(-2*rate*dt),Math.cos(delta));
    p.theta += next-delta;
    return true;
  }
  return {create,rotate};
})();
if(typeof module!=='undefined')module.exports=GrainModel;
