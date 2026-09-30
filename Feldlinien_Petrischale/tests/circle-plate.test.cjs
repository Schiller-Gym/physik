const assert=require('node:assert/strict');
const {solve}=require('../field.js'),{build}=require('../field-lines.js');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const layouts=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electrodes.js'),'utf8')+';ELECTRODE_LAYOUTS');
const config=layouts.find(l=>l.id==='04-kreis-platte').field;
assert(config&&config.spacing===5);
// Independent approximation of the visible SVG incl. stroke and leads.
// Rounded plate corners and round lead caps are not duplicated here.
function grid(h,extent=1500){
  const n=2*extent/h+1,originX=500-extent,originY=496-extent;
  const fixed=new Uint8Array(n*n),values=new Float64Array(n*n);
  for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
    const x=originX+ix*h,y=originY+iy*h,k=iy*n+ix;
    if(ix===0||iy===0||ix===n-1||iy===n-1)fixed[k]=1;
    else if(Math.hypot(x-365,y-496)<=60.5||(x>=35&&x<=365&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=.5;}
    else if((x>=574.5&&x<=605.5&&y>=273.5&&y<=716.5)||(x>=604&&x<=965&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=-.5;}
  }
  return {n,spacing:h,originX,originY,fixed,values};
}
(async()=>{
  const coarse=await solve(grid(10)),fine=await solve(grid(5)),large=await solve(grid(5,2000));
  const center=fine.sample(500,496),refinement=Math.abs(coarse.sample(500,496).ex/center.ex-1),domain=Math.abs(large.sample(500,496).ex/center.ex-1);
  assert(center.ex>0);assert(Math.abs(center.ey)/center.ex<.01);assert(refinement<.08);assert(domain<.01);
  for(const [x,y] of [[365,496],[590,496],[200,496],[750,496]])assert.equal(fine.sample(x,y),null);
  // Almost up/down symmetric: original plate center y=495, circle/lead y=496.
  const top=fine.sample(480,380),bottom=fine.sample(480,612);
  assert(Math.abs(top.ex-bottom.ex)/center.ex<.02);assert(Math.abs(top.ey+bottom.ey)/center.ex<.02);
  assert(fine.sample(440,496).ex>fine.sample(555,496).ex);
  let plateAngle=0;
  for(const y of [396,496,596]){const e=fine.sample(565,y);plateAngle=Math.max(plateAngle,Math.abs(Math.atan2(e.ey,e.ex))*180/Math.PI);}
  assert(plateAngle<12);
  const lines=[44,28,16].map(gap=>build(fine.sample,gap,config));
  assert(lines[0].length>5);assert(lines[2].length>lines[0].length);
  for(const line of lines[1])for(const p of line)assert(fine.sample(p.x,p.y));
  assert(lines[1].some(l=>Math.max(...l.map(p=>p.y))-Math.min(...l.map(p=>p.y))>100));
  const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js'),scatter=require('../scatter-model.js');
  let seed=73;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  const ps=grains.create(276,random,scatter.defaults()),before=ps.map(p=>({...p}));
  for(let i=0;i<600;i++)motion.step(ps,fine.sample,1/60,Math.hypot(center.ex,center.ey),{interactions:true});
  let moved=0;
  for(let i=0;i<ps.length;i++){
    const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
    if(!fine.sample(old.x,old.y))assert.deepEqual(p,old);else assert(fine.sample(p.x,p.y));
    if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
    for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
  }
  assert(moved>50);
  console.log({center,refinement,domain,plateAngle,lines:lines.map(l=>l.length),moved,residual:fine.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
