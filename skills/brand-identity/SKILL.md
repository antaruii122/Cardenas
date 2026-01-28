---
name: brand-identity
description: Provides the single source of truth for brand guidelines, design tokens, technology choices, and voice/tone. Use this skill whenever generating UI components, styling applications, writing copy, or creating user-facing assets to ensure brand consistency.
---

# Brand Identity & Guidelines

**Brand Name:** Antigravity Cardenas

This skill defines the core constraints for visual design and technical implementation for the brand. You must adhere to these guidelines strictly to maintain consistency.

## Visual Design Rules (MANDATORY)

**Rule #1**: NO LIGHT MODE. The application is strictly **Dark Mode** (except for document previews like Excel/PDF).
**Rule #2**: NO GENERIC CARDS. Use **Bento Grids** and **Glassmorphism**.

### Layout Strategy (Bento Grid)
- Use **CSS Grid** (`grid-cols-1 md:grid-cols-3 gap-6`).
- **Executive Summary**: Full width (`col-span-3`).
- **Main Visuals**: Center focus (`col-span-2`).
- **Insights/Lists**: Side column (`col-span-1`).
- **Spacing**: Use `gap-6` or `gap-8`. "Airy" but dense data.

### Premium Details
- **Gradients**: Use subtle radial gradients in the background to create depth.
- **Borders**: Extremely subtle (`border-white/5` or `border-white/10`).
- **Charts**: Hide grids (`stroke="#333" strokeDasharray="3 3"`).
- **Tooltips**: Dark background (`bg-slate-900 border border-slate-800`).

## Reference Documentation

Depending on the task you are performing, consult the specific resource files below. Do not guess brand elements; always read the corresponding file.

### For Visual Design & UI Styling
If you need exact colors, fonts, border radii, or spacing values, read:
👉 **[`resources/design-tokens.json`](resources/design-tokens.json)**

### For Coding & Component Implementation
If you are generating code, choosing libraries, or structuring UI components, read the technical constraints here:
👉 **[`resources/tech-stack.md`](resources/tech-stack.md)**

### For Copywriting & Content Generation
If you are writing marketing copy, error messages, documentation, or user-facing text, read the persona guidelines here:
👉 **[`resources/voice-tone.md`](resources/voice-tone.md)**
