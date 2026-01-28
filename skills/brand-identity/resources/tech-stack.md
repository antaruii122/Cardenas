# Technology Stack & Constraints

## Core Frameworks
*   **Frontend**: Next.js 14 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React

## Backend & Data
*   **Database**: Supabase (PostgreSQL)
*   **Auth**: Supabase Auth
*   **Storage**: Supabase Storage
*   **Excel Parsing**: SheetJS (`xlsx`)
*   **Python Tools**: Pandas, OpenAI API (for semantic analysis)

## Design System Implementation
*   **Theme**: Dark Mode default.
*   **Visual Style**: Glassmorphism (High blur, transparency, thin borders).
*   **Components**: Custom React components using Tailwind classes. Avoid unstyled HTML elements.
*   **Colors**: Use `emerald-400/500` and `cyan-400/500` for primary actions. Use `rose-500` for destructive/negative.

## Coding Standards
*   Use `const` and `let`.
*   Interfaces over types for props.
*   Explicit return types for functions.
*   "Smart" components should handle logic, "Dumb" components for display.
