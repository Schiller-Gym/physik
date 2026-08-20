# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML applications with embedded CSS and JavaScript. No build system or package manager is required—files can be opened directly in a browser.

## Applications

- **bremsweg.html** - Physics simulation for braking distance calculations (German)
- **burgen.html** - Castle defense game (Ballerburg-style) with projectile physics and damage calculations
- **finance-app.html** - Personal finance dashboard
- **feldlinien-f.html** - Electric field line simulation (German): point, surface, ring and hollow-sphere charges with conductor influence (induced charge), adjustable charge, draggable bodies

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
- **feldlinien-f.html**: Extended bodies are discretised into sub-charges; the field is their Coulomb superposition (E = k*q/r^2, charges in nC, positions in metres). Bodies are built symmetric under z -> -z so E_z vanishes in the drawing plane and field lines stay in it. Conductors are solved with a boundary element method: surface = equipotential at fixed total charge, self-potential terms 2Kq/a (flat patch) and (2Kq/h)*arsinh(h/2rho) (wire), Gauss-Jordan on N+B unknowns, capped at MAX_UNKNOWNS. A ring is a wire loop and does not shield; the hollow sphere (drawn as its cross-section circle) does. Field-line seeds are distributed along the outline weighted by local charge density, so neutral conductors still show induced sources/sinks. Lines are traced with an adaptive-step midpoint (RK2) integrator. Optional |E| heat map and marching-squares equipotentials.
  Verified numerically (see git history): Faraday shielding to 1-2 % residual, capacitor |E|*d/U = 1.03, equipotential residual ~1e-13 V, dipole field exact.
