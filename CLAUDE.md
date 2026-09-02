# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML applications with embedded CSS and JavaScript. No build system or package manager is required—files can be opened directly in a browser.

## Applications

- **index.html** - Landing page listing every simulation with a short description, a link and a hand drawn inline-SVG preview; also links the worksheets
- **sonnensystem.html** - Solar system in a spatial view (German): sun, 8 planets and 19 moons, adjustable speed, click a body for radius, orbital and rotation period
- **stromnetz.html** - From power station to wall socket (German): the grid as a 3D scene, coal and combined cycle plants, machine transformer, voltage levels from 380 kV down to 230 V, guided tour and quiz
- **beschleunigung.html** - Basic equation of mechanics F = m*a (German): two masses pulled by the same force race to a finish line, with optional t-s and t-v diagrams
- **burgen.html** - Castle defense game (Ballerburg-style) with projectile physics and damage calculations
- **ablenkroehre.html** - Electron deflection tube (German): trajectory of an electron beam, adjustable accelerating and deflecting voltage
- **coulomb.html** - Coulomb's law (German): two charged spheres with adjustable distance and charges, measured force, manually saved readings plotted in an r-F diagram
- **feldstaerke.html** - Experimental determination of the force on a test charge in a parallel-plate capacitor (German): voltage is the control, measurement series, table and F(q) plot whose slope is E
- **influenz.html** - Polarisation (dielectric) vs. influence (conductor), side by side: sphere in a uniform external field
- **feldlinien.html** - Electric field line simulation (German): point, surface, ring and hollow-sphere charges with conductor influence (induced charge), adjustable charge, draggable bodies
- **feldlinien-f.html** - Earlier version of feldlinien.html, kept on purpose: rigid homogeneous charge distributions, no influence and no hollow sphere

## Worksheets

- **arbeitsblatt-coulomb.docx** - student worksheet for coulomb.html, modelled on a classroom sheet about the torsion balance: the measuring method with a sketch, then eight distances the students pick themselves, measured at q1 = q2 = 20 nC, followed by power regression, linearisation over 1/r^2 and determination of k, which they compare against the value in the textbook (Metzler p. 195). The torsion balance sketch is a PNG drawn with Pillow, embedded at 300 dpi; the second image is a textbook excerpt added by the author. The docx has since been edited in Word, so regenerating it from the scratchpad script would discard those edits - change it in Word instead.
- **arbeitsblatt-feldstaerke.docx** - student worksheet for feldstaerke.html: record F(q), plot it on the prepared grid, read E off the slope
- **arbeitsblatt-feldstaerke-loesung.docx** - solution sheet with the expected values and notes for the teacher. It is deliberately NOT linked from index.html. There is no further access control: the file is publicly downloadable from the repository, which the author is aware of and accepts.

Sections 1 to 6 of the worksheet expect ideal data, so its preparation table tells students to switch the mode; section 7 on measurement uncertainty then switches back to real data. Its expected values were produced by running the page's own JavaScript (dukpy) and match the browser bit for bit. These are plain Word documents; edit them in Word. With U = 2000 V and d = 10 cm the settings give E = 20 kV/m, so F = 20 uN per nC and the measured points run from (0|0) to (10 nC|200 uN), exactly the diagonal of the printed grid.

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

- **index.html**: Pure HTML and CSS, no script. The preview images are inline SVG drawn by hand (viewBox 320x180), not screenshots - so they stay sharp, need no binary assets and keep the page self-contained. When a simulation changes noticeably, the matching SVG should be adjusted too.
- **sonnensystem.html**: Canvas 2D with its own 3D projection, no library. Bodies carry radius, orbitDays, periodDays, distance, moon count, type and a fact, shown in an info panel on click.
- **stromnetz.html**: Three.js, inlined into the file - that is what makes it about 900 KB.
- **burgen.html**: Uses HTML5 Canvas for game rendering, implements projectile motion physics with gravity, wind, and damage calculations based on kinetic energy
- **beschleunigung.html**: The only page here not written in the dark style of the others - it uses plain DOM elements on a light background instead of a canvas scene. Same force F (5..50 N) acts on two masses (1..10 kg); a = F/m and s = 0.5*a*t^2 drive two divs along their tracks, the pixel scale is 20 px per metre and the finish line sits at 750 px. Optional t-s and t-v diagrams are drawn on small canvases.
- **feldlinien.html**: Extended bodies are discretised into sub-charges; the field is their Coulomb superposition (E = k*q/r^2, charges in nC, positions in metres). Bodies are built symmetric under z -> -z so E_z vanishes in the drawing plane and field lines stay in it. Conductors are solved with a boundary element method: surface = equipotential at fixed total charge, self-potential terms 2Kq/a (flat patch) and (2Kq/h)*arsinh(h/2rho) (wire), Gauss-Jordan on N+B unknowns, capped at MAX_UNKNOWNS. A ring is a wire loop and does not shield; the hollow sphere (drawn as its cross-section circle) does. Field-line seeds are distributed along the outline weighted by local charge density, so neutral conductors still show induced sources/sinks. Lines are traced with an adaptive-step midpoint (RK2) integrator. Optional |E| heat map and marching-squares equipotentials.
  Verified numerically (see git history): Faraday shielding to 1-2 % residual, capacitor |E|*d/U = 1.03, equipotential residual ~1e-13 V, dipole field exact.
- **influenz.html**: Uses the exact analytic solution for a sphere of relative permittivity er in a uniform external field E0, with beta = (er-1)/(er+2). Inside E = (1-beta)*E0 (uniform), outside E0 plus a pure dipole field with p = 4*pi*eps0*R^3*beta*E0, surface charge sigma = 3*eps0*beta*E0*cos(theta). The conductor is exactly the limit er -> infinity, i.e. beta = 1, so both cases share one formula. Field lines are integrated outside and drawn as horizontal chords inside with spacing s/(1-beta), which makes line density represent the weakened interior field (and makes interior lines vanish for the conductor). The lattice drawing distinguishes free electrons (leave their atom, pile up at the surface) from bound electron shells (shift slightly, each atom becomes a dipole); that displacement is exaggerated for visibility, the displayed values are exact.
- **feldstaerke.html**: Ideal parallel-plate capacitor, plates horizontal, driven by the VOLTAGE U (U > 0 means top plate positive). E = U/d between the plates and 0 outside, F = q*E = q*U/d, sigma = eps0*E, plate charge Q = eps0*A*U/d = C*U with C = eps0*A/d. Gravity is ignored by request and the test charge is assumed not to disturb the plates. Voltage in V, charges in nC, force in uN. Because U is prescribed rather than Q, E is independent of the plate area and inversely proportional to d - the opposite of the charge-driven case. The measurement part records rows (U, q, d, A, F) into a table and plots q/U/d/(1/d)/A against F/E/Q, fitting a line through the origin by least squares: F over q gives E (1 uN/nC = 1e3 V/m), F over U gives q/d, F over 1/d gives q*U, Q over A is proportional. A relative residual test suppresses the fit line and explains the physics when the data are not proportional, e.g. F over d or F over A. A toggle switches between ideal and real measurement data (real is the default): in real mode the force meter reading carries a relative error of up to 4 % plus a zero-point error of up to 1 uN, derived deterministically from the settings (hash32) so the same setting always yields the same reading and every student gets the same numbers; the zero-point error does not depend on q, so it stays constant across a series. In real mode the evaluation switches from an origin-constrained fit to a general straight line (the offset creates an intercept) and the linearity tolerance rises from 2 % to 10 %. hash32 applies a full avalanche after every value - without it the structured inputs (q in equal steps) land in one narrow band instead of scattering. The scene is drawn at a FIXED scale derived from the slider maxima, so d and A map to the drawing absolutely; an auto-fitting zoom would freeze the plate gap once height becomes the limiting dimension.
- **coulomb.html**: F = k*q1*q2/r^2 with charges in nC, distance in cm and force in uN; F > 0 means repulsion. Every reading carries a relative error of up to 5 %, derived deterministically from (r, q1, q2) by the same hash32 as feldstaerke.html, so a setting always yields the same reading and every student gets the same numbers. There is deliberately NO automatic series: students move the distance by hand and press "Messwert speichern". The diagram plots F against r, 1/r^2 or q1*q2; a relative residual test (threshold 0.12, chosen so the scattered 1/r^2 data at 0.02 passes while F over r at 0.98 fails) decides whether a line through the origin is drawn. For 1/r^2 with unchanged charges the slope yields k = slope/(q1*q2); with 5 % scatter this lands within a few percent of 8.99e9. Field lines are optional and traced with the same adaptive-step RK2 as feldlinien.html. Spheres are 0.6 cm in radius and treated as point charges, so the model gets rough at the smallest distances - stated on the page.
- **ablenkroehre.html**: Electron deflection tube, classical (non-relativistic) treatment. Origin x = 0 at the plate entrance, y up. v0 = sqrt(2*e*U_B/m); inside the plates the path is a parabola y(x) = U_A*x^2/(4*d*U_B), after them a straight line, so y_S = (U_A*l)/(2*d*U_B)*(l/2+L). Geometry is fixed as specified: plate length l = 10 cm, plate separation d = 60 mm, plates-to-screen L = 20 cm, screen +-50 mm, tube half-height 55 mm. U_A > 0 means the upper plate is positive, so the negative electron is deflected upwards. The beam is stopped and reported when it hits a plate (y1 >= d/2, i.e. U_A >= 0.72*U_B) or the tube wall before the screen. Note that e/m cancels out of y_S. Verified numerically: parabola exact, back-extrapolation meets the plate centre to within 1 nm, compact formula agrees to 1e-18 m, y_S proportional to U_A and inversely proportional to U_B.
