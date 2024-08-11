/**
	@see https://stackoverflow.com/q/62573985/12581865
*/
export type RecursivelyRemoveNeverProperties<T> = T extends Record<
	string | number | symbol,
	unknown
> ? FilteredKeys<
		{
			[K in keyof T]: RecursivelyRemoveNeverProperties<T[K]>;
		}
	> extends never ? never :
	Pick<DecayNeverType<T>, FilteredKeys<DecayNeverType<T>>> :
	T;

type DecayNeverType<T> = {
	[K in keyof T]: RecursivelyRemoveNeverProperties<T[K]>;
};

/** Returns a union of all keys of `T` where `T[K]` is not `never` */
type FilteredKeys<T> = {
	[K in keyof T]: T[K] extends never ? never : K;
}[keyof T];
