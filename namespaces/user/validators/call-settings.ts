import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const callSettingsValidator = v.object({
	microphoneDeviceId: vNullable(v.string()),
	microphoneDeviceName: vNullable(v.string()),
	speakerDeviceId: vNullable(v.string()),
	speakerDeviceName: vNullable(v.string()),
	videoDeviceId: vNullable(v.string()),
	videoDeviceName: vNullable(v.string()),
});
