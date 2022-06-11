/**
 * @template T
 * @param {Set<T>} set
 * @param {{(el:T) :boolean}} filter
 * @returns {void}
 */
export function setFilter(set, filter) {
	const toDel = [];
	for (const el of set) {
		if (filter(el)) { toDel.push(el); }
	}

	for (const el of toDel) {
		set.delete(el);
	}
}
