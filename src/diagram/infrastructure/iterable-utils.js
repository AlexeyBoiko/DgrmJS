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
//  * @param {Iterable<T>} iterable
//  * @param {{(el:T) :boolean}} filter
//  * @returns {number}
//  */
// export function count(iterable, filter) {
// 	if (!iterable) { return 0; }

// 	let count = 0;
// 	for (const el of iterable) {
// 		if (!filter || filter(el)) {
// 			count++;
// 		}
// 	}
// 	return count;
// }
