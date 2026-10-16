# Releasing

The first publication is planned as **1.0.0**, after [#5: Upgrade Chessground to the latest stable release](https://github.com/intermezzo-chess/intermezzo-chessground/issues/5) is complete. Do not run **Publish** before then. Alpha version preparation can happen without publishing to npm; this release hold is a maintainer decision and is not enforced by the workflow.

## Steps

1. Run `npm run changeset`; select the version bump and describe the changes.
2. Commit the generated `.changeset/*.md` file with your changes.
3. Merge to `main`; wait for the [Version Packages workflow](../.github/workflows/release.yml) to open or update the version PR.
4. Review the version and changelog in the **Version Packages** PR; merge it.
5. Confirm CI passes on the `main` commit you intend to publish.
6. Open GitHub **Actions → Publish → Run workflow**, select **main**, and run it.
7. Confirm the [Publish workflow](../.github/workflows/publish.yml) succeeds and the expected npm version, Git tag, and GitHub release exist.

For an already prepared, unpublished version, start at step 5. Merging to `main` never publishes.

## Prerelease mode

The repository currently uses alpha prerelease mode: `.changeset/pre.json` contains `"mode": "pre"` and `"tag": "alpha"`. Follow steps 1–4 above to prepare alpha versions. Changesets moves versioned changesets into `.changeset/pre/` and retains them for the eventual stable changelog. Keep this history until Changesets consumes it during stable version preparation.

For a future prerelease cycle, run `npm run changeset -- pre enter alpha` on a branch based on `main`, then commit `.changeset/pre.json` and merge it before preparing versions. Do not run this command while already in prerelease mode. Entering prerelease mode does not change the package version or publish anything.

If prerelease publication is intended in a future cycle, follow steps 5–7 after version preparation. Check `npm run changeset -- publish-plan` first: an alpha version suffix does not guarantee an alpha-only npm dist-tag. npm can assign `latest` on a package's first publication, and Changesets can subsequently plan prereleases under `latest` when only prerelease versions exist.

### Preparing stable 1.0.0

After #5 is complete and its changes are merged:

1. On a branch based on the latest `main`, run `npm run changeset -- pre exit`. This changes `.changeset/pre.json` to `"mode": "exit"`; it does not prepare a stable version or publish anything.
2. Commit `.changeset/pre.json` and merge it to `main`. Keep the changesets in `.changeset/pre/`; do not delete the prerelease state by hand.
3. Wait for **Version Packages** to create or update the version PR. Confirm it prepares **1.0.0** without an alpha suffix, includes #5 and the retained prerelease history in the changelog, and removes the consumed prerelease state and changesets. Review CI and merge the version PR.
4. On the prepared `main` commit, run `npm run changeset -- publish-plan`. Confirm `@intermezzo-chess/chessground-react@1.0.0`, public access, and the `latest` dist-tag, then follow steps 5–7 above.

See the [Changesets prerelease guide](https://changesets.dev/guide/prereleases) for the upstream lifecycle.

## Release considerations

- **Scope:** include a changeset for each change that should ship; review all changes since the previous release.
- **Version:** choose patch for fixes, minor for compatible additions, and major for breaking changes; document migration steps when needed.
- **Release channel:** check `.changeset/pre.json` and the publish plan. Follow the [prerelease steps](#prerelease-mode) before preparing a stable release.
- **Compatibility:** review public exports, peer dependencies, React support, and changes to runtime requirements.
- **Documentation:** update README examples and API documentation for changed behavior; review the generated changelog.
- **Checks:** run `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test:all`, and `npm run build` from the repository root.
- **Package contents:** run `npm pack --dry-run` after building; check JS, declarations, and CSS in `dist/`.
- **Publish plan:** on the prepared `main` commit, run `npx changeset publish-plan`; check the package, version, and npm dist-tag it reports.
- **Publish target:** the workflow publishes the selected `main` commit using the version in `package.json`; ensure that version is prepared and unpublished. Pending version changes block publishing; empty changesets do not. Other branches are skipped.
- **Setup:** enable **Allow GitHub Actions to create and approve pull requests** in repository Actions settings; configure an `NPM_TOKEN` repository secret with permission to publish the package. The Publish workflow passes it to npm as `NODE_AUTH_TOKEN` through `actions/setup-node`.
