import { createTnlProperty } from './property.ts';
import { tnlProperties } from './tnl-aliases.ts';

export const idpState = createTnlProperty(tnlProperties.idpState, () => ({
	idp: [] as any[],
	nextIdpId: 0,
}));
