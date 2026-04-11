# Design System Specification: Clinical Precision & Fluid Recovery

## 1. Overview & Creative North Star
The design system is guided by a Creative North Star we define as **"The Kinetic Sanctuary."** 

In the world of kinesiology and physiatry, movement is medicine. This system rejects the cold, rigid "spreadsheet" aesthetic of legacy medical software. Instead, it mirrors the human body: structured yet fluid, clinical yet empathetic. We achieve a high-end editorial feel by breaking the traditional SaaS "box-in-a-box" layout. We utilize intentional white space, sophisticated tonal layering instead of harsh borders, and a high-contrast typographic scale that prioritizes readability for practitioners while maintaining a premium, "boutique clinic" atmosphere.

---

### 2. Colors & Surface Philosophy
The palette is rooted in medical reliability but elevated through "Soft Blues" and "Clinical Whites" that feel airy and restorative.

*   **The "No-Line" Rule:** Do not use 1px solid borders to define sections. This is a hard requirement. Boundaries must be established through background shifts. For example, a `surface_container_low` dashboard section should sit directly on a `surface` background. The change in tone is enough to define the container without "trapping" the data.
*   **The Glass & Gradient Rule:** To avoid a flat, "out-of-the-box" UI, use Glassmorphism for floating elements (like persistent sidebars or action modals). Apply `surface_container_lowest` with a 70-80% opacity and a `20px` backdrop-blur. 
*   **Surface Hierarchy & Nesting:** Treat the UI as layers of fine paper.
    *   **Base:** `surface` (#f8fafb)
    *   **Main Content Areas:** `surface_container_low` (#f0f4f6)
    *   **Interactive Cards:** `surface_container_lowest` (#ffffff)
    *   **Utility Panels:** `surface_container_high` (#e3e9eb)

**Signature Accent:** For primary Call-to-Actions (CTAs), do not use flat hex codes. Apply a subtle linear gradient from `primary` (#006972) to `primary_dim` (#005c64) at a 135-degree angle to provide a sense of "depth and pulse."

---

### 3. Typography: Editorial Authority
We use a dual-sans-serif approach to balance clinical precision with high-end editorial aesthetics.

*   **Display & Headlines (Manrope):** We use Manrope for all `display` and `headline` tokens. Its geometric yet slightly rounded character feels modern and authoritative. Use `headline-lg` (2rem) for patient names or major metrics to create a clear focal point.
*   **Functional Text (Inter):** All `title`, `body`, and `label` tokens utilize Inter. Inter is optimized for screen readability, ensuring that complex kinesiology data and physiatry notes are legible at a glance.
*   **The "Micro-Scale" Rule:** Use `label-sm` (0.6875rem) in all-caps with a `0.05rem` letter-spacing for category headers (e.g., "PATIENT VITALS"). This mimics medical chart headers but with a modern, professional polish.

---

### 4. Elevation & Depth
In this system, elevation is a feeling, not a drop-shadow.

*   **Tonal Layering:** 90% of hierarchy should be achieved by "stacking" surface tiers. A `surface_container_lowest` card placed on a `surface_container` background creates a natural, soft lift.
*   **Ambient Shadows:** When a component must float (e.g., a patient profile popover), use an extra-diffused shadow:
    *   `X: 0, Y: 12, Blur: 32, Spread: -4`
    *   **Color:** `on_surface` (#2c3436) at 6% opacity. This mimics natural ambient light rather than a digital "drop."
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in a high-density table), use `outline_variant` (#acb3b6) at **15% opacity**. It should be felt, not seen.

---

### 5. Components & Interface Patterns

#### **The Collapsible Navigation**
The sidebar navigation should feel like a docked "Control Center." 
- **State:** In its collapsed state, show only minimalist icons using the `secondary` (#38647d) color.
- **Active State:** The active nav item should not use a box; it should use a subtle `primary_container` (#73ccd6) pill background with `DEFAULT` (8px) rounded corners.

#### **Cards & Clinical Data**
- **No Dividers:** Forbid the use of horizontal lines within cards. Separate patient history or biometric data using `spacing-4` (1rem) or a shift to `surface_container_highest` for header backgrounds.
- **Roundedness:** Use the `md` (12px) scale for patient cards and `DEFAULT` (8px) for buttons.

#### **Buttons**
- **Primary:** Gradient fill (`primary` to `primary_dim`), `on_primary` text, `DEFAULT` (8px) rounding.
- **Secondary:** Transparent background with a "Ghost Border" and `secondary` text.
- **Tertiary:** No border, no background. Use `primary` text weight 600.

#### **Input Fields**
- **Style:** Use "Soft Fill" inputs. Background: `surface_container`. No border until `:focus`.
- **Focus State:** Transition the background to `surface_container_lowest` and apply a 2px "Ghost Border" of `primary`.

#### **Specialized Component: The Kinetic Progress Ring**
For tracking physical therapy recovery goals, use a custom progress ring with a stroke-width of 8px, utilizing a gradient from `tertiary` to `primary_fixed` to represent the journey from injury to health.

---

### 6. Do’s and Don’ts

**Do:**
- Use `display-md` for empty state messages to make them feel intentional and curated.
- Use `spacing-8` (2rem) between major sections to let the interface "breathe."
- Ensure all medical status chips (e.g., "Recovered," "In-Treatment") use the `secondary_container` background to keep the tone calm.

**Don’t:**
- **Don't use pure black (#000000) for text.** Always use `on_surface` (#2c3436) to maintain a soft, premium feel.
- **Don't use 100% opaque borders.** This creates visual noise and feels like "legacy" medical software.
- **Don't crowd the sidebar.** If a user has many patients, use a scrollable list within the container rather than shrinking the spacing scale.
- **Don't use standard "Alert Red" for errors.** Use our `error` (#a83836) and `on_error_container` tokens to ensure the "medical" tone remains calm and professional even during data errors.