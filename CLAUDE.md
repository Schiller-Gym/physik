# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a collection of standalone HTML applications with embedded CSS and JavaScript. No build system or package manager is required—files can be opened directly in a browser.

## Applications

- **bremsweg.html** - Physics simulation for braking distance calculations (German)
- **burgen.html** - Castle defense game (Ballerburg-style) with projectile physics and damage calculations
- **finance-app.html** - Personal finance dashboard

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
