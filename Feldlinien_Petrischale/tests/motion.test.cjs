const assert=require('node:assert/strict');const motion=require('../grain-motion.js');const grains=require('../grains.js');const geometry=require('../scene-geometry.js');const clock=require('../simulation-clock.js');
const particle=(x,y,theta=0)=>({x,y,theta,length:10,width:2.5,mobility:1});
const uniform=()=>({ex:1,ey:0});
const gradient=(x)=>({ex:1+(x-500)/200,ey:0});
let p=particle(500,494);motion.step([p],uniform,1/60,1);assert.equal(p.x,500);assert.equal(p.y,494);
for(let i=0;i<120;i++)motion.step([p],gradient,1/60,1);assert(p.x>500);
let missing=particle(500,494);motion.step([missing],()=>null,1/60,1);assert.equal(missing.x,500);
const a=particle(480,494),b=particle(510,494);
assert(motion.pairForce(a,b,{x:1,y:0},{x:1,y:0}).x>0);
assert(motion.pairForce(a,{...b,x:480,y:524},{x:1,y:0},{x:1,y:0}).y<0);
const reverse=motion.pairForce(b,a,{x:1,y:0},{x:1,y:0}),forward=motion.pairForce(a,b,{x:1,y:0},{x:1,y:0});assert(Math.abs(reverse.x+forward.x)<1e-12);
function evolved(fps){const pair=[particle(480,494),particle(510,494)];const timer=clock.create();for(let i=0;i<=fps*5;i++)timer.advance(i*1000/fps,dt=>motion.step(pair,uniform,dt,1,{interactions:true}));return pair;}
const pair=evolved(60);assert(pair[1].x-pair[0].x<30);assert(pair[1].x-pair[0].x>=motion.radius(pair[0])+motion.radius(pair[1]));assert.deepEqual(pair,evolved(10));
// Reject entry into a missing-field area and retain complete rods inside the dish.
let boundary=particle(501,494);const masked=(x)=>x>505?null:gradient(x);
for(let i=0;i<1200;i++)motion.step([boundary],masked,1/60,1);assert(boundary.x<=505);assert(boundary.x>501);
let rim=particle(887,494);for(let i=0;i<300;i++)motion.step([rim],gradient,1/60,1);assert(geometry.contains(rim.x,rim.y,motion.radius(rim)));
let seed=41;const random=()=>((seed=seed*16807%2147483647)-1)/2147483646;
const many=grains.create(undefined,random);const before=many.map(p=>({...p}));
function links(ps){let count=0;for(let i=0;i<ps.length;i++)for(let j=0;j<i;j++){const a=ps[i],b=ps[j],d=Math.hypot(a.x-b.x,a.y-b.y),angle=Math.atan2(a.y-b.y,a.x-b.x);if(d<motion.radius(a)+motion.radius(b)+3&&Math.abs(Math.cos(angle-a.theta))>.94&&Math.abs(Math.cos(angle-b.theta))>.94)count++;}return count;}
let started=performance.now();
for(let i=0;i<600;i++)motion.step(many,uniform,1/60,1,{interactions:true});
for(let i=0;i<many.length;i++){const p=many[i];assert(Number.isFinite(p.theta));assert(geometry.contains(p.x,p.y,motion.radius(p)));for(let j=0;j<i;j++)assert(Math.hypot(p.x-many[j].x,p.y-many[j].y)+1e-9>=motion.radius(p)+motion.radius(many[j]));}
assert(many.some((p,i)=>Math.hypot(p.x-before[i].x,p.y-before[i].y)>1));
assert(links(many)>links(before)+10);console.log('Aligned neighboring pairs before/after:',links(before),links(many));
const held=particle(500,494,.8);motion.step([held],gradient,1/60,1,{translation:false});assert.equal(held.x,500);assert.equal(held.y,494);assert(held.theta<.8);
console.log('PASS: gradient drift, uniform/absent field, dipole attraction/repulsion, FPS independence, mask/dish boundaries, 1200-grain collision stability. ms/step:',((performance.now()-started)/600).toFixed(2));

function scaledRun(scale,seconds){const ps=[particle(480,494,.3),particle(510,494,-.2)];const timer=clock.create({timeScale:scale});for(let i=0;i<=60*seconds;i++)timer.advance(i*1000/60,dt=>motion.step(ps,gradient,dt,1,{interactions:true}));return ps;}
assert.deepEqual(scaledRun(2,3),scaledRun(1,6));
console.log('PASS: combined rotation and translation at 2x matches twice the simulation duration at 1x.');
