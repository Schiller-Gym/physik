'use strict';
// Shared drawing coordinates. Insets are presentation/safety margins, not new dishes.
const SceneGeometry = Object.freeze({
  x:500, y:494, rx:397, ry:389, seedRadius:375,
  contains(x,y,inset=0) {
    const scale=1-inset/Math.min(this.rx,this.ry);
    return scale>0&&((x-this.x)/(this.rx*scale))**2+((y-this.y)/(this.ry*scale))**2<=1;
  }
});
if(typeof module!=='undefined')module.exports=SceneGeometry;
