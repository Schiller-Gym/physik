const assert=require('node:assert/strict');
const {step,trace,build}=require('../field-lines.js');
const uniform=()=>({ex:1,ey:0});
const straight=trace(uniform,{x:500,y:495});
assert(straight.length>100);
assert(straight.every(p=>Math.abs(p.y-495)<1e-10));
assert(trace(()=>({ex:0,ey:0}),{x:500,y:495}).length===0);
assert(trace(()=>null,{x:500,y:495}).length===0);
// Analytic circular vector field: RK4 must preserve radius closely over one revolution.
const circular=(x,y)=>({ex:-y,ey:x});let p={x:100,y:0};
for(let i=0;i<314;i++)p=step(circular,p,2,1);
assert(Math.abs(Math.hypot(p.x,p.y)-100)<1e-4);
const few=build(uniform,44),many=build(uniform,16);
assert(many.length>few.length);
// In the uniform case each horizontal line must respect the requested spacing.
for(let i=0;i<many.length;i++)for(let j=i+1;j<many.length;j++)assert(Math.abs(many[i][0].y-many[j][0].y)>=16);
console.log('PASS: RK4 straight/circular field, zero field, invalid samples, density and separation.');
