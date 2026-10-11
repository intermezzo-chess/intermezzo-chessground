# TypeScript conventions

## Scope

These conventions apply to TypeScript source, tests, declarations, build
scripts, and configuration.

Follow the repository’s existing TypeScript version, module system, runtime,
package manager, compiler settings, lint configuration, formatter, and testing
tools. Do not upgrade or replace them unless the task requires it.

Repository-specific conventions take precedence over this document.

## Automated enforcement

Treat `tsconfig.json`, the configured linter, and the formatter as authoritative
for mechanical style and compiler policy.

Preserve strict compiler settings. Do not weaken type checking or exclude files
to make a change pass. For new TypeScript configurations, prefer `strict` mode
unless the target environment requires otherwise.

Use the project’s documented verification commands when available. Typical
checks include:

```sh
<package-manager> run typecheck
<package-manager> run lint
<package-manager> test
```

Run the formatter or build when the repository defines those checks.

Do not suppress diagnostics broadly. When an exception is necessary:

- Prefer `@ts-expect-error` to `@ts-ignore` so an obsolete suppression becomes
  detectable.
- Include a short explanation when the reason is not evident.
- Keep ESLint disable comments scoped to the smallest practical expression or
  line.
- Do not edit generated TypeScript or declaration files directly.

Use type-aware lint rules when the project already supports them. Do not add
formatting rules that conflict with the configured formatter.

## Design

Use TypeScript to model the domain rather than merely annotate JavaScript.

Prefer:

- `unknown` for values whose type has not been established
- discriminated unions for mutually exclusive states
- literal unions or domain types for constrained values
- `readonly` inputs and properties when mutation is not part of the contract
- explicit exported types for stable module boundaries
- inference for straightforward local implementation details

Avoid `any` when practical because it disables checking and propagates through
other types. When interoperability requires `any`, contain it at the boundary
and convert it to a checked type as soon as possible.

Model states so invalid combinations are difficult to construct. Prefer:

```ts
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

over collections of booleans and optional properties that can contradict one
another.

Narrow values through control flow, predicates, or validation before using
them. Avoid non-null assertions and broad type assertions when the type can be
established safely. When an assertion is unavoidable, keep it local and make
the underlying invariant clear.

Use `satisfies` when a value should be checked against a type without discarding
its more specific inferred type.

Follow the surrounding code when choosing between `interface` and `type`.
Prefer type aliases for unions and mapped or conditional types. Avoid changing
between equivalent forms without a concrete benefit.

Keep module APIs small. Export only what consumers need, and preserve the
repository’s established ESM or CommonJS conventions. Do not mix module systems
or alter module-resolution settings casually.

## Boundaries and errors

TypeScript types are erased during compilation and do not validate runtime
data. Treat values from users, networks, storage, environment variables,
configuration, IPC, JSON, and third-party libraries as untrusted until they
have been checked.

Validate external data at the boundary. After validation, convert it into a
trusted application type so internal code does not repeatedly reinterpret raw
input.

Distinguish missing values deliberately:

- Use optional properties when a property may be absent.
- Use `undefined` or `null` only according to the repository’s established
  convention.
- Do not rely on truthiness when valid values may include `0`, `false`, or an
  empty string.

Handle promises explicitly. Await, return, or intentionally observe each
promise; do not allow meaningful failures to become unhandled rejections.

Caught JavaScript values are not guaranteed to be `Error` instances. Narrow or
normalize a caught value before reading its properties.

Add context when an error crosses a boundary, while preserving the original
cause when useful. Do not catch an error merely to ignore it or log and rethrow
it without adding information.

Do not expose credentials, tokens, private paths, or sensitive user data in
errors, logs, or serialized responses.

## Testing

Add or update tests when behavior changes. Bug fixes should normally include a
regression test.

Test runtime behavior independently from static typing. Passing the TypeScript
compiler does not establish that external data, asynchronous behavior, or
business logic is correct.

Use the test level that matches the behavior:

- unit tests for focused functions and modules
- integration tests for module, persistence, API, or process boundaries
- end-to-end tests for critical user-visible workflows
- type tests for public generic APIs or declaration behavior when the project
  supports them

Cover material success, failure, and boundary cases. Include malformed external
data when validation behavior changes.

Prefer tests that assert observable behavior rather than private implementation
details. Keep tests deterministic by controlling time, randomness, environment,
and external services where practical.

Run the type checker, lint rules, and tests relevant to the affected packages
before reporting completion.

## References

- [TypeScript `strict` option](https://www.typescriptlang.org/tsconfig/strict)
- [TypeScript: erased types](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html#erased-types)
- [TypeScript narrowing and discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript `unknown` and `any`](https://www.typescriptlang.org/docs/handbook/basic-types.html#unknown)
- [TypeScript declaration-file guidance](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [TypeScript `exactOptionalPropertyTypes`](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
- [TypeScript `noUncheckedIndexedAccess`](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
- [TypeScript `satisfies` operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html)
- [TypeScript modules](https://www.typescriptlang.org/docs/handbook/modules.html)
- [typescript-eslint shared configurations](https://typescript-eslint.io/users/configs/)
