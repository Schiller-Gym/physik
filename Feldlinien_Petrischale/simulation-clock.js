'use strict';
const SimulationClock = (() => {
  function create({step=1/60, maxElapsed=.25, timeScale=1}={}) {
    if(![step,maxElapsed,timeScale].every(value=>Number.isFinite(value)&&value>0))throw new Error('Invalid simulation clock settings');
    let last=null, remainder=0;
    function reset(){last=null;remainder=0;}
    function advance(time,update) {
      if(last===null){last=time;return 0;}
      const elapsed=Math.max(0,(time-last)/1000);last=time;
      // Preserve elapsed time at ordinary low frame rates; bound work after long stalls.
      // Scale elapsed time, never the physical integration step.
      remainder+=Math.min(elapsed,maxElapsed)*timeScale;
      let count=0;
      while(remainder+1e-10>=step){update(step);remainder-=step;count++;}
      remainder=Math.max(0,remainder);
      return count;
    }
    return {advance,reset};
  }
  return {create};
})();
if(typeof module!=='undefined')module.exports=SimulationClock;
