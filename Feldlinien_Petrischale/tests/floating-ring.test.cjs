const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const G=require('../field-geometry.js'),F=require('../field.js'),L=require('../field-lines.js');
const layouts=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electrodes.js'),'utf8')+';ELECTRODE_LAYOUTS');
const config=layouts.find(l=>l.id==='06-platten-mit-ring').field;
function raster(spacing,shift=0){
 const c={...config,spacing,electrodeSeeds:[[240,496,.5],[760,496,-.5],[500+shift,354,null]]},d=G.dimensions(c),pixels=new Uint8Array(d.n*d.n*4);
 for(let y=1;y<d.n-1;y++)for(let x=1;x<d.n-1;x++){
  const X=d.originX+x*spacing,Y=d.originY+y*spacing,r=Math.hypot(X-500-shift,Y-496);
  const lead=(X>=35&&X<=226||X>=774&&X<=965)&&Math.abs(Y-496)<=5;
  if((Math.abs(X-240)<=15.5||Math.abs(X-760)<=15.5)&&Y>=273.5&&Y<=716.5||Math.abs(r-142)<=15||lead)pixels[4*(y*d.n+x)+3]=255;
 }
 return G.fromPixels(c,pixels);
}
(async()=>{
 assert.throws(()=>G.fromPixels({...config,electrodeSeeds:[[240,496,null],[760,496,null]]},[]),/Nur ein isolierter/);
 const grid=raster(5),raw=await F.solve({...grid,tolerance:1e-9}),fine=G.prepareSolution(raw,config);
 const at=(x,y)=>Math.round((y-grid.originY)/5)*grid.n+Math.round((x-grid.originX)/5);
 assert.equal(grid.values[at(100,496)],.5);assert.equal(grid.values[at(900,496)],-.5);
 assert.equal(grid.floating[at(100,496)],0);assert.equal(grid.floating[at(900,496)],0);
 assert.equal(fine.sample(100,496),null);assert.equal(fine.sample(900,496),null);
 assert(Math.abs(raw.floatingPotential)<1e-6);assert(Math.abs(raw.floatingFlux)<1e-10);
 const ringValues=Array.from(raw.potential).filter((v,i)=>grid.floating[i]);assert(ringValues.length>100);assert.equal(Math.max(...ringValues),Math.min(...ringValues));
 assert.deepEqual(fine.sample(500,496),{ex:0,ey:0});assert(fine.sample(300,496).ex>0);assert(fine.sample(700,496).ex>0);assert.equal(fine.sample(500,354),null);
 const coarse=G.prepareSolution(await F.solve({...raster(10),tolerance:1e-9}),config),refinement=Math.abs(coarse.reference/fine.reference-1);assert(refinement<.1);
 // Break symmetry: an isolated ring must find a nonzero potential, not be grounded.
 const shifted=await F.solve({...raster(10,-40),tolerance:1e-9});assert(shifted.floatingPotential>.02);assert(Math.abs(shifted.floatingFlux)<1e-10);
 const g=raster(10,-40);for(let i=0;i<g.values.length;i++)if(g.fixed[i]&&!g.floating[i])g.values[i]+=.25;
 const offset=await F.solve({...g,tolerance:1e-9});assert(Math.abs(offset.floatingPotential-shifted.floatingPotential-.25)<1e-6);
 // Cancellation also applies while solving the extra constraint.
 assert.equal(await F.solve({...grid,cancelled:()=>true}),null);
 const lines=[44,28,16].map(gap=>L.build(fine.sample,gap,config));assert(lines[0].length>5);assert(lines[2].length>lines[0].length);
 for(const line of lines[1])for(const p of line){assert(Math.hypot(p.x-500,p.y-496)>157);assert(fine.sample(p.x,p.y));}
 const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js');
 let seed=79;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646,ps=grains.create(400,random),before=ps.map(p=>({...p}));
 for(let i=0;i<600;i++)motion.step(ps,fine.sample,1/60,fine.reference,{interactions:true});
 let moved=0,inside=0;
 for(let i=0;i<ps.length;i++){const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
  if(Math.hypot(old.x-500,old.y-496)<115){assert.deepEqual(p,old);inside++;}
  if(!fine.sample(old.x,old.y))assert.deepEqual(p,old);else assert(fine.sample(p.x,p.y));
  if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
  for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
 }
 assert(moved>30);assert(inside>10);
 console.log({floatingPotential:raw.floatingPotential,flux:raw.floatingFlux,shiftedPotential:shifted.floatingPotential,refinement,lines:lines.map(l=>l.length),moved,inside,residual:raw.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
