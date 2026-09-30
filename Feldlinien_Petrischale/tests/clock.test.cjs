const assert=require('node:assert/strict');
const {create}=require('../simulation-clock.js');
function run(fps,timeScale=1){const clock=create({timeScale});let time=0,steps=0;for(let i=0;i<=fps*3;i++)clock.advance(i*1000/fps,dt=>{time+=dt;steps++;});return {time,steps};}
for(const fps of [5,10,20,30,60,120]){const result=run(fps);assert.equal(result.steps,180);assert(Math.abs(result.time-3)<1e-10);}
const clock=create();let steps=0;clock.advance(0,()=>steps++);clock.advance(60000,()=>steps++);assert.equal(steps,15);
clock.reset();clock.advance(120000,()=>steps++);assert.equal(steps,15);
console.log('PASS: equal simulated time at 5–120 FPS, bounded stalls, clean resume.');

for(const fps of [5,10,20,30,60,120]){const result=run(fps,2);assert.equal(result.steps,360);assert(Math.abs(result.time-6)<1e-10);}
const fast=create({timeScale:2});const increments=[];fast.advance(0,dt=>increments.push(dt));fast.advance(1000/60,dt=>increments.push(dt));assert.equal(increments.length,2);assert(increments.every(dt=>dt===1/60));
fast.reset();assert.equal(fast.advance(60000,()=>{}),0);assert.equal(fast.advance(120000,()=>{}),30);
assert.throws(()=>create({timeScale:0}));
console.log('PASS: 2x time at 5–120 FPS, unchanged substeps, bounded catch-up at 2x.');
