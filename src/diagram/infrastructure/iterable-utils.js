/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {{(el:T) :boolean}=} filter
 * @returns {T}
 */
export function last(iterable, filter) {
	if (!iterable) { return null; }

	let last;
	for (const el of iterable) {
		if (!filter || filter(el)) {
			last = el;
		}
	}
	return last;
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {{(el:T) :boolean}=} filter
 * @returns {T | null}
 */
export function first(iterable, filter) {
	for (const el of iterable) {
		if (!filter || filter(el)) { return el; }
	}
	return null;
}

/**
 * @template T
 * @param {Iterable<T>} iterable
 * @param {{(el:T) :boolean}=} filter
 * @returns {boolean}
 */
export function any(iterable, filter) {
	if (!iterable) { return false; }

	for (const el of iterable) {
		if (!filter || filter(el)) {
			return true;
		}
	}
	return false;
}

// /**
//  * @template T
//  * @template TRes
//  * @param {Iterable<T>} iterable
//  * @param {(el:T) => TRes} mapFn
//  * @returns {Array<TRes>}
//  */
// export function map(iterable, mapFn) {
// 	const res = [];
// 	for (const el of iterable) {
// 		res.push(mapFn(el));
// 	}
// 	return res;
// }

/**
 * @template T
 * @param {Set<T>} set
 * @param {T} el
 * @returns {Set<T>}
 */
export function setDel(set, el) {
	set.delete(el);
	return set;
}
