const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {solve}=require('../field.js'),{build}=require('../field-lines.js'),geometry=require('../field-geometry.js');
const layouts=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electrodes.js'),'utf8')+';ELECTRODE_LAYOUTS');
const config=layouts.find(l=>l.id==='07-platte-spitze').field;
// Independent polygon approximation of the SVG cubic outline plus 1.5-unit stroke.
const polygon=[[430,496],[609,438]];
function cubic(a,b,c,d){for(let i=1;i<=60;i++){const t=i/60,u=1-t;polygon.push([u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]]);}}
cubic([609,438],[682,414],[709,451],[709,496]);
cubic([709,496],[709,541],[682,578],[609,554]);
function metal(x,y){
  if(x<425||x>712||y<420||y>572)return false;
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const [ax,ay]=polygon[j],[bx,by]=polygon[i],dx=bx-ax,dy=by-ay;
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy)));
    if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<=1.5)return true;
  }
  return inside;
}
function grid(h,extent=1500){
  const n=2*extent/h+1,originX=500-extent,originY=496-extent;
  const fixed=new Uint8Array(n*n),values=new Float64Array(n*n);
  for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
    const x=originX+ix*h,y=originY+iy*h,k=iy*n+ix;
    if(ix===0||iy===0||ix===n-1||iy===n-1)fixed[k]=1;
    else if((x>=284.5&&x<=315.5&&y>=273.5&&y<=716.5)||(x>=35&&x<=286&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=.5;}
    else if(metal(x,y)||(x>=709&&x<=965&&Math.abs(y-496)<=5)){fixed[k]=1;values[k]=-.5;}
  }
  return {n,spacing:h,originX,originY,fixed,values};
}
(async()=>{
  assert(config&&config.spacing===5);
  const fine=await solve(grid(5)),coarse=await solve(grid(10)),large=await solve(grid(5,2000));
  const field=geometry.prepareSolution(fine,config),center=fine.sample(375,496);
  const refinement=Math.abs(coarse.sample(375,496).ex/center.ex-1),domain=Math.abs(large.sample(375,496).ex/center.ex-1);
  assert(center.ex>0);assert(Math.abs(center.ey)/center.ex<.02);assert(refinement<.1);assert(domain<.01);
  for(const [x,y] of [[100,496],[900,496],[300,496],[440,496],[650,496]])assert.equal(fine.sample(x,y),null);
  const g=grid(5),at=(x,y)=>Math.round((y-g.originY)/5)*g.n+Math.round((x-g.originX)/5);
  assert.equal(g.values[at(100,496)],.5);assert.equal(g.values[at(900,496)],-.5);
  const top=fine.sample(375,400),bottom=fine.sample(375,592);
  assert(Math.abs(top.ex-bottom.ex)/center.ex<.02);assert(Math.abs(top.ey+bottom.ey)/center.ex<.02);
  const enhancement=fine.sample(415,496).ex/fine.sample(335,496).ex;
  assert(enhancement>1.3);
  const e=fine.sample(325,496);assert(Math.abs(e.ey/e.ex)<.05);
  const lines=[44,28,16].map(gap=>build(field.sample,gap,config));
  assert(lines[0].length>5);assert(lines[2].length>lines[0].length);
  assert(lines[1].some(l=>l.some(p=>p.x>320&&p.x<425&&Math.abs(p.y-496)<5)));
  for(const line of lines[1])for(const p of line)assert(field.sample(p.x,p.y));
  const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js'),scatter=require('../scatter-model.js');
  let seed=73;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
  const ps=grains.create(276,random,scatter.defaults()),before=ps.map(p=>({...p}));
  for(let i=0;i<600;i++)motion.step(ps,field.sample,1/60,field.reference,{interactions:true});
  let moved=0;
  for(let i=0;i<ps.length;i++){
    const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
    if(!field.sample(old.x,old.y))assert.deepEqual(p,old);else assert(field.sample(p.x,p.y));
    if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
    for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
  }
  assert(moved>30);
  console.log({center,refinement,domain,enhancement,lines:lines.map(l=>l.length),moved,residual:fine.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
