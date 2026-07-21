---
name: Serene Ledger
colors:
  surface: '#fefbdb'
  surface-dim: '#dedbbd'
  surface-bright: '#fefbdb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f5d6'
  surface-container: '#f2efd0'
  surface-container-high: '#ece9cb'
  surface-container-highest: '#e7e4c5'
  on-surface: '#1d1c0a'
  on-surface-variant: '#414844'
  inverse-surface: '#32311d'
  inverse-on-surface: '#f5f2d3'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#406653'
  primary: '#001d11'
  on-primary: '#ffffff'
  primary-container: '#0a3323'
  on-primary-container: '#749d87'
  inverse-primary: '#a6d0b9'
  secondary: '#7a5369'
  on-secondary: '#ffffff'
  secondary-container: '#fecce6'
  on-secondary-container: '#7a5369'
  tertiary: '#101b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#213100'
  on-tertiary-container: '#859b5a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c2ecd4'
  primary-fixed-dim: '#a6d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#284e3c'
  secondary-fixed: '#ffd8eb'
  secondary-fixed-dim: '#eab9d2'
  on-secondary-fixed: '#2f1124'
  on-secondary-fixed-variant: '#603b51'
  tertiary-fixed: '#d3eca2'
  tertiary-fixed-dim: '#b8cf88'
  on-tertiary-fixed: '#141f00'
  on-tertiary-fixed-variant: '#3a4d15'
  background: '#fefbdb'
  on-background: '#1d1c0a'
  surface-variant: '#e7e4c5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 20px
---

## Brand & Style

The design system embodies a "High-End Organic" aesthetic, blending the precision of modern financial technology with a tactile, natural serenity. It targets users seeking mindful wealth management—individuals who value clarity, calm, and premium quality.

The visual style is a sophisticated evolution of **Glassmorphism**, termed "Liquid Glass." It utilizes semi-transparent layers, high-gloss surfaces, and profound depth to create a sense of ethereal weight. The interface should feel like polished stone and tinted glass resting on a warm, matte canvas, evoking an emotional response of security and quiet luxury.

## Colors

The palette is anchored by deep, forest tones and warm parchment, now accented by a muted orchid.

*   **Primary (#0A3323):** Used for primary text, structural navigation, and high-impact actions. It provides the "ink" of the system.
*   **Secondary (#D0A1BA):** Pantone 686. Used as a sophisticated accent for highlights, selection indicators, and call-to-actions that require a softer touch than the primary green.
*   **Tertiary (#839958):** An organic sage used for success states, data visualization, and secondary buttons.
*   **Neutral (#F7F4D5):** A warm, off-white "papyri" base that serves as the global background, preventing the clinical feel of pure white.

## Typography

This design system utilizes **Inter** as the primary typeface to achieve a clean, systematic iOS-inspired look. It offers exceptional legibility and a neutral character that allows the "Liquid Glass" effects to remain the focal point.

*   **Scale:** The system follows a tight typographic scale. Headlines use slightly tighter letter spacing to maintain a premium "editorial" feel.
*   **Hierarchy:** Use `display-lg` for primary balances and hero numbers. Use `label-md` for metadata and category headers to provide a structured, organized appearance.

## Layout & Spacing

The layout philosophy is based on a **Fluid Grid** with generous margins to promote a sense of "air." 

*   **Grid:** A 12-column grid is used for desktop, 8-column for tablet, and 4-column for mobile.
*   **Margins:** On mobile, a minimum side margin of 20px is required. On desktop, content is centered within a 1200px max-width container.
*   **Rhythm:** Vertical rhythm is strictly enforced in multiples of 8px to ensure the systematic feel inherent in financial tools.

## Elevation & Depth

Depth is not communicated through traditional shadows, but through the "Liquid Glass" stacking model:

1.  **Level 0 (Base):** The #F7F4D5 parchment background.
2.  **Level 1 (Cards):** Semi-transparent white (`rgba(255, 255, 255, 0.4)`) with a `backdrop-filter: blur(12px)`. Surfaces feature a 1px white border at 50% opacity to simulate a glass edge.
3.  **Level 2 (Active/Selection):** The "Liquid Glass" state. Elements use a tinted secondary background (`rgba(208, 161, 186, 0.2)`), a stronger blur (`20px`), and a subtle **inner shadow** (`inset 0 2px 4px rgba(0,0,0,0.05)`) to create a "pressed into the surface" look.
4.  **Floating Elements:** Modals and menus use high-contrast backgrounds with a deep, diffused ambient shadow (`0 20px 40px rgba(10, 51, 35, 0.1)`) to separate them from the glass layers below.

## Shapes

The shape language is consistently rounded to reinforce the approachable and organic narrative. 

*   **Standard Radius:** 0.5rem (8px) for buttons and small input fields.
*   **Large Radius:** 1rem (16px) for cards, modals, and containers.
*   **Full Radius:** Used for tags, chips, and toggles to provide a "pill" aesthetic that contrasts against the rectangular grid.

## Components

### Buttons
Primary buttons use the Primary Green (#0A3323) with white text. Secondary buttons utilize the "Liquid Glass" style—transparent with a subtle border. Actionable icons use the Secondary Accent (#D0A1BA).

### Selection & Active States
The "Liquid Glass" style is the hallmark of the system. When an item (like a list item or navigation link) is selected, apply:
*   Background: `rgba(208, 161, 186, 0.2)`
*   Backdrop Blur: `12px`
*   Inner Shadow: `inset 0 1px 2px rgba(0,0,0,0.1)`
*   Border: `1px solid rgba(208, 161, 186, 0.3)`

### Cards
Cards are the primary container. They must never be fully opaque. They should appear as "frosted panes" over the parchment background, allowing underlying colors to bleed through softly.

### Inputs
Fields should have a minimal 1px bottom border in the Primary Green. When focused, the background transitions to a very light "Liquid Glass" tint with a subtle inner glow.

### Chips & Tags
Used for transaction categories. They utilize a semi-transparent version of the Tertiary Sage (#839958) with deep green text for maximum legibility.