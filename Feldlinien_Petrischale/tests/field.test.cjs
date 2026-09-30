const assert=require('assert/strict');
const {solve}=require('../field.js');
function grid(n,h,ox,oy,geometry){const fixed=new Uint8Array(n*n),values=new Float64Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x;const v=geometry(ox+x*h,oy+y*h);if(x===0||y===0||x===n-1||y===n-1||v!==null){fixed[k]=1;values[k]=v||0;}}return {n,spacing:h,originX:ox,originY:oy,fixed,values};}
(async()=>{
const n=51,g=grid(n,1,0,0,()=>null);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x;if(g.fixed[k])g.values[k]=0.5-x/(n-1);}
const linear=await solve({...g,tolerance:1e-10});let err=0;for(let y=0;y<n;y++)for(let x=0;x<n;x++)err=Math.max(err,Math.abs(linear.potential[y*n+x]-(0.5-x/(n-1))));assert(err<1e-7);assert(Math.abs(linear.sample(25,25).ex-.02)<1e-8);
const geom=(x,y)=>{if((x>=345&&x<=375&&y>=275&&y<=715)||(x>=35&&x<=375&&Math.abs(y-495)<=5))return .5;if((x>=625&&x<=655&&y>=275&&y<=715)||(x>=625&&x<=965&&Math.abs(y-495)<=5))return -.5;return null;};
const coarse=await solve(grid(301,10,-1000,-1005,geom));const fine=await solve(grid(601,5,-1000,-1005,geom));const large=await solve(grid(401,10,-1500,-1505,geom));
const e=coarse.sample(500,495),ef=fine.sample(500,495),el=large.sample(500,495);assert(e.ex>0);assert(Math.abs(e.ey)<1e-6);assert(coarse.sample(360,495)===null);assert(Math.abs(ef.ex/e.ex-1)<.06);assert(Math.abs(el.ex/e.ex-1)<.03);
const top=coarse.sample(500,175),bottom=coarse.sample(500,815);assert(Math.abs(top.ex-bottom.ex)/e.ex<.005);
console.log(JSON.stringify({analyticMaxError:err,center:e,gridRefinementRelativeChange:Math.abs(ef.ex/e.ex-1),largerDomainRelativeChange:Math.abs(el.ex/e.ex-1),iterations:coarse.iterations,residual:coarse.residual},null,2));
assert(await solve({...grid(21,1,0,0,()=>null),cancelled:()=>true})===null);
})();

