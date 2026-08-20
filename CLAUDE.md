# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML applications with embedded CSS and JavaScript. No build system or package manager is required—files can be opened directly in a browser.

## Applications

- **bremsweg.html** - Physics simulation for braking distance calculations (German)
- **burgen.html** - Castle defense game (Ballerburg-style) with projectile physics and damage calculations
- **finance-app.html** - Personal finance dashboard
- **influenz.html** - Polarisation (dielectric) vs. influence (conductor), side by side: sphere in a uniform external field
- **feldlinien.html** - Electric field line simulation (German): point, surface, ring and hollow-sphere charges with conductor influence (induced charge), adjustable charge, draggable bodies

## Development

These are single-file applications. To work on them:
1. Open the HTML file directly in a browser
2. Edit the file and refresh the browser to see changes

No build commands, linting, or test frameworks are used.

## Architecture

Each application is self-contained in a single HTML file with:
- Embedded CSS in `<style>` tags
- Embedded JavaScript in `<script>` tags
- Canvas-based rendering for games and simulations

## Key Implementation Details

- **burgen.html**: Uses HTML5 Canvas for game rendering, implements projectile motion physics with gravity, wind, and damage calculations based on kinetic energy
- **bremsweg.html**: Uses Canvas for road/sky visualization with braking distance calculations
- **finance-app.html**: Dashboard layout with sidebar navigation and chart components
- **feldlinien.html**: Extended bodies are discretised into sub-charges; the field is their Coulomb superposition (E = k*q/r^2, charges in nC, positions in metres). Bodies are built symmetric under z -> -z so E_z vanishes in the drawing plane and field lines stay in it. Conductors are solved with a boundary element method: surface = equipotential at fixed total charge, self-potential terms 2Kq/a (flat patch) and (2Kq/h)*arsinh(h/2rho) (wire), Gauss-Jordan on N+B unknowns, capped at MAX_UNKNOWNS. A ring is a wire loop and does not shield; the hollow sphere (drawn as its cross-section circle) does. Field-line seeds are distributed along the outline weighted by local charge density, so neutral conductors still show induced sources/sinks. Lines are traced with an adaptive-step midpoint (RK2) integrator. Optional |E| heat map and marching-squares equipotentials.
  Verified numerically (see git history): Faraday shielding to 1-2 % residual, capacitor |E|*d/U = 1.03, equipotential residual ~1e-13 V, dipole field exact.
- **influenz.html**: Uses the exact analytic solution for a sphere of relative permittivity er in a uniform external field E0, with beta = (er-1)/(er+2). Inside E = (1-beta)*E0 (uniform), outside E0 plus a pure dipole field with p = 4*pi*eps0*R^3*beta*E0, surface charge sigma = 3*eps0*beta*E0*cos(theta). The conductor is exactly the limit er -> infinity, i.e. beta = 1, so both cases share one formula. Field lines are integrated outside and drawn as horizontal chords inside with spacing s/(1-beta), which makes line density represent the weakened interior field (and makes interior lines vanish for the conductor). The lattice drawing distinguishes free electrons (leave their atom, pile up at the surface) from bound electron shells (shift slightly, each atom becomes a dipole); that displacement is exaggerated for visibility, the displayed values are exact.
