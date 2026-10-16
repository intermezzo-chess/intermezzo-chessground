// Fails when the Version Packages PR still has releases to prepare. Consumed
// prerelease changesets and empty changesets plan no releases, so they pass.
import { getReleasePlan } from '@changesets/get-release-plan';

const { releases } = await getReleasePlan(process.cwd());

if (releases.length > 0) {
  const pending = releases.map(({ name, newVersion }) => `${name}@${newVersion}`).join(', ');
  console.error(`Pending release preparation: ${pending}`);
  console.error('Merge the Version Packages PR before publishing.');
  process.exit(1);
}

console.log('[check-release-prepared] no pending release preparation');
