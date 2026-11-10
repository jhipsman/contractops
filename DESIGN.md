---
name: ContractOps
description: A restrained light workspace for contract administration.
colors:
  background: "#f8f9fb"
  surface: "#ffffff"
  foreground: "#202b39"
  muted: "#667181"
  metadata: "#66717e"
  border: "#e5e9ee"
  primary: "#176654"
  ring: "#25836e"
  navigation-active: "#eaf3ef"
  navigation-text: "#1c6553"
  attention-background: "#fffbf3"
  attention-border: "#f0e3c9"
  attention-text: "#7b643f"
  danger-background: "#fcf0eb"
  danger-text: "#a25439"
  success-background: "#edf6f0"
  success-text: "#3d7458"
  info-background: "#eef2fb"
  info-text: "#536c9b"
  neutral-background: "#f6f2e9"
  neutral-text: "#8a723f"
typography:
  headline:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "29px"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 650
    letterSpacing: "-0.018em"
  body:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Open Sans, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
rounded:
  chip: "5px"
  button: "6px"
  navigation: "7px"
  callout: "8px"
  panel: "10px"
spacing:
  control-gap: "8px"
  panel-inset: "22px"
  panel-gap: "24px"
  desktop-inset: "38px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.button}"
    padding: "8px 13px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "#3f4c5a"
    rounded: "{rounded.button}"
    padding: "8px 13px"
  button-ghost:
    rounded: "{rounded.button}"
    padding: "8px 13px"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  navigation-active:
    backgroundColor: "{colors.navigation-active}"
    textColor: "{colors.navigation-text}"
    rounded: "{rounded.navigation}"
    padding: "11px 13px"
  search:
    rounded: "{rounded.chip}"
    padding: "7px 10px"
  status-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger-text}"
    rounded: "{rounded.chip}"
    padding: "4px 7px"
---

# Design System: ContractOps

## Overview

Operate mode: a professional light workspace with clear navigation and restrained color. White panels and a white navigation rail sit on a pale background; thin rules organize dense administrative information. The next administrative action should be easy to identify.

Preserve the existing quiet, practical direction. Operational records are explicitly fictional, and unavailable modules explain their state honestly.

**Key Characteristics:**
- Light surfaces, slate typography, restrained forest green.
- Dense but ordered tables with tabular monetary values.
- Clear status labels and actionable preparation notices.

## Colors

Forest green carries primary actions and selected navigation. Status colors remain localized to badges, evidence, and notices.

### Primary
- **Forest green** (`primary`): primary buttons; `ring` provides visible keyboard focus.
- **Pale green** (`navigation-active`): selected navigation background paired with `navigation-text`.

### Neutral
- `background`, `surface`, `foreground`, `muted`, and `border` define the workspace layers.
- `metadata` is the darker small-text color used in table sublabels, footer, dates, and metric annotations.

### Status
- Amber attention surfaces pair `attention-background` and `attention-border` with `attention-text`.
- Danger, success, info, and neutral badges use the corresponding background/text token pairs. Each badge includes a written status; color is supplemental.

## Typography

Open Sans is loaded locally at weights 400, 600, and 700, with Arial and sans-serif fallbacks. CSS also requests intermediate weights for compact headings and navigation. The interface uses a 14px body with 1.5 line height; table text is 11px, headings 10px, and supporting metadata 9–10px.

Page headings use the headline role; panel headings use title. Metrics use 29px at the default desktop size and tabular numerals, with responsive sizes of 25–34px. Monetary amounts also use tabular numerals. Preserve visible hierarchy without adding display typography.

## Layout

The desktop fixed rail is 238px wide, narrowing to 210px at 1200px. The main column follows the rail; content is centered with a 1580px maximum width and 38px desktop inset. The topbar is 66px tall. Panels generally separate by 24px and use 22px heading/table insets.

At 1200px the main inset becomes 25px and the lower dashboard becomes one column. At 850px the rail becomes dismissible navigation, content uses full width, metrics form two columns, and toolbars wrap. At 480px the content inset becomes 16px and compact secondary information is reduced. Tables scroll inside their container. At 1600px vertical table and deadline spacing increases.

## Elevation & Depth

The implementation uses no box shadows. White surfaces, subtle tinted backgrounds, and 1px borders establish depth. Mobile navigation uses a translucent `#142c3a66` scrim behind the rail; avoid adding decorative elevation.

## Shapes

Panels use 10px corners, buttons 6px, navigation 7px, search and status badges 5px, and attention notices 8px. Borders are fine and low contrast. Avatars and status dots are circular. The root radius variable is 12px, but components retain their observed individual radii.

## Components

### Buttons

The shared Button supports default/primary, outline, and ghost variants plus a small size. Default controls have a 36px minimum height, 8px × 13px padding, 11px semibold text, and a 6px radius. Small buttons use a 31px minimum height and 10px text. Outline hover is `#f0f5f2`; ghost hover is `#edf2ef`. Primary has no separate hover color in the current implementation. Disabled buttons use half opacity and a not-allowed cursor.

### Inputs and filters

Search uses a 1px border, 5px corners, 7px × 10px padding, and a borderless 10px input. Filter buttons are compact and softly tinted when selected, with `aria-pressed` exposing state. Retain a visible count and recoverable empty state for in-place filtering.

### Status badges

Compact badges use 9px text, 4px × 7px padding, a 5px radius, and a current-color dot. Preserve the existing named states rather than inventing new semantics.

### Panels and tables

White bordered panels clip to their 10px corners. Panel headings use 21px × 22px padding; table cells use 18px and table titles remain links. Metrics share one bordered container, with interior dividers rather than separate floating cards.

### Navigation

Rail items use 11px × 13px padding, 12px text, and a pale green active state with `aria-current`. At mobile widths, closed navigation is inert; when open, main content is inert, keyboard focus is contained, Escape dismisses, and focus returns to the toggle. Links close the mobile rail.

### Attention notice

The amber preparation strip uses an icon, short heading, explanatory text, and an outline action. Its 15px × 19px padding and 8px corners distinguish an actionable blocker without dominating the workspace.

### Interaction

Interactive elements receive a 2px `ring` outline with 4px offset on keyboard focus. Button background transitions last .15s, navigation background .18s, and rail translation .2s ease-out. Reduced-motion preferences disable transitions and animations.

## Do's and Don'ts

- **Do** retain the professional light palette, clear navigation, and explicit fictional demo context.
- **Do** use thin dividers and tonal surfaces to organize dense information.
- **Do** keep table overflow local, filter state accessible, and keyboard focus visible.
- **Don't** introduce decorative imagery or shadows into this restrained interface.
- **Don't** imply authentication, uploads, writes, or unavailable modules work.
- **Don't** reduce the reviewed metadata or attention-text contrast.
