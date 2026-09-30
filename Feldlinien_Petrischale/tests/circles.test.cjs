const assert=require('node:assert/strict');
const {solve}=require('../field.js');
const {build}=require('../field-lines.js');
const geometry=require('../field-geometry.js');
const config={spacing:5,axisY:496,splitX:500,areaSeeds:true};
const radius=60.5; // Visible SVG radius 59 plus half its 3-unit stroke.
function grid(h,extent=1500,leads=true){
  const n=2*extent/h+1,ox=500-extent,oy=496-extent;
  const fixed=new Uint8Array(n*n),values=new Float64Array(n*n);
  for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
    const x=ox+ix*h,y=oy+iy*h,k=iy*n+ix;
    if(ix===0||iy===0||ix===n-1||iy===n-1){fixed[k]=1;values[k]=leads?0:analytic(x,y).potential;}
    else if(Math.hypot(x-375,y-496)<=radius||(leads&&x>=35&&x<=375&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=.5;}
    else if(Math.hypot(x-625,y-496)<=radius||(leads&&x>=625&&x<=965&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=-.5;}
  }
  return {n,spacing:h,originX:ox,originY:oy,fixed,values};
}
// Exact two infinite cylinders without leads, analytic outer boundary.
function analytic(x,y){
  const a=Math.sqrt(125**2-radius**2),eta=Math.acosh(125/radius),X=x-500,Y=y-496;
  const left=(X+a)**2+Y*Y,right=(X-a)**2+Y*Y;
  return {potential:Math.log(right/left)/(4*eta),ex:((X+a)/left-(X-a)/right)/(2*eta),ey:(Y/left-Y/right)/(2*eta)};
}
(async()=>{
  assert.throws(()=>geometry.dimensions(null));
  const d=geometry.dimensions(config),pixels=new Uint8Array(d.n*d.n*4),mid=300;
  pixels[4*(mid*d.n+275)+3]=255;pixels[4*(mid*d.n+325)+3]=255;
  const raster=geometry.fromPixels(config,pixels);
  assert.equal(raster.values[mid*d.n+275],.5);assert.equal(raster.values[mid*d.n+325],-.5);
  assert.throws(()=>geometry.fromPixels(config,new Uint8Array(pixels.length)));
  const coarse=await solve(grid(10)),fine=await solve(grid(5)),large=await solve(grid(5,2000));
  const center=fine.sample(500,496),refinement=Math.abs(coarse.sample(500,496).ex/center.ex-1),domain=Math.abs(large.sample(500,496).ex/center.ex-1);
  assert(center.ex>0);assert(Math.abs(center.ey)/center.ex<.001);assert(refinement<.08);assert(domain<.01);
  assert.equal(fine.sample(375,496),null);assert.equal(fine.sample(200,496),null);
  const upper=fine.sample(460,380),lower=fine.sample(460,612),mirror=fine.sample(540,380);
  assert(Math.abs(upper.ex-lower.ex)/center.ex<.001);assert(Math.abs(upper.ey+lower.ey)/center.ex<.001);
  assert(Math.abs(upper.ex-mirror.ex)/center.ex<.001);assert(Math.abs(upper.ey+mirror.ey)/center.ex<.001);
  const exact=await solve({...grid(5,1000,false),tolerance:1e-9});let maxRelativeError=0;
  for(const [x,y] of [[500,496],[500,360],[440,400],[560,592]]){
    const e=exact.sample(x,y),a=analytic(x,y);
    maxRelativeError=Math.max(maxRelativeError,Math.hypot(e.ex-a.ex,e.ey-a.ey)/Math.hypot(a.ex,a.ey));
  }
  assert(maxRelativeError<.06);
  let maxNormalAngle=0;
  for(const angle of [0,Math.PI/4,-Math.PI/4,Math.PI/2,-Math.PI/2]){
    const nx=Math.cos(angle),ny=Math.sin(angle),e=fine.sample(375+(radius+10)*nx,496+(radius+10)*ny);
    const deviation=Math.acos(Math.min(1,(e.ex*nx+e.ey*ny)/Math.hypot(e.ex,e.ey)))*180/Math.PI;
    maxNormalAngle=Math.max(maxNormalAngle,deviation);
  }
  // Ten units off the surface: already curved, so not an exact 90-degree condition.
  assert(maxNormalAngle<20);
  const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js'),scatter=require('../scatter-model.js');
  let seed=71;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  const ps=grains.create(276,random,scatter.defaults()),before=ps.map(p=>({...p}));
  for(let step=0;step<600;step++)motion.step(ps,fine.sample,1/60,center.ex,{interactions:true});
  let moved=0;
  for(let i=0;i<ps.length;i++){
    const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
    if(!fine.sample(old.x,old.y))assert.deepEqual(p,old);else assert(fine.sample(p.x,p.y));
    if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
    for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
  }
  assert(moved>50);
  const lines=build(fine.sample,28,config),few=build(fine.sample,44,config),many=build(fine.sample,16,config);
  assert(lines.length>5);assert(many.length>few.length);
  for(const line of lines)for(const p of line)assert(fine.sample(p.x,p.y));
  assert(lines.some(l=>Math.max(...l.map(p=>p.y))-Math.min(...l.map(p=>p.y))>100));
  console.log({circleCenter:center,refinement,domain,analyticMaxRelativeError:maxRelativeError,maxNormalAngle,moved,lines:[few.length,lines.length,many.length],residual:fine.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
