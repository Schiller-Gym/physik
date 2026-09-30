'use strict';

// Dimensionless potential: electrodes at +0.5 / -0.5, distant boundary at 0.
// Uniform permittivity, 2D Laplace equation. No height or material interfaces.
const ElectrostaticField = (() => {
  async function solve({ n, spacing, originX, originY, fixed, values, floating,
    tolerance = 1e-7, maxIterations = 12000, pause = async () => {}, cancelled = () => false }) {
    const potential = Float64Array.from(values);
    // One isolated conductor: equipotential, zero total discrete outward flux.
    // Each exposed grid face has the same weight in this uniform 2D mesh.
    const floatingNodes=[],floatingNeighbors=[];
    if(floating)for(let k=0;k<n*n;k++)if(floating[k]){
      if(!fixed[k]||k%n===0||k%n===n-1||k<n||k>=n*(n-1))throw new Error('Ungültiger isolierter Leiter am Gebietsrand.');
      floatingNodes.push(k);
      for(const j of [k-1,k+1,k-n,k+n])if(!floating[j])floatingNeighbors.push(j);
    }
    if(floatingNodes.length&&!floatingNeighbors.length)throw new Error('Isolierter Leiter ohne freie Oberfläche.');
    function balanceFloating(){
      if(!floatingNodes.length)return;
      const v=floatingNeighbors.reduce((sum,k)=>sum+potential[k],0)/floatingNeighbors.length;
      for(const k of floatingNodes)potential[k]=v;
    }
    balanceFloating();
    const omega = Math.min(1.94, 2 / (1 + Math.sin(Math.PI / n)));
    let residual = Infinity;
    let iteration = 0;
    for (; iteration < maxIterations; iteration++) {
      if (cancelled()) return null;
      for (let y = 1; y < n - 1; y++) {
        for (let x = 1; x < n - 1; x++) {
          const k = y * n + x;
          if (fixed[k]) continue;
          potential[k] += omega * ((potential[k-1] + potential[k+1] + potential[k-n] + potential[k+n]) / 4 - potential[k]);
        }
      }
      balanceFloating();
      if (iteration % 20 === 19) {
        residual = 0;
        for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
          const k = y * n + x;
          if (!fixed[k]) residual = Math.max(residual, Math.abs((potential[k-1] + potential[k+1] + potential[k-n] + potential[k+n]) / 4 - potential[k]));
        }
        if (residual < tolerance) break;
        await pause();
      }
    }
    if (!Number.isFinite(residual) || residual >= tolerance) throw new Error('Die Feldberechnung hat die erforderliche Genauigkeit nicht erreicht.');
    const ex = new Float64Array(n*n), ey = new Float64Array(n*n);
    for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
      const k = y * n + x;
      if (fixed[k]) continue;
      ex[k] = -(potential[k+1] - potential[k-1]) / (2 * spacing);
      ey[k] = -(potential[k+n] - potential[k-n]) / (2 * spacing);
    }
    function sample(x, y) {
      const gx = (x-originX)/spacing, gy = (y-originY)/spacing;
      const ix = Math.floor(gx), iy = Math.floor(gy);
      if (ix < 1 || iy < 1 || ix >= n-2 || iy >= n-2) return null;
      const ids = [iy*n+ix, iy*n+ix+1, (iy+1)*n+ix, (iy+1)*n+ix+1];
      // No interpolation across metal. This is an electrode-plane approximation.
      if (ids.some(k => fixed[k])) return null;
      const tx=gx-ix, ty=gy-iy;
      const weights=[(1-tx)*(1-ty),tx*(1-ty),(1-tx)*ty,tx*ty];
      return { ex: ids.reduce((s,k,i)=>s+weights[i]*ex[k],0), ey: ids.reduce((s,k,i)=>s+weights[i]*ey[k],0) };
    }
    const floatingPotential=floatingNodes.length?potential[floatingNodes[0]]:null;
    const floatingFlux=floatingNodes.length?floatingNeighbors.reduce((sum,k)=>sum+floatingPotential-potential[k],0):0;
    return { potential, sample, residual, iterations: iteration+1, n, spacing, floatingPotential, floatingFlux };
  }
  return { solve };
})();
if (typeof module !== 'undefined') module.exports = ElectrostaticField;
