const assert=require('node:assert/strict');
const scatter=require('../scatter-model.js'),grains=require('../grains.js'),dish=require('../scene-geometry.js'),motion=require('../grain-motion.js');
const rng=seed=>()=>((seed=seed*16807%2147483647)-1)/2147483646;
assert.equal(scatter.count(scatter.defaults()),276);
assert.equal(scatter.count({radius:375}),1200);
assert.equal(scatter.count({radius:60}),31);
for(const radius of [60,180,375])for(const [x,y] of [[500,494],[-100,-200],[1300,1400]]){
  const region=scatter.constrain({x,y,radius});
  // Sample the selection circumference against the true dish boundary.
  for(let a=0;a<2*Math.PI;a+=.03)assert(dish.contains(region.x+radius*Math.cos(a),region.y+radius*Math.sin(a)));
  for(const distribution of ['uniform','gaussian']){
    region.distribution=distribution;
    const ps=grains.create(scatter.count(region),rng(37),region);
    assert.equal(ps.length,scatter.count(region));
    for(let i=0;i<ps.length;i++){
      const p=ps[i];assert(Math.hypot(p.x-region.x,p.y-region.y)+motion.radius(p)<=radius+1e-8);
      assert(dish.contains(p.x,p.y,motion.radius(p)));
      for(let j=0;j<i;j++)assert(Math.hypot(p.x-ps[j].x,p.y-ps[j].y)>=motion.radius(p)+motion.radius(ps[j]));
    }
  }
}
function centerFraction(distribution){const region={...scatter.defaults(),distribution},ps=grains.create(scatter.count(region),rng(53),region);return ps.filter(p=>Math.hypot(p.x-region.x,p.y-region.y)<region.radius/2).length/ps.length;}
const gaussian=centerFraction('gaussian'),uniform=centerFraction('uniform');assert(gaussian>uniform+.08);
for(const distribution of ['uniform','gaussian']){
  const region={...scatter.defaults(),distribution},random=rng(43);let inner=0;
  for(let i=0;i<30000;i++){const p=scatter.point(region,0,random);if(Math.hypot(p.x-region.x,p.y-region.y)<region.radius/2)inner++;}
  const expected=distribution==='uniform'?.25:(1-Math.exp(-.5))/(1-Math.exp(-2));assert(Math.abs(inner/30000-expected)<.012);
}
// The selected circle is NOT passed into motion: particles can leave it afterwards.
const region=scatter.defaults(),p={x:region.x+region.radius-7,y:region.y,length:5,width:2.5,theta:0,mobility:1};
for(let i=0;i<1200;i++)motion.step([p],x=>({ex:1+(x-500)/500,ey:0}),1/60,1);
assert(p.x>region.x+region.radius);
console.log('PASS: area-based count, truncated Gaussian/uniform statistics, packing, movable circle/dish bounds, free motion after scattering.',{gaussian,uniform});
