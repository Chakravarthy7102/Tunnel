import type { ServerDoc } from '@-/database';
import type { Project_$dashboardPageData } from '@-/database/selections';
import type { OrganizationMember_$dashboardPageData } from '@-/organization-member/selections';
import type { Organization_$dashboardPageData } from '@-/organization/selections';

export interface StepScreenProps {
	onContinue(): void;
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$dashboardPageData
	>;
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	project: ServerDoc<typeof Project_$dashboardPageData> | null;
}
