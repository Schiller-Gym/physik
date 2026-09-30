'use strict';
const ScatterModel = (() => {
  const dish=typeof module!=='undefined'?require('./scene-geometry.js'):SceneGeometry;
  const minRadius=60,maxRadius=dish.seedRadius;
  function constrain(region) {
    const radius=Math.max(minRadius,Math.min(maxRadius,Number(region.radius)||180));
    // Homothetic inner ellipse conservatively keeps the whole circle inside the oil.
    const scale=1-radius/Math.min(dish.rx,dish.ry);
    let dx=Number.isFinite(region.x)?region.x-dish.x:0,dy=Number.isFinite(region.y)?region.y-dish.y:0;
    const distance=Math.hypot(dx/(dish.rx*scale),dy/(dish.ry*scale));
    if(distance>1){dx/=distance;dy/=distance;}
    return {x:dish.x+dx,y:dish.y+dy,radius,distribution:region.distribution==='uniform'?'uniform':'gaussian'};
  }
  const defaults=()=>constrain({x:dish.x,y:dish.y,radius:180,distribution:'gaussian'});
  const count=region=>Math.round(1200*(region.radius/maxRadius)**2);
  function point(region,margin,random=Math.random) {
    const radius=Math.max(0,region.radius-margin),angle=2*Math.PI*random(),u=random();
    // Inverse radial CDF of a 2-D Gaussian, sigma = radius/2, truncated at radius.
    // sqrt(u) is required for equal AREA density in the alternative uniform mode.
    const r=radius*(region.distribution==='uniform'?Math.sqrt(u):.5*Math.sqrt(-2*Math.log(1-u*(1-Math.exp(-2)))));
    return {x:region.x+r*Math.cos(angle),y:region.y+r*Math.sin(angle)};
  }
  return {constrain,defaults,count,point,minRadius,maxRadius};
})();
if(typeof module!=='undefined')module.exports=ScatterModel;
