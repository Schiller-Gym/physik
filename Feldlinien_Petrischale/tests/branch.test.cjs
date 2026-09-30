const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const G=require('../field-geometry.js'),F=require('../field.js'),L=require('../field-lines.js');
const layouts=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electrodes.js'),'utf8')+';ELECTRODE_LAYOUTS');
const config=layouts.find(l=>l.id==='05-verzweigung-offener-ring').field;
function segment(x,y,ax,ay,bx,by){const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));return Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay));}
function raster(spacing){
 const c={...config,spacing},d=G.dimensions(c),pixels=new Uint8Array(d.n*d.n*4);
 for(let iy=1;iy<d.n-1;iy++)for(let ix=1;ix<d.n-1;ix++){
  const x=d.originX+ix*spacing,y=d.originY+iy*spacing,X=x-500,Y=y-496,r=Math.hypot(X,Y),a=Math.atan2(Y,X);
  const outer=(Math.abs(r-330)<=12&&(a>=-Math.PI/3||a<=-2*Math.PI/3))||Math.hypot(X-165,Y+330*Math.sqrt(3)/2)<=12||Math.hypot(X+165,Y+330*Math.sqrt(3)/2)<=12;
  if(outer||segment(x,y,500,220,500,660)<=12.5||segment(x,y,500,220,345,555)<=12.5||segment(x,y,500,35,500,220)<=5||segment(x,y,500,826,500,965)<=5)pixels[4*(iy*d.n+ix)+3]=255;
 }
 return G.fromPixels(c,pixels);
}
(async()=>{
 const g=raster(5),at=(x,y)=>Math.round((y-g.originY)/5)*g.n+Math.round((x-g.originX)/5);
 for(const [x,y] of [[500,50],[500,400],[500,660],[345,555],[420,393]])assert.equal(g.values[at(x,y)],.5);
 for(const [x,y] of [[830,496],[170,496],[500,826],[500,950]])assert.equal(g.values[at(x,y)],-.5);
 assert.equal(g.fixed[at(550,200)],0);
 const raw=await F.solve(g),fine=G.prepareSolution(raw,config),coarse=G.prepareSolution(await F.solve(raster(10)),config);
 let refinement=0;for(const [x,y] of [[650,496],[500,695],[325,580],[440,440]]){
  const a=fine.sample(x,y),b=coarse.sample(x,y);assert(a&&b);refinement=Math.max(refinement,Math.hypot(a.ex-b.ex,a.ey-b.ey)/Math.hypot(a.ex,a.ey));
 }assert(refinement<.2);
 assert(fine.sample(650,496).ex>0);assert(fine.sample(500,695).ey>0);assert(fine.sample(300,580).ex<0);
 assert.equal(fine.sample(500,496),null);assert.equal(fine.sample(500,50),null);
 const lines=[44,28,16].map(gap=>L.build(fine.sample,gap,config));assert(lines[0].length>5);assert(lines[2].length>lines[0].length);
 for(const line of lines[1])for(const p of line)assert(fine.sample(p.x,p.y));
 const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js');
 let seed=83;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646,ps=grains.create(400,random),before=ps.map(p=>({...p}));
 for(let i=0;i<600;i++)motion.step(ps,fine.sample,1/60,fine.reference,{interactions:true});
 let moved=0;
 for(let i=0;i<ps.length;i++){const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
  if(!fine.sample(old.x,old.y))assert.deepEqual(p,old);else assert(fine.sample(p.x,p.y));
  if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
  for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
 }assert(moved>50);
 console.log({reference:fine.reference,maxRefinement:refinement,lines:lines.map(l=>l.length),moved,residual:raw.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
