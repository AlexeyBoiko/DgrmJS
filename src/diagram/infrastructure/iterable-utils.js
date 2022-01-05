/**
 * get last item
 * @template Tkey
 * @template TVal
 * @param {Map<Tkey, TVal>} map
 * @param {{(key: Tkey, elem:TVal) :boolean}=} filter
 * @returns {{key: Tkey, val:TVal}}
 */
export function lastIn(map, filter) {
	if (!map) { return null; }

	const last = {
		key: null,
		val: null
	};
	for (const key of map.keys()) {
		const val = map.get(key);
		if (!filter || filter(key, val)) {
			last.key = key;
			last.val = val;
		}
	}
	return last;
}

/**
 * get last item
 * @template Tkey
 * @template TVal
 * @param {Map<Tkey, TVal>} map
 * @param {{(key: Tkey, elem:TVal) :boolean}=} filter
 * @returns {number}
 */
export function countIn(map, filter) {
	if (!map) { return 0; }

	if (!filter) { return map.size; }

	let count = 0;
	for (const key of map.keys()) {
		if (!filter || filter(key, map.get(key))) {
			count++;
		}
	}
	return count;
}
