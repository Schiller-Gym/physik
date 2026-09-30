const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const G=require('../field-geometry.js'),F=require('../field.js'),L=require('../field-lines.js');
const layouts=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../electrodes.js'),'utf8')+';ELECTRODE_LAYOUTS');
const config=layouts.find(l=>l.id==='03-konzentrische-ringe').field;
function raster(spacing,overrides={}){
 const c={...config,spacing,...overrides},d=G.dimensions(c),pixels=new Uint8Array(d.n*d.n*4);
 const capY=330*Math.sin(Math.PI/12),capX=-330*Math.cos(Math.PI/12);
 for(let y=1;y<d.n-1;y++)for(let x=1;x<d.n-1;x++){
  const X=d.originX+x*spacing-500,Y=d.originY+y*spacing-496,r=Math.hypot(X,Y);
  const outer=(Math.abs(r-330)<=12&&Math.abs(Math.atan2(Y,X))<=11*Math.PI/12)||Math.hypot(X-capX,Y-capY)<=12||Math.hypot(X-capX,Y+capY)<=12;
  if(Math.abs(r-167)<=12.5||outer||(X>=-465&&X<=-167&&Math.abs(Y)<=5)||(X>=330&&X<=465&&Math.abs(Y)<=5))pixels[4*(y*d.n+x)+3]=255;
 }
 return G.fromPixels(c,pixels);
}
(async()=>{
 assert.throws(()=>raster(5,{electrodeSeeds:[[500,329,.5],[500,329,-.5]]}),/berühren/);
 assert.throws(()=>raster(5,{electrodeSeeds:[[500,496,.5],[830,496,-.5]]}),/nicht gefunden/);
 assert.throws(()=>raster(5,{electrodeSeeds:[[500,329,.5]]}),/Nicht zugeordnete/);
 assert.throws(()=>G.prepareSolution({sample:()=>({ex:0,ey:0})},config),/Referenzwert/);
 const g=raster(5),at=(x,y)=>Math.round((y-g.originY)/5)*g.n+Math.round((x-g.originX)/5);
 for(const [x,y] of [[335,496],[665,496],[500,331],[100,496]])assert.equal(g.values[at(x,y)],.5);
 for(const [x,y] of [[830,496],[500,166],[900,496]])assert.equal(g.values[at(x,y)],-.5);
 assert.equal(g.fixed[at(180,456)],0); // Gap beside the lead, not a short circuit.
 const raw=await F.solve({...g,tolerance:1e-9}),fine=G.prepareSolution(raw,config),coarse=G.prepareSolution(await F.solve({...raster(10),tolerance:1e-9}),config);
 const ref=fine.sample(500,246),change=Math.abs(coarse.reference/fine.reference-1);assert(change<.08);
 assert.deepEqual(fine.sample(500,496),{ex:0,ey:0});assert(ref.ey<0);
 assert(fine.sample(750,496).ex>0);assert.equal(fine.sample(500,331),null);
 const above=fine.sample(260,456),below=fine.sample(260,536);assert(above.ey<0&&below.ey>0);
 const lines=[44,28,16].map(gap=>L.build(fine.sample,gap,config));assert(lines[0].length>5);assert(lines[2].length>lines[0].length);
 for(const l of lines[1])for(const p of l){assert(Math.hypot(p.x-500,p.y-496)>154);assert(fine.sample(p.x,p.y));}
 // Independent closed annulus: exact logarithmic potential and 1/r field.
 const n=201,h=5,fixed=new Uint8Array(n*n),values=new Float64Array(n*n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=Math.hypot(x*h-500,y*h-500),k=y*n+x;if(r<=180||r>=320){fixed[k]=1;values[k]=r<=180?.5:-.5;}}
 const closed=await F.solve({n,spacing:h,originX:0,originY:0,fixed,values,tolerance:1e-9});
 const expected=1/(250*Math.log(320/180)),error=Math.abs(closed.sample(750,500).ex/expected-1);assert(error<.05);
 const grains=require('../grains.js'),motion=require('../grain-motion.js'),dish=require('../scene-geometry.js');
 let seed=79;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646,ps=grains.create(400,random),before=ps.map(p=>({...p}));
 for(let i=0;i<600;i++)motion.step(ps,fine.sample,1/60,fine.reference,{interactions:true});
 let moved=0,stillInside=0;
 for(let i=0;i<ps.length;i++){const p=ps[i],old=before[i];assert(Number.isFinite(p.theta));assert(dish.contains(p.x,p.y,motion.radius(p)));
  if(Math.hypot(old.x-500,old.y-496)<140){assert.deepEqual(p,old);stillInside++;}
  if(Math.hypot(p.x-old.x,p.y-old.y)>1)moved++;
  for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)+1e-9>=motion.radius(p)+motion.radius(ps[j]));
 }
 assert(moved>30);assert(stillInside>10);
 console.log({ref,refinement:change,closedAnnulusError:error,lines:lines.map(l=>l.length),moved,stillInside,residual:raw.residual});
})().catch(e=>{console.error(e);process.exitCode=1;});
