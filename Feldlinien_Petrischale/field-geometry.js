'use strict';
// Explicit layout configuration: separated halves or connected conductor components.
// Alpha comes from the original SVG, including its strokes and connections.
const FieldGeometry = (() => {
  function dimensions(config) {
    if(!config)throw new Error('Diese Anordnung ist noch nicht freigegeben.');
    return {n:3000/config.spacing+1,spacing:config.spacing,originX:-1000,originY:config.axisY-1500};
  }
  function fromPixels(config,pixels) {
    if((config?.electrodeSeeds||[]).filter(seed=>seed[2]===null).length>1)throw new Error('Nur ein isolierter Leiter wird unterstützt.');
    const grid=dimensions(config),{n,spacing,originX}=grid;
    const fixed=new Uint8Array(n*n),values=new Float64Array(n*n);
    const labels=new Int8Array(n*n),floating=new Uint8Array(n*n);
    if(config.electrodeSeeds){
      const queue=new Int32Array(n*n);
      for(const [sx,sy,potential] of config.electrodeSeeds){
        const gx=Math.round((sx-grid.originX)/spacing),gy=Math.round((sy-grid.originY)/spacing);
        let seed=-1,best=Infinity;
        for(let y=gy-2;y<=gy+2;y++)for(let x=gx-2;x<=gx+2;x++){
          const k=y*n+x,d=(x-gx)**2+(y-gy)**2;
          if(x>0&&y>0&&x<n-1&&y<n-1&&pixels[4*k+3]>=100&&d<best){seed=k;best=d;}
        }
        if(seed<0)throw new Error('Elektrodenkontakt im Raster nicht gefunden.');
        if(labels[seed])throw new Error('Die Elektroden berühren sich im Raster.');
        let head=0,tail=1;queue[0]=seed;labels[seed]=potential===null?2:potential>0?1:-1;
        while(head<tail){
          const k=queue[head++],x=k%n,y=Math.floor(k/n);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy,j=ny*n+nx;
            if(nx>0&&ny>0&&nx<n-1&&ny<n-1&&!labels[j]&&pixels[4*j+3]>=100){labels[j]=labels[seed];queue[tail++]=j;}
          }
        }
      }
    }
    let positive=0,negative=0;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++) {
      const k=y*n+x;
      if(x===0||y===0||x===n-1||y===n-1)fixed[k]=1;
      else if(pixels[4*k+3]>=100) {
        if(config.electrodeSeeds&&!labels[k])throw new Error('Nicht zugeordnete Leiterfläche im Raster.');
        fixed[k]=1;floating[k]=labels[k]===2?1:0;
        values[k]=floating[k]?0:config.electrodeSeeds ? labels[k]*.5 : originX+x*spacing<config.splitX ? .5 : -.5;
        if(values[k]>0)positive++;else if(values[k]<0)negative++;
      }
    }
    if(!positive||!negative)throw new Error('Die Elektrodengeometrie konnte nicht geladen werden.');
    return {...grid,fixed,values,floating};
  }
  function prepareSolution(solution,config){
    const point=config.referencePoint||[500,494],e=solution.sample(...point);
    const reference=e?Math.hypot(e.ex,e.ey):0;
    if(!(reference>0))throw new Error('Kein gültiger Referenzwert für das Feld.');
    const sample=solution.sample,floor=reference*(config.relativeFloor||0);
    return {...solution,reference,sample:(x,y)=>{const e=sample(x,y);return e&&Math.hypot(e.ex,e.ey)<floor?{ex:0,ey:0}:e;}};
  }
  return {dimensions,fromPixels,prepareSolution};
})();
if(typeof module!=='undefined')module.exports=FieldGeometry;
