# React conventions

## Scope

These conventions apply to React components, Hooks, context providers, tests,
and client-side integration code.

Follow the repository’s existing React version, rendering framework, state and
data libraries, routing, styling system, and testing tools. Do not replace or
introduce alternatives unless the task requires it.

TypeScript code also follows `docs/TYPESCRIPT.md`; styling follows
`docs/CSS.md`.

Repository-specific conventions take precedence over this document.

## Automated enforcement

Use the repository’s configured formatter, TypeScript compiler, and ESLint
rules. Enable and preserve `eslint-plugin-react-hooks` rules where the project
supports them.

Do not disable `rules-of-hooks` or omit Effect dependencies to silence
`exhaustive-deps`. Restructure the component or Hook so its dependencies
accurately describe the synchronization.

Preserve Strict Mode when enabled. Development-only repeated rendering and
Effect execution are intended to reveal missing cleanup and impure behavior;
do not remove Strict Mode to hide those failures.

Use the project’s documented verification commands when available. Typical
checks include:

```sh
<package-manager> run typecheck
<package-manager> run lint
<package-manager> test
```

Run the build or end-to-end suite when the changed behavior requires it.

Keep lint suppressions narrow and explain non-obvious exceptions. Do not weaken
React, accessibility, or Hooks rules merely to make a change pass.

## Design

### Components and rendering

Keep components and Hooks pure:

- Produce the same output for the same props, state, and context.
- Do not perform side effects during render.
- Do not mutate props, state, context, or values received by Hooks.
- Do not call component functions directly; render them through JSX.
- Keep locally created calculations and temporary mutation local to the render.

Use function components for new code unless the project or a required API
calls for a class component.

Give each component a coherent responsibility. Extract a component when doing
so creates a meaningful UI, ownership, or reuse boundary—not merely to reduce
line count.

Use semantic HTML before adding custom roles or interaction behavior. Ensure
interactive controls have accessible names and support the expected keyboard
interaction.

Use stable keys derived from data when rendering collections. Do not generate
keys during render, and avoid array indexes when items can be inserted,
removed, or reordered.

### State

Keep state as local as practical. Lift it to the nearest common owner when
multiple components need one source of truth.

Avoid state that is:

- derivable from current props or other state
- duplicated in multiple locations
- contradictory with other state
- copied from props without an intentional synchronization boundary
- more deeply nested than the update behavior requires

Represent meaningful UI states explicitly. Avoid combinations of booleans that
permit impossible states such as loading, successful, and failed at the same
time.

Treat state as an immutable snapshot. Use the provided setter or reducer and
create the next value rather than mutating the current one.

### Hooks and Effects

Call Hooks only at the top level of React components or custom Hooks.

Use event handlers for work caused by a specific user interaction. Use Effects
to synchronize React with an external system such as a browser API,
subscription, timer, network connection, or non-React widget.

Do not use an Effect merely to:

- derive data needed for rendering
- copy props into state
- respond to a user event
- keep two pieces of React state synchronized

Clean up subscriptions, listeners, timers, connections, and in-flight work
when an Effect can outlive the synchronization it established.

Extract a custom Hook when it gives reusable stateful behavior a meaningful
domain-level interface. Do not extract a Hook merely to move code out of a
component.

Use memoization for measured or evident performance needs. Do not add
`useMemo`, `useCallback`, or component memoization as a default stylistic rule.

## Boundaries and errors

Treat data from APIs, storage, URL parameters, forms, IPC, and third-party code
as external input. Validate it before treating it as trusted application state,
following `docs/TYPESCRIPT.md`.

Represent loading, empty, success, and failure states deliberately when they
produce different user-visible behavior.

Handle failures at the boundary that can make an appropriate decision:

- Event handlers should handle expected interaction failures.
- Data-loading code should expose useful pending and failure states.
- Effects should clean up stale work and avoid applying obsolete results.
- Render failures should be contained by Error Boundaries at meaningful UI
  recovery boundaries.

Error Boundaries handle failures during rendering in their descendants. They do
not replace error handling for event handlers, arbitrary asynchronous callbacks,
server rendering, or failures inside the boundary itself.

Do not catch errors merely to discard them or log and rethrow them without
adding information. Preserve useful causes while presenting safe,
user-appropriate messages.

Do not place secrets, private credentials, or privileged operations in client
components or client-visible props. Follow the rendering framework’s
server/client boundary rules.

## Testing

Add or update tests when user-visible behavior changes. Bug fixes should
normally include a regression test.

Test components through observable behavior:

- render the component in a realistic context
- interact through controls as a user would
- query elements by role, accessible name, label, or visible content
- assert the resulting UI and externally visible effects

Avoid testing private state, Hook call order, component instances, or internal
function calls. Mock external boundaries rather than React itself.

Cover material states such as:

- initial, loading, empty, success, and failure views
- validation and submission failures
- disabled and pending interactions
- Effect cleanup and subscription replacement
- relevant keyboard and accessibility behavior

Use async test utilities for asynchronously rendered UI rather than arbitrary
delays. Keep time, network, randomness, and external state controlled.

Prefer focused behavioral assertions over large snapshots. Snapshots may
support stable structural output, but should not replace assertions about
meaningful behavior.

Run the type checker, lint rules, component tests, and any affected integration
or end-to-end tests before reporting completion.

## References

- [Rules of React](https://react.dev/reference/rules)
- [Components and Hooks must be pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure)
- [eslint-plugin-react-hooks](https://react.dev/reference/eslint-plugin-react-hooks)
- [React Strict Mode](https://react.dev/reference/react/StrictMode)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [You might not need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Reusing logic with custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Rendering lists and choosing keys](https://react.dev/learn/rendering-lists)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Testing Library guiding principles](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library query priorities](https://testing-library.com/docs/queries/about/)
- [WAI accessible names and descriptions](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/)
