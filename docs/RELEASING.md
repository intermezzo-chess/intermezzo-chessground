# Releasing

## Steps

1. Run `npm run changeset`; select the version bump and describe the changes.
2. Commit the generated `.changeset/*.md` file with your changes.
3. Merge to `main`; wait for the [Version Packages workflow](../.github/workflows/release.yml) to open or update the version PR.
4. Review the version and changelog in the **Version Packages** PR; merge it.
5. Confirm CI passes on the `main` commit you intend to publish.
6. Open GitHub **Actions → Publish → Run workflow**, select **main**, and run it.
7. Confirm the [Publish workflow](../.github/workflows/publish.yml) succeeds and the expected npm version, Git tag, and GitHub release exist.

For an already prepared, unpublished version, start at step 5. Merging to `main` never publishes.

## Release considerations

- **Scope:** include a changeset for each change that should ship; review all changes since the previous release.
- **Version:** choose patch for fixes, minor for compatible additions, and major for breaking changes; document migration steps when needed.
- **Release channel:** check `.changeset/pre.json`. While `mode` is `pre` and `tag` is `alpha`, releases remain alpha prereleases.
- **Compatibility:** review public exports, peer dependencies, React support, and changes to runtime requirements.
- **Documentation:** update README examples and API documentation for changed behavior; review the generated changelog.
- **Checks:** run `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test:all`, and `npm run build` from the repository root.
- **Package contents:** run `npm pack --dry-run` after building; check JS, declarations, and CSS in `dist/`.
- **Publish target:** the workflow publishes the selected `main` commit using the version in `package.json`; ensure that version is prepared and unpublished. Pending version changes block publishing; other branches are skipped.
- **Setup:** enable **Allow GitHub Actions to create and approve pull requests** in repository Actions settings; configure an `NPM_TOKEN` repository secret with permission to publish the package.
