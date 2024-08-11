// This needs to be a re-export instead of a rewrite so that we don't auto-redirect the user to the dashboard if they're logged in (which is what the "/" route does by default)
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This is a re-export, not a relative import
import { default as LandingPage } from '../page.tsx';

export default async function AliasedLandingPage() {
	return <LandingPage shouldRedirectOnLoggedIn={false} />;
}
