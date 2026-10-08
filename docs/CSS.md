# CSS conventions

## Scope

These conventions apply to CSS, CSS Modules, preprocessors, CSS-in-JS, design
tokens, and styles embedded in components.

Follow the repository’s existing styling architecture, naming convention,
browser support policy, design system, reset, and build tools. Do not introduce
a second styling methodology or replace established patterns unless the task
requires it.

Component code also follows its applicable framework conventions.

Repository-specific conventions take precedence over this document.

## Automated enforcement

Use the repository’s configured formatter, Stylelint rules, compiler, and
browser-support tooling. These configurations are authoritative for mechanical
style, property syntax, and supported features.

Use the project’s documented verification commands when available. Typical
checks include:

```sh
<package-manager> run format
<package-manager> run lint
<package-manager> run build
<package-manager> test
```

Do not disable lint rules broadly or change formatting configuration merely to
make a change pass. Keep necessary Stylelint exceptions narrowly scoped and
explain non-obvious exceptions.

Do not edit generated stylesheets or compiled assets directly. Change their
source, tokens, or generator.

## Design

### Cascade and organization

Work with the cascade rather than escalating specificity.

- Prefer classes or the project’s local scoping mechanism for component styles.
- Keep selectors shallow and independent of incidental DOM nesting.
- Avoid IDs for reusable styling.
- Avoid `!important` except for an established utility policy or an unavoidable
  external override; explain exceptional uses.
- Keep global styles limited to genuine application-wide foundations.
- Use cascade layers only when they are part of the project’s architecture or
  solve a clear ordering boundary.

Organize styles around their ownership. Keep component-specific rules near the
component when the repository supports that structure. Place shared foundations,
tokens, and utilities in their established shared locations.

Comment decisions that are not evident from the code, such as browser
workarounds or deliberate cascade overrides. Do not narrate ordinary
declarations.

### Values and tokens

Use existing design tokens or custom properties for shared semantic decisions
such as color, spacing, typography, elevation, and motion.

Prefer semantic names such as `--color-text-muted` over names tied to a literal
value such as `--gray-500` when the value represents a product-level role.
Follow the existing token system when it intentionally uses another model.

Use local custom properties for values shared only within one component.
Avoid creating global tokens for incidental one-off values.

Choose units according to the behavior being modeled:

- relative units for typography and user-scalable dimensions
- percentages, flexible tracks, and intrinsic sizing for fluid layout
- fixed units when the dimension is genuinely fixed, such as a one-pixel border

Do not replace working values merely to enforce one preferred unit everywhere.

### Layout and responsive behavior

Prefer normal flow, Flexbox, and Grid for structural layout. Use absolute or
fixed positioning when the element is intentionally removed from normal flow,
not as the default layout mechanism.

Design for available space and content rather than a fixed list of devices.
Use media queries for viewport or user-environment concerns and container
queries when a reusable component should adapt to its container.

Allow content to wrap and containers to grow. Avoid fixed heights for
text-bearing elements unless overflow behavior is deliberate.

Prefer logical properties such as `margin-inline`, `padding-block`, and
`inset-inline-start` when direction should follow the writing mode. Use physical
directions when the physical direction itself is meaningful.

Keep DOM order consistent with reading and focus order. Do not use visual CSS
reordering to repair incorrect document structure.

### Interaction and accessibility

Define all relevant component states, including hover, focus, active, disabled,
selected, invalid, loading, and expanded states when applicable.

Preserve a visible keyboard focus indicator. Do not remove an outline unless an
equally visible replacement is provided.

Do not communicate meaning through color alone. Ensure text, controls, icons,
borders, and focus indicators have sufficient contrast for the project’s
accessibility target.

Respect user preferences such as `prefers-reduced-motion`, forced colors, and
color scheme when the interface uses the corresponding behavior.

Use animation to explain change or provide feedback, not as a prerequisite for
understanding or operating the interface. Avoid animating layout-intensive
properties when transforms or opacity provide the intended result.

## Boundaries and errors

CSS declarations can fail independently and may be ignored by unsupported
browsers. Use newer features according to the project’s browser-support policy.

When progressive enhancement is appropriate:

- provide a usable baseline
- place enhanced declarations after compatible fallbacks
- use `@supports` when support detection materially improves the result
- verify that custom-property fallbacks behave as intended

Treat third-party widgets, embedded content, and legacy styles as boundaries.
Scope overrides narrowly rather than increasing global specificity.

Design for unpredictable content:

- long words, URLs, and translated text
- missing, unusually wide, or unusually tall media
- empty content and variable item counts
- user font-size and text-spacing changes
- zoom and narrow available space

Constrain images and other replaced content so they do not overflow their
containers unless overflow is intentional.

Avoid hiding overflow merely to conceal a layout defect. Determine whether the
content should wrap, scroll, clip, or expand, and encode that behavior
deliberately.

When changing shared tokens or global styles, inspect their downstream effects
rather than treating the change as locally scoped.

## Testing

Verify changed styles in the states and environments that materially affect
their behavior.

Check relevant combinations of:

- narrow and wide viewports
- small and large containers
- keyboard focus and pointer interaction
- default, hover, active, disabled, invalid, and loading states
- short, long, empty, and translated content
- browser zoom and increased text spacing
- reduced motion and forced colors
- light and dark themes when supported
- right-to-left or alternate writing modes when supported
- supported browsers and platforms

Test layout with real component content rather than only idealized placeholder
text.

Use visual regression tests when the repository supports them, but review
changes rather than accepting updated snapshots automatically. Visual snapshots
do not replace interaction, accessibility, or responsive testing.

Run the formatter, style linter, component tests, and affected build or visual
checks before reporting completion.

## References

- [MDN: Organizing your CSS](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Organizing)
- [MDN: Introduction to the cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction)
- [MDN: Cascade layers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Cascade_layers)
- [MDN: CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables)
- [MDN: Media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries)
- [MDN: Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries)
- [MDN: Logical properties and values](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values)
- [Stylelint configuration](https://stylelint.io/user-guide/configure/)
- [WCAG 2.2 CSS techniques](https://www.w3.org/WAI/WCAG22/Techniques/)
- [WCAG: Use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)
- [WCAG: Focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)