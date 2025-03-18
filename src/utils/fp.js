/**
 * Core functional programming utilities
 */

// Function composition (right to left)
export const compose =
	(...fns) =>
	(x) =>
		fns.reduceRight((acc, fn) => fn(acc), x);

// Function composition (left to right)
export const pipe =
	(...fns) =>
	(x) =>
		fns.reduce((acc, fn) => fn(acc), x);

// Curry function implementation
export const curry = (fn) => {
	const arity = fn.length;
	return function curried(...args) {
		if (args.length >= arity) {
			return fn(...args);
		}
		return (...moreArgs) => curried(...args, ...moreArgs);
	};
};

// Partial application
export const partial =
	(fn, ...args) =>
	(...moreArgs) =>
		fn(...args, ...moreArgs);

// Map implementation for various data types
export const map = curry((fn, functor) => functor.map(fn));

// Chain/flatMap implementation
export const chain = curry((fn, monad) => monad.chain(fn));

// Tap for side effects in pipelines
export const tap = curry((fn, x) => {
	fn(x);
	return x;
});

// Safe property access
export const prop = curry((key, obj) => obj?.[key]);
