# Releasing

Version preparation and publishing are separate manual actions on `main`. Run **Version Packages** to prepare versions and changelogs with Changesets, then **Publish** to publish the prepared version. Merging changes does not trigger either workflow.

## Release requirements

- Use the Node version in `.nvmrc` and the npm version declared in `package.json`. Install dependencies with `npm ci`.
- Review all changes since the previous release. Confirm the release scope, public exports, peer compatibility, runtime requirements, documentation, and any migration instructions.
- Ensure `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm run test:all`, and `npm run build` pass, along with CI for the commit being released.
- Enable **Allow GitHub Actions to create and approve pull requests** in repository Actions settings. Configure an `NPM_TOKEN` repository secret with permission to publish the package.

## Prepare a release

1. Run `npm run changeset` on your change branch. Choose patch for fixes, minor for compatible additions, or major for breaking changes, and describe the changes for the changelog.
2. Commit the generated `.changeset/*.md` file with the changes and merge to `main`.
3. When ready to prepare a release, open GitHub **Actions → Version Packages → Run workflow**, select **main**, and run it. The [Version Packages workflow](../.github/workflows/release.yml) creates or updates the version PR and skips other branches. Review its proposed version and changelog against the intended release scope.
4. Confirm CI passes and merge the version PR. The package version is now prepared for publication.

Check `.changeset/pre.json` before preparing versions. If prerelease mode is active, follow the [prerelease process](#prereleases) for the intended release channel. For an already prepared, unpublished version, proceed directly to publishing.

## Publish a release

1. Check out the prepared `main` commit, run `npm ci`, and confirm CI passes for that commit.
2. Verify that version preparation is complete, build the package, inspect its contents, and check the publication plan:

   ```sh
   node scripts/check-release-prepared.mjs
   npm run build
   npm pack --dry-run
   npm run changeset -- publish-plan
   ```

3. Confirm the package contains the expected JS, declarations, and CSS. Check that the plan names the intended unpublished package version, public access, and npm dist-tag (`latest` for a stable release).
4. Open GitHub **Actions → Publish → Run workflow**, select **main**, and run it. The [Publish workflow](../.github/workflows/publish.yml) rejects pending version preparation and skips other branches; empty changesets do not block publication.
5. Confirm the workflow succeeds and the expected npm version, dist-tags, Git tag, and GitHub release exist. Check npm dist-tags with `npm view @intermezzo-chess/chessground-react dist-tags`.

## Prereleases

### Enter prerelease mode

If `.changeset/pre.json` already has `"mode": "pre"` with the intended tag, start at step 3.

1. Choose a channel, such as `alpha`, and run `npm run changeset -- pre enter alpha` on a branch based on `main`.
2. Commit `.changeset/pre.json` and merge it to `main` before preparing versions. Entering prerelease mode does not change the package version or publish anything.
3. Follow [Prepare a release](#prepare-a-release) for each prerelease. Confirm the proposed version has the intended prerelease suffix. Changesets retains versioned changesets in `.changeset/pre/` for the eventual stable changelog.
4. Follow [Publish a release](#publish-a-release) when ready to publish the prepared prerelease. Check its npm dist-tag explicitly: a prerelease suffix alone does not establish the publication channel.

npm can assign `latest` on a package's first publication. When only prerelease versions exist and `latest` is assigned, Changesets can plan subsequent prereleases under `latest` as well. Review the publish plan before publishing and registry dist-tags afterward.

### Return to stable releases

1. On a branch based on the latest `main`, run `npm run changeset -- pre exit`. This sets `"mode": "exit"` in `.changeset/pre.json`; it does not change the package version or publish anything.
2. Commit `.changeset/pre.json` and merge it to `main`. Preserve `.changeset/pre/` until Changesets consumes the retained history.
3. Open GitHub **Actions → Version Packages → Run workflow**, select **main**, and run it. Review the resulting version PR. Confirm the proposed stable version has no prerelease suffix, its changelog includes the relevant prerelease history and queued changes, and it removes consumed prerelease state and changesets. Confirm CI passes and merge it.
4. Follow [Publish a release](#publish-a-release), checking that the stable publication plan uses `latest`.

See the [Changesets prerelease guide](https://changesets.dev/guide/prereleases) for the upstream lifecycle.
