# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML applications with embedded CSS and JavaScript. No build system or package manager is required—files can be opened directly in a browser.

## Applications

- **bremsweg.html** - Physics simulation for braking distance calculations (German)
- **burgen.html** - Castle defense game (Ballerburg-style) with projectile physics and damage calculations
- **finance-app.html** - Personal finance dashboard
- **feldstaerke.html** - Experimental determination of the force on a test charge in a parallel-plate capacitor (German): voltage is the control, measurement series, table and F(q) plot whose slope is E
- **influenz.html** - Polarisation (dielectric) vs. influence (conductor), side by side: sphere in a uniform external field
- **feldlinien.html** - Electric field line simulation (German): point, surface, ring and hollow-sphere charges with conductor influence (induced charge), adjustable charge, draggable bodies

## Worksheets

- **arbeitsblatt-feldstaerke.docx** - student worksheet for feldstaerke.html: record F(q), plot it on the prepared grid, read E off the slope
- **arbeitsblatt-feldstaerke-loesung.docx** - solution sheet with the expected values and notes for the teacher

These are plain Word documents; edit them in Word. With U = 2000 V and d = 10 cm the settings give E = 20 kV/m, so F = 20 uN per nC and the measured points run from (0|0) to (10 nC|200 uN), exactly the diagonal of the printed grid.

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
- **feldstaerke.html**: Ideal parallel-plate capacitor, plates horizontal, driven by the VOLTAGE U (U > 0 means top plate positive). E = U/d between the plates and 0 outside, F = q*E = q*U/d, sigma = eps0*E, plate charge Q = eps0*A*U/d = C*U with C = eps0*A/d. Gravity is ignored by request and the test charge is assumed not to disturb the plates. Voltage in V, charges in nC, force in uN. Because U is prescribed rather than Q, E is independent of the plate area and inversely proportional to d - the opposite of the charge-driven case. The measurement part records rows (U, q, d, A, F) into a table and plots q/U/d/(1/d)/A against F/E/Q, fitting a line through the origin by least squares: F over q gives E (1 uN/nC = 1e3 V/m), F over U gives q/d, F over 1/d gives q*U, Q over A is proportional. A relative residual test suppresses the fit line and explains the physics when the data are not proportional, e.g. F over d or F over A. The scene is drawn at a FIXED scale derived from the slider maxima, so d and A map to the drawing absolutely; an auto-fitting zoom would freeze the plate gap once height becomes the limiting dimension.
