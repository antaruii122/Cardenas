# Plan de Implementación: Sistema de Análisis Financiero "Estados de Resultados"

## Goal Description
Desarrollar una plataforma web de alto estándar estético ("High-End UI") y funcional que ingeste datos financieros (Excel - Estados de Resultados y Balance), calcule ratios complejos basándose en la skill `financial_analysis`, y provea diagnósticos inteligentes ("Mejoramientos") para el mercado chileno.

## User Review Required
> [!IMPORTANT]
> **Website Design Strategy**: Confirming usage of **Next.js + TailwindCSS + Framer Motion** for a "Glassmorphism" / Premium aesthetic. Dark Mode by default is proposed for a professional financial look.

> [!NOTE]
> **Data Input**: The system requires mapping user Excel columns to our standard schema. We will build a flexible "Column Mapper" UI to handle different Excel formats.

## Proposed Changes

### Phase 0: Foundations & Skills (Completed/In-Progress)
#### [NEW] [financial_analysis.md](file:///c:/Users/rcgir/Desktop/Proyecto con cardenas/Antigravity Cardenas chin project/skills/finance/financial_analysis.md)
Comprehensive library of formulas (Profitability, Liquidity, Efficiency, Solvency).

### Phase 1: The "Beautiful Web" (Frontend Execution)
#### [NEW] `execution/frontend/`
- Initialize Next.js 14 (App Router).
- **Design System**: Define colors (Slate/Zinc bases, Emerald for profits, Rose for losses), Typography (Inter or Geist).
- **Components**:
    - `HeroSection`: High impact landing with 3D abstract element or clean dashboard preview.
    - `UploadWidget`: Drag & drop area with "scanning" animation.
    - `DashboardGrid`: Bento-box style layout for metric cards.

### Phase 2: Orchestration Layer (The Logic)
#### `orchestration/`
- **Excel Parser**: Logic to read `.xlsx`.
- **Mapper**: "Rosetta Stone" logic to map "Ventas Netas" (User) -> `Total Revenue` (System).
- **Analyzer Engine**: TypeScript/Python logic that imports `financial_analysis` rules and applies them to the parsed data.

### Phase 3: Directives Integration
- Implement the "Rules Engine" that takes the Analyzer output and generates the text descriptions for "Mejoramientos".

## Verification Plan
### Automated Tests
- **Unit Tests**: Verify that `Current Ratio` formula returns correct values for known inputs.
- **Rule Tests**: Verify that specific threshold breaches trigger the correct "Mejoramiento" string.

### Manual Verification
- **Visual QA**: Verify animations are smooth (60fps) and responsive.
- **User Flow**: Upload a sample "Sii_Balance_2024.xlsx", map columns, and verify the resulting Dashboard numbers match the Excel.
