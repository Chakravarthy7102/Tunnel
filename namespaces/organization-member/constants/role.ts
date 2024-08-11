export const OrganizationMemberRoleInput = {
	guestOnly: {
		guest: true,
		member: false,
		admin: false,
		owner: false,
	},
	guestOrMember: {
		guest: true,
		member: true,
		admin: false,
		owner: false,
	},
	guestOrHigher: {
		guest: true,
		member: true,
		admin: true,
		owner: true,
	},
	adminOrHigher: {
		guest: false,
		member: false,
		admin: true,
		owner: true,
	},
	memberOrHigher: {
		guest: false,
		member: true,
		admin: true,
		owner: true,
	},
	ownerOnly: {
		guest: false,
		member: false,
		admin: false,
		owner: true,
	},
	adminOrOwner: {
		guest: false,
		member: false,
		admin: true,
		owner: true,
	},
	notOwner: {
		guest: true,
		member: true,
		admin: true,
		owner: false,
	},
};
