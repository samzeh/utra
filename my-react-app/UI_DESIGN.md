# Frostline UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ❄️ Frostline     Winter Olympics Intelligence Platform    🟢 Live       │
│ ═══════════════════════════════════════════════════════════════════════ │
│                                                                           │
│                     ┌────────────────────────────┐                       │
│                     │ Ice Cube Curling Center    │                       │
│                     │ Curling • Beijing          │                       │
│                     ├────────────────────────────┤                       │
│                     │ Surface Temperature        │                       │
│                     │      -4.2°C                │                       │
│                     │                            │                       │
│  🟢 Speed Skating   │ Stability Score            │                       │
│      Oval           │ [████████████░] 92/100     │                       │
│                     │                            │                       │
│         🔴 Big Air  │ Risk Level:  🟢 Low        │                       │
│            Shougang │                            │                       │
│                     │ ┌────────────────────────┐ │                       │
│  🟢 Ice Cube        │ │ 🤖 AI ANALYSIS         │ │                       │
│  🟢 Wukesong        │ │ Ice surface maintaining│ │                       │
│                     │ │ optimal temperature.   │ │                       │
│  🟡 Alpine          │ │ No disruptions         │ │                       │
│     Centre          │ │ expected.              │ │                       │
│                     │ └────────────────────────┘ │                       │
│  🟡 Genting         │                            │                       │
│     Halfpipe        │ Last updated: 2:34:56 PM   │                       │
│                     └────────────────────────────┘                       │
│  🟢 Genting                                                               │
│     Slopestyle                                                            │
│                                                                           │
│  🟡 Bobsleigh                                                             │
│     Track                                                                 │
│                                                                           │
│  ┌─────────────┐                                                          │
│  │ Risk Levels │                                                          │
│  ├─────────────┤                                                          │
│  │ 🟢 Low Risk │                                                          │
│  │ 🟡 Medium   │                                                          │
│  │ 🔴 High     │                                                          │
│  └─────────────┘                                                          │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

Legend:
━━━━━ Header bar (gradient navy to black)
────  Venue panel (frosted glass, top-right)
█████ Filled stability bar (green/amber/red)
🟢🟡🔴 Venue markers (color = risk level)
┌──┐  Panel/box borders
```

## Color Palette

### Primary Colors
```css
Background:         #0a0e27 (Deep navy)
Header gradient:    #1a1f3a → #0a0e27 (Purple-navy to deep navy)
Text primary:       #ffffff (White)
Text secondary:     #94a3b8 (Light slate)
Text muted:         #64748b (Slate)
```

### Risk Colors
```css
Low risk (green):    #10b981
Medium risk (amber): #f59e0b
High risk (red):     #ef4444
```

### UI Elements
```css
Panel background:    rgba(10, 14, 39, 0.95) + blur(20px)
Panel border:        rgba(255, 255, 255, 0.15)
AI insight box:      rgba(99, 102, 241, 0.1) with #6366f1 border
Button hover:        rgba(239, 68, 68, 0.2)
```

## Typography

```css
Header title:        1.8rem, 700 weight, -0.5px letter-spacing
Header subtitle:     0.9rem, 400 weight, #94a3b8
Panel title:         1.4rem, 700 weight
Metric labels:       0.8rem, 600 weight, uppercase, 0.5px spacing
Metric values:       1.8rem, 700 weight
AI insight:          0.95rem, 400 weight, 1.6 line-height
```

## Component Positioning

```
Header:           top: 0, height: ~72px, full width
Map:              remaining viewport height
Legend:           bottom: 2rem, left: 2rem, fixed
Venue Panel:      top: 2rem, right: 2rem, width: 400px, fixed
```

## Animations

### Pulsing Marker (High Risk)
```css
@keyframes pulse {
  0%, 100%: opacity 1, scale 1
  50%:      opacity 0, scale 1.5
}
Duration: 2s, infinite
```

### Pulsing Status Dot
```css
@keyframes pulse-dot {
  0%, 100%: opacity 1
  50%:      opacity 0.4
}
Duration: 2s, infinite
```

### Panel Slide-In
```css
@keyframes slideIn {
  from: opacity 0, translateX(20px)
  to:   opacity 1, translateX(0)
}
Duration: 0.3s, ease-out
```

### Hover Effects
```css
Marker hover:     transform: scale(1.2)
Button hover:     background color change + border glow
Transition time:  0.2s ease
```

## Marker Design

```
     ╭─────╮
     │  ●  │  ← Main circle (20px, colored by risk)
     ╰──┬──╯     + 3px white border
        │        + drop shadow
        ▼     ← Pointer triangle (6px)
```

High-risk markers have additional pulsing ring (32px) around them.

## Panel Layout

```
┌────────────────────────────────────┐
│ Venue Name              [X]        │ ← Header
│ Sport Type • Location              │
├────────────────────────────────────┤
│ Surface Temperature                │ ← Metrics
│   -4.2°C                           │   Section
│                                    │
│ Stability Score                    │
│ [████████████░░] 92/100            │
│                                    │
│ Risk Level                         │
│   [Low]                            │
├────────────────────────────────────┤
│ ┌────────────────────────────────┐ │
│ │ 🤖 AI ANALYSIS                 │ │ ← AI Insight
│ │                                │ │   Box
│ │ Ice surface maintaining...     │ │
│ └────────────────────────────────┘ │
├────────────────────────────────────┤
│ Last updated: 2:34:56 PM           │ ← Footer
└────────────────────────────────────┘
```

## Responsive Breakpoints

```css
Desktop (default):  All features visible
Tablet (< 768px):   Panel width: auto (full width - 2rem)
                    Header font sizes reduced 20%
Mobile (< 480px):   Legend moves to bottom-center
                    Panel takes most of screen
                    Touch-optimized hit areas
```

## Accessibility

- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Focus indicators (2px blue outline)
- ✅ Semantic HTML (header, main, nav)
- ✅ ARIA labels on interactive elements
- ✅ High contrast ratios (WCAG AA+)
- ✅ Touch targets minimum 44x44px

## Map Styles

```
Default:     mapbox://styles/mapbox/dark-v11
Alternatives:
  - satellite-v9   (satellite imagery)
  - streets-v12    (light theme)
  - outdoors-v12   (topographic)
  - navigation-night-v1 (navigation dark)
```

## Visual Hierarchy

```
Level 1 (Most Important):
  - High-risk pulsing markers
  - Venue name in panel
  - AI insight text

Level 2 (Secondary):
  - Other markers
  - Metric values (temperature, score)
  - Risk level badge

Level 3 (Tertiary):
  - Legend
  - Metric labels
  - Last updated timestamp
  - Header subtitle
```

## Design Principles Used

1. **Contrast**: Dark background makes colored markers pop
2. **Hierarchy**: Size + weight + color guide attention
3. **Consistency**: All markers/panels follow same pattern
4. **Feedback**: Hover states, animations, transitions
5. **Clarity**: Single purpose per component
6. **Whitespace**: Generous padding prevents clutter
7. **Motion**: Animations enhance, don't distract

## Inspiration & References

- Weather radar apps (color-coded alerts)
- Flight tracking dashboards (real-time markers)
- Esports broadcast overlays (data + AI insights)
- Apple Maps dark mode (professional aesthetic)
- Command center UIs (dark theme, critical info)

---

This document captures the complete visual design of Frostline. Use it as a reference when making styling changes or explaining the design to others.
