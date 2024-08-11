import tunnelMessages from '#messages/_.ts';
import type { TunnelMessageData } from '#types';
import type { ProcedureError } from '@-/errors';
import type { Result } from 'errok';
import mapObject from 'map-obj';
import { type ExternalToast, toast as sonnerToast } from 'sonner';
import type { SetReturnType } from 'type-fest';

export const toast = {
	...sonnerToast,
	...mapObject(tunnelMessages, (key, getValues) => {
		return [
			key,
			(args: any) => {
				const messageData = getValues(args) as TunnelMessageData;
				if (messageData.variant === 'message') {
					return toast.message(
						messageData.title,
						{
							description: messageData.description,
						},
					);
				} else {
					return toast.error(
						messageData.title,
						{
							description: messageData.description,
						},
					);
				}
			},
		];
	}),
	promise<$Promise extends Promise<Result<any, any>>>(
		promise: $Promise,
		data: PromiseData<$Promise>,
	): string | number {
		return sonnerToast.promise(
			// @ts-expect-error: todo
			new Promise((resolve, reject) => {
				promise.then((result) =>
					result.isErr() ? reject(result.error) : resolve(result.value)
				).catch(reject);
			}),
			data,
		);
	},
	procedureError(result) {
		if (result.isErr()) {
			return sonnerToast.error(result.error.message);
		}
	},
} as
	& Pick<
		typeof sonnerToast,
		| 'success'
		| 'info'
		| 'warning'
		| 'error'
		| 'custom'
		| 'message'
		| 'promise'
		| 'dismiss'
		| 'loading'
	>
	& {
		[$Message in keyof typeof tunnelMessages]: SetReturnType<
			typeof tunnelMessages[$Message],
			ReturnType<typeof sonnerToast>
		>;
	}
	& {
		procedureError(
			result: Result<any, ProcedureError<any>>,
		): ReturnType<typeof sonnerToast.error>;
	};

type PromiseData<$Promise extends Promise<Result<any, any>>> = ExternalToast & {
	loading?: string | React.ReactNode;
	success?:
		| string
		| React.ReactNode
		| ((
			data: Awaited<$Promise> extends Result<infer $Value, any> ? $Value :
				never,
		) => React.ReactNode | string);
	error?:
		| string
		| React.ReactNode
		| ((
			error: Awaited<$Promise> extends Result<any, infer $Error> ? $Error :
				never,
		) => React.ReactNode | string);
	finally?: () => void | Promise<void>;
};
